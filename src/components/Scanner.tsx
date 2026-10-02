import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Check, Copy, ExternalLink, ImageUp, RefreshCw, RotateCcw, ShieldAlert, X } from "lucide-react";
import { btnPrimary, btnSecondary, card } from "./ui";
import { copyText } from "../lib/browser";
import { classify, parseWifi, safeHref } from "../lib/safe";

type Status = "idle" | "starting" | "scanning" | "error";
type Facing = "environment" | "user";

const MAX_FILE = 15 * 1024 * 1024;

function decodeImageData(data: ImageData) {
  return jsQR(data.data, data.width, data.height, { inversionAttempts: "attemptBoth" });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be read as an image."));
    };
    img.src = url;
  });
}

async function scanFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (PNG, JPG, WEBP…).");
  if (file.size > MAX_FILE) throw new Error("Image is too large. Please use a file under 15 MB.");
  const img = await loadImage(file);
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  if (!nw || !nh) throw new Error("This image appears to be empty.");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  // try several sizes: large photos sometimes decode better when scaled down
  const tried = new Set<string>();
  for (const max of [1600, 1000, 640, 2400]) {
    const scale = Math.min(1, max / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));
    if (tried.has(w + "x" + h)) continue;
    tried.add(w + "x" + h);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const code = decodeImageData(ctx.getImageData(0, 0, w, h));
    if (code && code.data) return code.data;
  }
  throw new Error("No QR code found in this image. Try a sharper, well-lit picture with the whole code visible.");
}

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const aliveRef = useRef(true);

  const [status, setStatus] = useState<Status>("idle");
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  const found = useCallback((text: string) => {
    setResult(text);
    setHistory((h) => [text, ...h.filter((x) => x !== text)].slice(0, 5));
  }, []);

  const startCamera = useCallback(
    async (mode: Facing) => {
      stopCamera();
      setError("");
      setResult(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("error");
        setError(
          window.isSecureContext
            ? "Your browser does not support camera access. Try uploading an image instead."
            : "Camera access needs a secure (HTTPS) connection. Try uploading an image instead.",
        );
        return;
      }
      setStatus("starting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!aliveRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stopCamera();
          return;
        }
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();
        setStatus("scanning");

        if (!workRef.current) workRef.current = document.createElement("canvas");
        const work = workRef.current;
        const ctx = work.getContext("2d", { willReadFrequently: true });
        let last = 0;

        const tick = (now: number) => {
          if (!streamRef.current) return;
          rafRef.current = requestAnimationFrame(tick);
          if (now - last < 120) return;
          last = now;
          const v = videoRef.current;
          if (!v || !ctx || v.readyState < 2 || !v.videoWidth) return;
          const scale = Math.min(1, 720 / v.videoWidth);
          const w = Math.round(v.videoWidth * scale);
          const h = Math.round(v.videoHeight * scale);
          if (work.width !== w) work.width = w;
          if (work.height !== h) work.height = h;
          ctx.drawImage(v, 0, 0, w, h);
          const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
          if (code && code.data) {
            stopCamera();
            setStatus("idle");
            found(code.data);
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        stopCamera();
        const name = e instanceof DOMException ? e.name : "";
        setStatus("error");
        if (name === "NotAllowedError" || name === "SecurityError")
          setError("Camera permission was blocked. Allow camera access in your browser settings, or upload an image instead.");
        else if (name === "NotFoundError" || name === "OverconstrainedError")
          setError("No camera was found on this device. You can upload a QR image instead.");
        else if (name === "NotReadableError") setError("The camera is in use by another app. Close it and try again.");
        else setError("Could not start the camera. Try again or upload an image instead.");
      }
    },
    [found, stopCamera],
  );

  const flip = () => {
    const next: Facing = facing === "environment" ? "user" : "environment";
    setFacing(next);
    void startCamera(next);
  };

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    stopCamera();
    setStatus("idle");
    setError("");
    setBusy(true);
    try {
      const text = await scanFile(file);
      if (aliveRef.current) found(text);
    } catch (e) {
      if (aliveRef.current) {
        setResult(null);
        setError(e instanceof Error ? e.message : "Could not read this image.");
      }
    } finally {
      if (aliveRef.current) setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const camActive = status === "scanning" || status === "starting";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* viewer */}
      <div className={card + " overflow-hidden p-4 sm:p-5"}>
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-green-950 sm:aspect-[4/3] lg:aspect-square">
          <video
            ref={videoRef}
            muted
            playsInline
            className={"h-full w-full object-cover " + (facing === "user" ? "-scale-x-100 " : "") + (camActive ? "" : "invisible")}
          />
          {status === "scanning" && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2">
                <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-green-400" />
                <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-green-400" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-green-400" />
                <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-green-400" />
                <span className="scanline absolute left-2 right-2 h-0.5 bg-green-400/80 shadow-[0_0_12px_2px_rgba(74,222,128,.7)]" />
              </div>
            </div>
          )}
          {status === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-green-100">Starting camera…</div>
          )}
          {!camActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              {status === "error" ? <CameraOff className="text-green-300" size={44} /> : <Camera className="text-green-300" size={44} />}
              <p className="max-w-xs text-sm text-green-100/90">
                {status === "error" ? error : "Point your camera at a QR code. The scan happens on your device — no video leaves your browser."}
              </p>
              <button type="button" className={btnPrimary + " !bg-green-400 !text-green-950 hover:!bg-green-300"} onClick={() => void startCamera(facing)}>
                <Camera size={18} /> {status === "error" ? "Try again" : "Start camera"}
              </button>
            </div>
          )}
        </div>

        {camActive && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} onClick={flip}>
              <RefreshCw size={16} /> Switch camera
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                stopCamera();
                setStatus("idle");
              }}
            >
              <X size={16} /> Stop
            </button>
          </div>
        )}

        {/* upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={
            "mt-4 rounded-xl border-2 border-dashed p-5 text-center transition " +
            (dragging
              ? "border-green-600 bg-green-50 dark:bg-green-500/10"
              : "border-green-900/20 hover:border-green-700/50 dark:border-white/15")
          }
        >
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="qr-upload" onChange={(e) => void handleFile(e.target.files?.[0])} />
          <ImageUp className="mx-auto text-green-800 dark:text-green-400" size={28} />
          <p className="mt-2 text-sm font-semibold text-green-950 dark:text-white">Upload a QR image</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Drag &amp; drop or choose a file — decoded locally, never uploaded.</p>
          <button type="button" className={btnSecondary + " mt-3"} disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "Reading…" : "Choose image"}
          </button>
        </div>
        {status !== "error" && error && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </div>

      {/* result */}
      <div className="flex flex-col gap-4">
        {result ? (
          <ResultCard
            text={result}
            onAgain={() => {
              setResult(null);
              void startCamera(facing);
            }}
          />
        ) : (
          <div className={card + " flex min-h-[220px] flex-1 flex-col items-center justify-center p-8 text-center"}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-400">
              <Camera size={26} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-green-950 dark:text-white">Your scan result will appear here</h3>
            <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              Start the camera or upload an image. You can then copy the content or open it.
            </p>
          </div>
        )}

        {history.length > 1 && (
          <div className={card + " p-4"}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-green-900/70 dark:text-green-200/70">This session</h3>
            <ul className="mt-2 divide-y divide-green-900/10 dark:divide-white/10">
              {history.map((h) => (
                <li key={h}>
                  <button
                    type="button"
                    onClick={() => setResult(h)}
                    className="w-full truncate py-2 text-left text-sm text-gray-700 hover:text-green-800 dark:text-gray-300 dark:hover:text-green-400"
                  >
                    {h}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">History is kept in memory only and disappears when you close the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ text, onAgain }: { text: string; onAgain: () => void }) {
  const [copied, setCopied] = useState<string>("");
  const kind = classify(text);
  const href = safeHref(text);
  const wifi = parseWifi(text);

  const doCopy = async (value: string, id: string) => {
    if (await copyText(value)) {
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1800);
    }
  };

  return (
    <div className={card + " p-5 sm:p-6"} aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900 dark:bg-green-500/15 dark:text-green-300">
          <Check size={14} /> QR scanned · {kind}
        </span>
        <button type="button" onClick={onAgain} className="inline-flex items-center gap-1.5 text-sm font-medium text-green-800 hover:underline dark:text-green-400">
          <RotateCcw size={14} /> Scan again
        </button>
      </div>

      {wifi ? (
        <dl className="mt-4 space-y-3 rounded-xl bg-green-50/70 p-4 text-sm dark:bg-white/5">
          <div>
            <dt className="text-xs text-gray-500">Network</dt>
            <dd className="break-all font-semibold text-green-950 dark:text-white">{wifi.ssid}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Security</dt>
            <dd className="font-medium text-green-950 dark:text-white">{wifi.security === "nopass" ? "Open (no password)" : wifi.security}</dd>
          </div>
          {wifi.password && (
            <div>
              <dt className="text-xs text-gray-500">Password</dt>
              <dd className="break-all font-mono font-medium text-green-950 dark:text-white">{wifi.password}</dd>
            </div>
          )}
        </dl>
      ) : (
        <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-green-50/70 p-4 font-sans text-sm leading-relaxed text-green-950 dark:bg-white/5 dark:text-gray-100">
          {text}
        </pre>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={() => void doCopy(text, "all")}>
          {copied === "all" ? <Check size={16} /> : <Copy size={16} />} {copied === "all" ? "Copied!" : "Copy"}
        </button>
        {wifi?.password && (
          <button type="button" className={btnSecondary} onClick={() => void doCopy(wifi.password, "pw")}>
            {copied === "pw" ? <Check size={16} /> : <Copy size={16} />} {copied === "pw" ? "Copied!" : "Copy password"}
          </button>
        )}
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={btnSecondary}>
            <ExternalLink size={16} /> Open
          </a>
        )}
      </div>

      {kind === "URL" && (
        <p className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" /> Check the address carefully before opening links from QR codes.
        </p>
      )}
      {!href && kind !== "Wi-Fi" && kind !== "Text" && kind !== "Contact card" && (
        <p className="mt-3 text-xs text-gray-500">This content can’t be opened directly, but you can copy it.</p>
      )}
    </div>
  );
}

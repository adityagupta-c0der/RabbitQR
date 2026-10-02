import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Contact,
  Copy,
  Download,
  ImagePlus,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode,
  Sparkles,
  Trash2,
  Type,
  Wifi,
} from "lucide-react";
import { btnPrimary, btnSecondary, card, inputCls, labelCls } from "./ui";
import { copyImage, saveBlob } from "../lib/browser";
import {
  TYPES,
  buildContent,
  buildQrSvg,
  contrastRatio,
  rasterize,
  svgToDataUrl,
  type DotStyle,
  type Ecl,
  type EyeStyle,
  type FieldSpec,
  type QrType,
} from "../lib/qr";

const ICONS: Record<QrType, typeof Link2> = {
  url: Link2,
  text: Type,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  wifi: Wifi,
  vcard: Contact,
  location: MapPin,
};

const PRESETS = ["#14532d", "#111827", "#1e3a8a", "#6b21a8", "#b91c1c", "#0f766e", "#c2410c"];
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const SIZES = [512, 1024, 2048, 4096];

interface Design {
  fg: string;
  bg: string;
  eyeColor: string;
  eyeSame: boolean;
  transparent: boolean;
  dot: DotStyle;
  eye: EyeStyle;
  ecl: Ecl;
  margin: number;
  logo: string | null;
  frame: boolean;
  frameText: string;
}

const DEFAULT_DESIGN: Design = {
  fg: "#14532d",
  bg: "#ffffff",
  eyeColor: "#14532d",
  eyeSame: true,
  transparent: false,
  dot: "square",
  eye: "square",
  ecl: "M",
  margin: 3,
  logo: null,
  frame: false,
  frameText: "SCAN ME",
};

type Panel = "colors" | "shape" | "logo" | "frame";
const PANELS: { id: Panel; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "shape", label: "Shape" },
  { id: "logo", label: "Logo" },
  { id: "frame", label: "Frame" },
];

function Seg<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={
            "rounded-lg border px-3.5 py-2 text-sm font-medium transition " +
            (value === o.value
              ? "border-green-800 bg-green-800 text-white dark:border-green-500 dark:bg-green-500 dark:text-green-950"
              : "border-green-900/15 bg-white text-gray-700 hover:bg-green-50 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 shrink-0" aria-label={label} />
      <span className="text-sm">
        <span className="block font-medium text-green-950 dark:text-white">{label}</span>
        <span className="font-mono text-xs uppercase text-gray-500">{value}</span>
      </span>
    </label>
  );
}

function Field({ spec, value, onChange }: { spec: FieldSpec; value: string; onChange: (v: string) => void }) {
  const id = "f-" + spec.key;
  return (
    <div className={spec.half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label htmlFor={id} className={labelCls}>
        {spec.label}
        {spec.required && <span className="text-red-600"> *</span>}
      </label>
      {spec.type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          maxLength={spec.max}
          value={value}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls + " resize-y"}
        />
      ) : spec.type === "select" ? (
        <select id={id} value={value || spec.options?.[0].value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {spec.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={spec.type === "password" ? "text" : spec.type ?? "text"}
          maxLength={spec.max}
          value={value}
          placeholder={spec.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

export function Generator() {
  const [type, setType] = useState<QrType>("url");
  const [fields, setFields] = useState<Record<string, Record<string, string>>>({});
  const [d, setD] = useState<Design>(DEFAULT_DESIGN);
  const [panel, setPanel] = useState<Panel>("colors");
  const [generated, setGenerated] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  const spec = TYPES.find((t) => t.id === type)!;
  const current = fields[type] ?? {};
  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [type]: { ...(f[type] ?? {}), [k]: v } }));
  const patch = (p: Partial<Design>) => setD((s) => ({ ...s, ...p }));

  const eyeColor = d.eyeSame ? d.fg : d.eyeColor;

  const built = useMemo(() => {
    if (!generated) return null;
    try {
      const q = buildQrSvg({
        text: generated,
        margin: d.margin,
        fg: d.fg,
        bg: d.bg,
        eyeColor,
        transparent: d.transparent,
        ecl: d.ecl,
        dot: d.dot,
        eye: d.eye,
        logo: d.logo,
        frame: d.frame,
        frameText: d.frameText,
      });
      return { q, url: svgToDataUrl(q.svg), error: "" };
    } catch {
      return { q: null, url: "", error: "This content is too long to fit in a QR code. Please shorten it." };
    }
  }, [generated, d, eyeColor]);

  const live = buildContent(type, current);
  const stale = generated !== null && (!live.ok || live.text !== generated);
  const contrast = contrastRatio(d.fg, d.bg);
  const inverted = !d.transparent && contrastRatio(d.fg, "#000000") > contrastRatio(d.bg, "#000000");

  const generate = () => {
    setNotice("");
    const r = buildContent(type, current);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    try {
      buildQrSvg({ ...d, eyeColor, text: r.text });
    } catch {
      setError("This content is too long to fit in a QR code. Please shorten it.");
      return;
    }
    setError("");
    setGenerated(r.text);
    window.setTimeout(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) document.getElementById("qr-preview")?.scrollIntoView({ block: "center" });
    }, 50);
  };

  const download = async (fmt: "png" | "jpg" | "svg") => {
    if (!built?.q || busy) return;
    setBusy(fmt);
    setNotice("");
    try {
      const name = `rabbitqr-${type}`;
      if (fmt === "svg") {
        saveBlob(new Blob([built.q.svg], { type: "image/svg+xml;charset=utf-8" }), name + ".svg");
      } else {
        const blob = await rasterize(built.q, size, fmt === "png" ? "image/png" : "image/jpeg", d.bg);
        saveBlob(blob, `${name}.${fmt}`);
      }
      setNotice(`Downloaded ${fmt.toUpperCase()} ✓`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Download failed. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const copyQr = async () => {
    if (!built?.q || busy) return;
    setBusy("copy");
    try {
      const blob = await rasterize(built.q, 1024, "image/png", d.bg);
      setNotice((await copyImage(blob)) ? "Image copied to clipboard ✓" : "Copying images isn’t supported here — use Download instead.");
    } catch {
      setNotice("Could not copy the image. Use Download instead.");
    } finally {
      setBusy("");
    }
  };

  const onLogo = (file: File | undefined) => {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return setNotice("Logo must be a PNG, JPG, WEBP or GIF image.");
    if (file.size > 1.5 * 1024 * 1024) return setNotice("Logo is too large. Please use an image under 1.5 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ logo: reader.result, ecl: "H" });
        setNotice("");
      }
    };
    reader.onerror = () => setNotice("Could not read that logo file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* controls */}
      <div className="flex flex-col gap-6 lg:col-span-3">
        <div className={card + " p-4 sm:p-6"}>
          <h3 className="text-sm font-semibold text-green-950 dark:text-white">1. Choose QR code type</h3>
          <div role="tablist" aria-label="QR code type" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TYPES.map((t) => {
              const Icon = ICONS[t.id];
              const active = t.id === type;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setType(t.id);
                    setError("");
                  }}
                  className={
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition " +
                    (active
                      ? "border-green-800 bg-green-800 text-white shadow-sm dark:border-green-500 dark:bg-green-500 dark:text-green-950"
                      : "border-green-900/15 bg-white text-gray-700 hover:border-green-700/40 hover:bg-green-50 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10")
                  }
                >
                  <Icon size={20} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-green-950 dark:text-white">2. Enter your content</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{spec.hint}</p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
          >
            {spec.fields.map((f) => (
              <Field key={type + f.key} spec={f} value={current[f.key] ?? ""} onChange={(v) => setField(f.key, v)} />
            ))}
            <button type="submit" className="sr-only" tabIndex={-1}>
              Generate
            </button>
          </form>
        </div>

        <div className={card + " p-4 sm:p-6"}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-green-950 dark:text-white">
            <Sparkles size={16} className="text-green-700 dark:text-green-400" /> 3. Customize design <span className="font-normal text-gray-500">(optional)</span>
          </h3>
          <div role="tablist" className="mt-3 flex gap-1 rounded-xl bg-green-50 p-1 dark:bg-white/5">
            {PANELS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={panel === p.id}
                onClick={() => setPanel(p.id)}
                className={
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (panel === p.id
                    ? "bg-white text-green-900 shadow-sm dark:bg-green-500 dark:text-green-950"
                    : "text-gray-600 hover:text-green-900 dark:text-gray-300 dark:hover:text-white")
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {panel === "colors" && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2" aria-label="Color presets">
                  {PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={"Use color " + c}
                      onClick={() => patch({ fg: c })}
                      style={{ backgroundColor: c }}
                      className={"h-8 w-8 rounded-full border-2 transition " + (d.fg === c ? "border-green-500 ring-2 ring-green-500/40" : "border-white dark:border-white/20")}
                    />
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="QR color" value={d.fg} onChange={(v) => patch({ fg: v })} />
                  <ColorField label="Background" value={d.bg} onChange={(v) => patch({ bg: v })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={d.eyeSame} onChange={(e) => patch({ eyeSame: e.target.checked })} className="h-4 w-4 accent-green-700" />
                  Use the same color for the corner eyes
                </label>
                {!d.eyeSame && <ColorField label="Eye color" value={d.eyeColor} onChange={(v) => patch({ eyeColor: v })} />}
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={d.transparent} onChange={(e) => patch({ transparent: e.target.checked })} className="h-4 w-4 accent-green-700" />
                  Transparent background (PNG &amp; SVG)
                </label>
                {(contrast < 3 || inverted) && (
                  <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    {contrast < 3
                      ? "Low contrast between QR and background — some scanners may fail to read it."
                      : "Light QR on a dark background may not scan on every device. Dark on light is safest."}
                  </p>
                )}
              </div>
            )}

            {panel === "shape" && (
              <div className="space-y-5">
                <div>
                  <span className={labelCls}>Pattern</span>
                  <Seg<DotStyle>
                    value={d.dot}
                    onChange={(v) => patch({ dot: v })}
                    options={[
                      { value: "square", label: "Square" },
                      { value: "rounded", label: "Rounded" },
                      { value: "dots", label: "Dots" },
                    ]}
                  />
                </div>
                <div>
                  <span className={labelCls}>Corner eyes</span>
                  <Seg<EyeStyle>
                    value={d.eye}
                    onChange={(v) => patch({ eye: v })}
                    options={[
                      { value: "square", label: "Square" },
                      { value: "rounded", label: "Rounded" },
                      { value: "circle", label: "Circle" },
                    ]}
                  />
                </div>
                <div>
                  <span className={labelCls}>Error correction</span>
                  <Seg<Ecl>
                    value={d.logo ? "H" : d.ecl}
                    onChange={(v) => patch({ ecl: v })}
                    options={[
                      { value: "L", label: "Low 7%" },
                      { value: "M", label: "Medium 15%" },
                      { value: "Q", label: "Quartile 25%" },
                      { value: "H", label: "High 30%" },
                    ]}
                  />
                  {d.logo && <p className="mt-1.5 text-xs text-gray-500">High is used automatically when a logo is added.</p>}
                </div>
                <div>
                  <label htmlFor="margin" className={labelCls}>
                    Quiet zone: {d.margin} modules
                  </label>
                  <input id="margin" type="range" min={0} max={8} step={1} value={d.margin} onChange={(e) => patch({ margin: Number(e.target.value) })} className="w-full accent-green-700" />
                </div>
              </div>
            )}

            {panel === "logo" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Add your logo to the center of the QR code. It stays on your device.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className={btnSecondary + " cursor-pointer"}>
                    <ImagePlus size={16} /> {d.logo ? "Change logo" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        onLogo(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {d.logo && (
                    <>
                      <img src={d.logo} alt="Logo preview" className="h-10 w-10 rounded-lg border border-green-900/15 object-contain" />
                      <button type="button" className={btnSecondary} onClick={() => patch({ logo: null })}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {panel === "frame" && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={d.frame} onChange={(e) => patch({ frame: e.target.checked })} className="h-4 w-4 accent-green-700" />
                  Add a frame with a call to action
                </label>
                {d.frame && (
                  <div>
                    <label htmlFor="frame-text" className={labelCls}>
                      Frame text
                    </label>
                    <input id="frame-text" maxLength={24} value={d.frameText} onChange={(e) => patch({ frameText: e.target.value })} className={inputCls} placeholder="SCAN ME" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* preview */}
      <div className="lg:col-span-2">
        <div id="qr-preview" className={card + " scroll-mt-24 p-4 sm:p-6 lg:sticky lg:top-24"}>
          <h3 className="text-sm font-semibold text-green-950 dark:text-white">4. Generate &amp; download</h3>

          <button type="button" className={btnPrimary + " mt-4 w-full !py-3.5 text-base"} onClick={generate}>
            <QrCode size={20} /> {generated ? "Update QR code" : "Generate QR code"}
          </button>
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <div
            className={
              "mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-green-900/10 p-3 dark:border-white/10 " +
              (d.transparent && built?.q ? "bg-[conic-gradient(#e5e7eb_25%,#fff_0_50%,#e5e7eb_0_75%,#fff_0)] bg-[length:16px_16px]" : "bg-green-50/60 dark:bg-white/5")
            }
          >
            {built?.q ? (
              <img src={built.url} alt="Generated QR code preview" className="max-h-full max-w-full object-contain" />
            ) : built?.error ? (
              <p className="px-4 text-center text-sm text-red-700 dark:text-red-300">{built.error}</p>
            ) : (
              <div className="px-6 text-center text-gray-500 dark:text-gray-400">
                <QrCode size={64} className="mx-auto text-green-800/30 dark:text-green-400/30" />
                <p className="mt-3 text-sm">Your QR code will appear here after you click <strong>Generate</strong>.</p>
              </div>
            )}
          </div>

          {stale && built?.q && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Content changed — click “Update QR code” to refresh the preview.</p>
          )}

          <div className="mt-5">
            <label htmlFor="size" className={labelCls}>
              Download size (PNG / JPG)
            </label>
            <select id="size" value={size} onChange={(e) => setSize(Number(e.target.value))} className={inputCls}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} × {s} px
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["png", "jpg", "svg"] as const).map((f) => (
              <button key={f} type="button" className={(f === "png" ? btnPrimary : btnSecondary) + " !px-3"} disabled={!built?.q || !!busy} onClick={() => void download(f)}>
                <Download size={16} /> {busy === f ? "…" : f.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className={btnSecondary + " mt-2 w-full"} disabled={!built?.q || !!busy} onClick={() => void copyQr()}>
            {notice.startsWith("Image copied") ? <Check size={16} /> : <Copy size={16} />} Copy image
          </button>
          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-gray-600 dark:text-gray-400">
            {notice || (built?.q ? "Free for personal and commercial use. Works offline in your browser." : "")}
          </p>
        </div>
      </div>
    </div>
  );
}

import { Camera, Lock, QrCode, ScanLine, ShieldCheck, Zap } from "lucide-react";
import { BRAND } from "../config";

export type Tab = "scanner" | "generator";

interface Props {
  tab: Tab;
  onSelect: (t: Tab) => void;
}

const CARDS: { id: Tab; title: string; desc: string; icon: typeof Camera; points: string[] }[] = [
  {
    id: "scanner",
    title: "QR Scanner",
    desc: "Scan with your camera or upload an image.",
    icon: ScanLine,
    points: ["Camera & image upload", "Copy or open result"],
  },
  {
    id: "generator",
    title: "QR Generator",
    desc: "Create QR codes and download them instantly.",
    icon: QrCode,
    points: ["URL, Wi-Fi, vCard & more", "PNG, JPG & SVG download"],
  },
];

export function Hero({ tab, onSelect }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-green-900/10 bg-gradient-to-b from-green-50/80 to-white dark:border-white/10 dark:from-[#0a1a10] dark:to-[#07120b]">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-green-900/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-green-900 dark:border-white/15 dark:bg-white/5 dark:text-green-300">
            <Lock size={13} /> 100% in your browser · No upload · No sign-up
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-green-950 sm:text-6xl dark:text-white">
            {BRAND.tagline.split(" ").map((w, i) => (
              <span key={i} className={i === 1 ? "text-green-700 dark:text-green-400" : ""}>
                {w}{" "}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
            {BRAND.name} is a free QR code scanner and generator. Pick a tool below and get started in seconds.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2" role="tablist" aria-label="Choose a tool">
          {CARDS.map((c) => {
            const active = tab === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(c.id)}
                className={
                  "group relative rounded-2xl border p-5 text-left transition " +
                  (active
                    ? "border-green-800 bg-green-800 text-white shadow-lg shadow-green-900/20 dark:border-green-500 dark:bg-green-500 dark:text-green-950"
                    : "border-green-900/15 bg-white text-green-950 hover:-translate-y-0.5 hover:border-green-700/50 hover:shadow-md dark:border-white/15 dark:bg-white/5 dark:text-white")
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-11 w-11 items-center justify-center rounded-xl " +
                      (active ? "bg-white/15 dark:bg-green-950/15" : "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400")
                    }
                  >
                    <c.icon size={24} />
                  </span>
                  <div>
                    <span className="block text-lg font-bold leading-tight">{c.title}</span>
                    <span className={"block text-sm " + (active ? "text-white/80 dark:text-green-950/80" : "text-gray-600 dark:text-gray-400")}>{c.desc}</span>
                  </div>
                </div>
                <ul className={"mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium " + (active ? "text-white/90 dark:text-green-950/90" : "text-green-800 dark:text-green-300")}>
                  {c.points.map((p) => (
                    <li key={p} className="inline-flex items-center gap-1.5">
                      <Zap size={12} /> {p}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck size={14} className="shrink-0 text-green-700 dark:text-green-400" /> Your camera feed, images and QR content never leave your device.
        </p>
      </div>
    </section>
  );
}

import { Download, Globe2, KeyRound, Lock, MousePointerClick, ScanLine, Smartphone, Sparkles, Type } from "lucide-react";
import { CONTACTS } from "../config";
import { card, SectionHeading } from "./ui";

const FEATURES = [
  { icon: Lock, title: "Private by design", text: "Scanning and generating happen inside your browser. Nothing is uploaded to a server." },
  { icon: KeyRound, title: "No sign-up needed", text: "No accounts, no limits and no watermarks. Open the page and start." },
  { icon: Smartphone, title: "Works on any device", text: "Responsive layout for phones, tablets and desktops, with light and dark modes." },
  { icon: Sparkles, title: "Custom QR designs", text: "Change colors, patterns, corner shapes, add a logo or a frame to match your brand." },
  { icon: Download, title: "High-quality downloads", text: "Export crisp PNG, JPG or vector SVG files up to 4096 px, ready for print." },
  { icon: Globe2, title: "Many QR types", text: "Links, text, email, phone, SMS, WhatsApp, Wi-Fi, contact cards and map locations." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Pick a tool", text: "Choose QR Scanner to read a code or QR Generator to create one." },
  { icon: Type, title: "Scan or enter content", text: "Use your camera, upload an image, or type the content you want to share." },
  { icon: ScanLine, title: "Copy, open or download", text: "Copy or open what you scanned, or download your new QR code as PNG, JPG or SVG." },
];

const FAQ = [
  {
    q: "Is RabbitQR really free?",
    a: "Yes. Scanning and generating QR codes is free, with no sign-up, no scan limits and no watermark on your downloads.",
  },
  {
    q: "Are my images or QR codes uploaded anywhere?",
    a: "No. Everything runs locally in your browser using JavaScript. Camera frames, uploaded images and the content of your QR codes are never sent to our servers.",
  },
  {
    q: "Why does the camera not start?",
    a: "Your browser needs permission to use the camera, and the site must be opened over HTTPS. Allow camera access in your browser’s site settings, or upload a picture of the QR code instead.",
  },
  {
    q: "Do the QR codes I generate expire?",
    a: "No. Codes made here are static: the content is encoded directly in the image, so they never expire and don’t depend on our service.",
  },
  {
    q: "Which download format should I choose?",
    a: "Use PNG for most screens and documents, SVG when you need to resize without losing quality (print, signage), and JPG when a smaller file is more important than a transparent background.",
  },
  {
    q: "Will my customized QR code still scan?",
    a: "Keep strong contrast between the QR color and the background, leave the quiet zone around the code, and test it with your phone before printing. Adding a logo automatically raises the error correction to High.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="why">
      <div id="why">
        <SectionHeading eyebrow="Why RabbitQR" title="Simple, fast and private">
          Everything you need to scan and create QR codes, without the clutter.
        </SectionHeading>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className={card + " p-6"}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400">
              <f.icon size={22} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-green-950 dark:text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y border-green-900/10 bg-green-50/60 dark:border-white/10 dark:bg-[#0a1810]" aria-labelledby="how">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div id="how">
          <SectionHeading eyebrow="How it works" title="Three simple steps" />
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className={card + " relative p-6"}>
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-green-900/10 dark:text-white/10">{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-800 text-white dark:bg-green-500 dark:text-green-950">
                <s.icon size={22} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-green-950 dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="faq">
      <div id="faq">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      </div>
      <div className="mt-8 space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className={card + " group p-5 open:shadow-md"}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-green-950 sm:text-base dark:text-white [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-xl leading-none text-green-700 transition group-open:rotate-45 dark:text-green-400">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-green-900/10 bg-green-50/60 dark:border-white/10 dark:bg-[#0a1810]" aria-labelledby="contact-title">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <div id="contact-title">
          <SectionHeading eyebrow="Get in touch" title="Contact Me">
            Questions, feedback or ideas? Reach out on any of these platforms.
          </SectionHeading>
        </div>
        <ul className="mt-10 flex flex-wrap items-start justify-center gap-5 sm:gap-7">
          {CONTACTS.map((c) => (
            <li key={c.name}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={c.name}
                className="group flex w-20 flex-col items-center gap-2.5"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-green-900/15 bg-white text-green-900 shadow-sm transition group-hover:-translate-y-1 group-hover:bg-green-800 group-hover:text-white group-hover:shadow-lg dark:border-white/15 dark:bg-white/5 dark:text-green-200 dark:group-hover:bg-green-500 dark:group-hover:text-green-950">
                  <c.icon size={26} />
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{c.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

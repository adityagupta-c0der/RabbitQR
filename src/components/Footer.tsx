import { BRAND, CONTACTS } from "../config";
import { Logo } from "./Logo";
import type { Route } from "../lib/router";

export function Footer({ go }: { go: (r: Route) => void }) {
  const link = (r: Route) => (e: React.MouseEvent) => {
    e.preventDefault();
    go(r);
  };
  const items: { r: Route; label: string }[] = [
    { r: "scanner", label: "QR Scanner" },
    { r: "generator", label: "QR Generator" },
    { r: "contact", label: "Contact" },
    { r: "privacy", label: "Privacy Policy" },
    { r: "terms", label: "Terms & Conditions" },
  ];

  return (
    <footer className="border-t border-green-900/10 bg-green-50/60 dark:border-white/10 dark:bg-[#050d08]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm font-medium text-green-900 dark:text-green-300">{BRAND.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Free QR code scanner and generator that runs entirely in your browser. Nothing you scan or create is uploaded.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            {items.map((i) => (
              <a
                key={i.r}
                href={"#/" + i.r}
                onClick={link(i.r)}
                className="text-gray-700 hover:text-green-800 hover:underline dark:text-gray-300 dark:hover:text-green-400"
              >
                {i.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-green-900/10 pt-6 sm:flex-row dark:border-white/10">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-2">
            {CONTACTS.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={c.name}
                  title={c.name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-900/15 text-green-900 transition hover:bg-green-800 hover:text-white dark:border-white/15 dark:text-green-200 dark:hover:bg-green-500 dark:hover:text-green-950"
                >
                  <c.icon size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

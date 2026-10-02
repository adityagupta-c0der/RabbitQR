import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import type { Route } from "../lib/router";

interface Props {
  route: Route;
  go: (r: Route) => void;
  dark: boolean;
  toggleTheme: () => void;
}

const LINKS: { r: Route; label: string }[] = [
  { r: "scanner", label: "QR Scanner" },
  { r: "generator", label: "QR Generator" },
  { r: "contact", label: "Contact" },
];

export function Header({ route, go, dark, toggleTheme }: Props) {
  const [open, setOpen] = useState(false);

  const link = (r: Route) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    go(r);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-green-900/10 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#07120b]/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#/" onClick={link("home")} aria-label="RabbitQR home">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.r}
              href={"#/" + l.r}
              onClick={link(l.r)}
              className={
                "rounded-lg px-3.5 py-2 text-sm font-medium transition hover:bg-green-50 hover:text-green-900 dark:hover:bg-white/10 dark:hover:text-white " +
                (route === l.r ? "text-green-800 dark:text-green-400" : "text-gray-600 dark:text-gray-300")
              }
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-900/15 text-green-900 transition hover:bg-green-50 dark:border-white/15 dark:text-green-100 dark:hover:bg-white/10"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-900/15 text-green-900 transition hover:bg-green-50 md:hidden dark:border-white/15 dark:text-green-100 dark:hover:bg-white/10"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-green-900/10 px-4 py-3 md:hidden dark:border-white/10" aria-label="Mobile">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.r}
                href={"#/" + l.r}
                onClick={link(l.r)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 dark:text-gray-200 dark:hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

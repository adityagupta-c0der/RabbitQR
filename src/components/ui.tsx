import type { ReactNode } from "react";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold bg-green-800 text-white shadow-sm transition hover:bg-green-900 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border border-green-900/15 bg-white text-green-900 transition hover:bg-green-50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 dark:border-white/15 dark:bg-white/5 dark:text-green-100 dark:hover:bg-white/10";

export const card =
  "rounded-2xl border border-green-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c1a12]";

export const inputCls =
  "w-full rounded-xl border border-green-900/15 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/30 dark:border-white/15 dark:bg-[#07120b] dark:text-gray-100 dark:placeholder:text-gray-500";

export const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-green-900/70 dark:text-green-200/70";

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-400">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-green-950 sm:text-3xl dark:text-white">{title}</h2>
      {children && <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">{children}</p>}
    </div>
  );
}

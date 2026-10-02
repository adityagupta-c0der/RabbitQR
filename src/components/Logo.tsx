import { BRAND } from "../config";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" className="fill-green-800 dark:fill-green-500" />
      <rect x="18" y="6" width="9" height="26" rx="4.5" fill="#fff" />
      <rect x="37" y="6" width="9" height="26" rx="4.5" fill="#fff" />
      <rect x="14" y="26" width="36" height="30" rx="12" fill="#fff" />
      <circle cx="25" cy="39" r="3" className="fill-green-800 dark:fill-green-600" />
      <circle cx="39" cy="39" r="3" className="fill-green-800 dark:fill-green-600" />
      <rect x="29" y="46" width="6" height="3" rx="1.5" className="fill-green-800 dark:fill-green-600" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-green-950 dark:text-white">{BRAND.name}</span>
    </span>
  );
}

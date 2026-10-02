import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "../config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptRequested = false;

function loadAdSense() {
  if (scriptRequested || !ADSENSE_CLIENT) return;
  if (!/^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT)) return;
  scriptRequested = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ADSENSE_CLIENT);
  document.head.appendChild(s);
}

/** Renders a Google AdSense unit. Renders nothing until ADSENSE_CLIENT (and a slot id) are configured in src/config.ts. */
export function AdSlot({ slot, className = "" }: { slot: string; className?: string }) {
  const pushed = useRef(false);
  const enabled = /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT) && /^\d{6,20}$/.test(slot);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true;
    loadAdSense();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocked or not ready */
    }
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className={"mx-auto w-full max-w-6xl px-4 sm:px-6 " + className} aria-label="Advertisement">
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-gray-400">Advertisement</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

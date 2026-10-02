import { useCallback, useEffect, useState } from "react";

export type Route = "home" | "scanner" | "generator" | "contact" | "privacy" | "terms";

const ROUTES: Route[] = ["scanner", "generator", "contact", "privacy", "terms"];

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return (ROUTES as string[]).includes(h) ? (h as Route) : "home";
}

/** Tiny hash router. `nonce` changes on every navigation so pages can re-scroll even to the same route. */
export function useRoute() {
  const [state, setState] = useState(() => ({ route: parse(), nonce: 0 }));

  useEffect(() => {
    const onChange = () => setState((s) => ({ route: parse(), nonce: s.nonce + 1 }));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((r: Route) => {
    const hash = r === "home" ? "#/" : "#/" + r;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    setState((s) => ({ route: r, nonce: s.nonce + 1 }));
  }, []);

  return { route: state.route, nonce: state.nonce, go };
}

import { useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Hero, type Tab } from "./components/Hero";
import { Scanner } from "./components/Scanner";
import { Generator } from "./components/Generator";
import { Contact, Faq, Features, HowItWorks } from "./components/Sections";
import { AdSlot } from "./components/AdSlot";
import { Privacy, Terms } from "./pages/Legal";
import { AD_SLOTS } from "./config";
import { useRoute } from "./lib/router";

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("rabbitqr-theme", next ? "dark" : "light");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);
  return { dark, toggle };
}

export default function App() {
  const { route, nonce, go } = useRoute();
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<Tab>(() => (route === "generator" ? "generator" : "scanner"));

  useEffect(() => {
    if (route === "scanner" || route === "generator") setTab(route);
    if (route === "scanner" || route === "generator") document.getElementById("tools")?.scrollIntoView();
    else if (route === "contact") document.getElementById("contact")?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [route, nonce]);

  const selectTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, "", "#/" + t);
  };

  const legal = route === "privacy" || route === "terms";

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#tools"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("tools")?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-green-800 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to tools
      </a>
      <Header route={route} go={go} dark={dark} toggleTheme={toggle} />

      <div className="flex-1">
        {legal ? (
          route === "privacy" ? <Privacy go={go} /> : <Terms go={go} />
        ) : (
          <main>
            <Hero tab={tab} onSelect={selectTab} />

            <section id="tools" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14" aria-label="QR tools">
              {tab === "scanner" && <Scanner />}
              <div hidden={tab !== "generator"}>
                <Generator />
              </div>
            </section>

            <AdSlot slot={AD_SLOTS.home} className="pb-4" />
            <Features />
            <HowItWorks />
            <Faq />
            <Contact />
          </main>
        )}
      </div>

      <AdSlot slot={AD_SLOTS.footer} className="py-4" />
      <Footer go={go} />
    </div>
  );
}

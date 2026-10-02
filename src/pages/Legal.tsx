import type { ReactNode } from "react";
import { BRAND } from "../config";
import type { Route } from "../lib/router";

const UPDATED = "January 2026";

function Page({ title, children, go }: { title: string; children: ReactNode; go: (r: Route) => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <a
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          go("home");
        }}
        className="text-sm font-medium text-green-800 hover:underline dark:text-green-400"
      >
        ← Back to {BRAND.name}
      </a>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-green-950 sm:text-4xl dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {UPDATED}</p>
      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
    </main>
  );
}

const H = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 text-lg font-semibold text-green-950 dark:text-white">{children}</h2>
);

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-green-800 underline dark:text-green-400">
    {children}
  </a>
);

export function Privacy({ go }: { go: (r: Route) => void }) {
  return (
    <Page title="Privacy Policy" go={go}>
      <p>
        {BRAND.name} is a free QR code scanner and generator that runs entirely in your web browser. This policy explains what
        happens to your information when you use the site.
      </p>
      <section>
        <H>1. Information we do not collect</H>
        <p>
          {BRAND.name} has no backend, database, user accounts or login. The camera feed, images you upload, text you enter and QR
          codes you scan or create are processed locally on your device. They are never uploaded to or stored on our servers.
        </p>
      </section>
      <section>
        <H>2. Camera access</H>
        <p>
          If you choose to scan with your camera, your browser asks for permission first. Video frames are analysed in memory on
          your device to find a QR code and are discarded immediately. The camera stops when a code is found, when you press Stop,
          or when you leave the scanner.
        </p>
      </section>
      <section>
        <H>3. Data stored on your device</H>
        <p>
          The only item we store is your light/dark theme preference, saved in your browser’s local storage so the site remembers it.
          Scan history shown in the scanner is kept in memory only and disappears when you close or reload the page.
        </p>
      </section>
      <section>
        <H>4. Advertising and cookies</H>
        <p>
          To keep the service free, {BRAND.name} may display ads served by Google AdSense. Google and its partners may use cookies or
          similar technologies to serve and measure ads, including personalised ads based on your visits to this and other sites.
          You can learn how Google uses data from sites that use its services at{" "}
          <A href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</A>, and
          you can manage or opt out of personalised advertising at <A href="https://adssettings.google.com">adssettings.google.com</A>{" "}
          or <A href="https://www.aboutads.info">aboutads.info</A>. Where required by law, you will be asked for consent before
          non-essential cookies are used. The content of your QR codes is never shared with advertisers.
        </p>
      </section>
      <section>
        <H>5. Third-party links</H>
        <p>
          The contact section and scan results can link to external websites. We are not responsible for the privacy practices of
          those sites. Always check a link before opening it.
        </p>
      </section>
      <section>
        <H>6. Security</H>
        <p>
          The site is served over HTTPS with security headers, does not use inline user-generated HTML, and only offers to open
          scanned links that use safe protocols (http, https, mailto, tel, sms and geo). Dangerous schemes such as
          <code className="mx-1 rounded bg-green-50 px-1 py-0.5 text-[13px] dark:bg-white/10">javascript:</code> are blocked.
        </p>
      </section>
      <section>
        <H>7. Children</H>
        <p>{BRAND.name} does not knowingly collect personal information from anyone, including children under 13.</p>
      </section>
      <section>
        <H>8. Changes to this policy</H>
        <p>We may update this policy from time to time. The “last updated” date above shows the latest revision.</p>
      </section>
      <section>
        <H>9. Contact</H>
        <p>
          Questions about this policy? Use the{" "}
          <a
            href="#/contact"
            onClick={(e) => {
              e.preventDefault();
              go("contact");
            }}
            className="font-medium text-green-800 underline dark:text-green-400"
          >
            Contact section
          </a>
          .
        </p>
      </section>
    </Page>
  );
}

export function Terms({ go }: { go: (r: Route) => void }) {
  return (
    <Page title="Terms & Conditions" go={go}>
      <p>
        By using {BRAND.name} you agree to these terms. If you do not agree, please do not use the site.
      </p>
      <section>
        <H>1. The service</H>
        <p>
          {BRAND.name} provides a free, browser-based QR code scanner and generator. The service is provided for lawful personal and
          commercial use.
        </p>
      </section>
      <section>
        <H>2. Acceptable use</H>
        <p>
          You agree not to use {BRAND.name} to create or distribute QR codes that link to malware, phishing, fraud, illegal or
          infringing content, or that otherwise harm others. You are solely responsible for the content you encode.
        </p>
      </section>
      <section>
        <H>3. Scanned content</H>
        <p>
          QR codes can point to any website or contain any text. {BRAND.name} cannot verify what a QR code contains or where it leads.
          Open links and act on scanned content at your own risk, especially for payments, logins and downloads.
        </p>
      </section>
      <section>
        <H>4. Your QR codes</H>
        <p>
          QR codes you generate belong to you. They are static, so they keep working without our service. We do not store them, so we
          cannot recover them if you lose them — please keep a copy of the files you download.
        </p>
      </section>
      <section>
        <H>5. Test before you print</H>
        <p>
          Scan reliability depends on contrast, size, print quality and the scanning device. Always test your QR code before
          publishing or printing it in bulk.
        </p>
      </section>
      <section>
        <H>6. Advertising and third-party services</H>
        <p>
          The site may show advertisements and may link to third-party websites. We do not control and are not responsible for
          third-party content, products or services.
        </p>
      </section>
      <section>
        <H>7. Intellectual property</H>
        <p>
          The {BRAND.name} name, logo, design and source code are the property of their owner. You may not copy or resell the site
          itself without permission.
        </p>
      </section>
      <section>
        <H>8. Disclaimer and limitation of liability</H>
        <p>
          The service is provided “as is” and “as available” without warranties of any kind. To the fullest extent permitted by law,
          we are not liable for any loss or damage arising from your use of the site, including failed scans or misuse of QR codes.
        </p>
      </section>
      <section>
        <H>9. Changes</H>
        <p>
          We may update these terms at any time. Continued use of the site after changes means you accept the updated terms. See our{" "}
          <a
            href="#/privacy"
            onClick={(e) => {
              e.preventDefault();
              go("privacy");
            }}
            className="font-medium text-green-800 underline dark:text-green-400"
          >
            Privacy Policy
          </a>{" "}
          for how data is handled.
        </p>
      </section>
      <section>
        <H>10. Contact</H>
        <p>
          For questions about these terms, use the{" "}
          <a
            href="#/contact"
            onClick={(e) => {
              e.preventDefault();
              go("contact");
            }}
            className="font-medium text-green-800 underline dark:text-green-400"
          >
            Contact section
          </a>
          .
        </p>
      </section>
    </Page>
  );
}

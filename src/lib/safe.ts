// Helpers that keep scanned (untrusted) content from becoming a security problem.

const OPENABLE = new Set(["http:", "https:", "mailto:", "tel:", "sms:", "smsto:", "geo:"]);

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Returns a safe, absolute href or null when the content must not be opened (javascript:, data:, etc.). */
export function safeHref(raw: string): string | null {
  const t = raw.trim();
  if (!t || t.length > 4096 || CONTROL_CHARS.test(t)) return null;
  try {
    const u = new URL(t);
    return OPENABLE.has(u.protocol.toLowerCase()) ? u.href : null;
  } catch {
    if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) {
      try {
        return new URL("https://" + t).href;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export type ContentKind = "URL" | "Email" | "Phone" | "SMS" | "Wi-Fi" | "Contact card" | "Location" | "Text";

export function classify(raw: string): ContentKind {
  const t = raw.trim();
  const l = t.toLowerCase();
  if (/^https?:\/\//i.test(t)) return "URL";
  if (l.startsWith("mailto:")) return "Email";
  if (l.startsWith("tel:")) return "Phone";
  if (l.startsWith("sms:") || l.startsWith("smsto:")) return "SMS";
  if (l.startsWith("wifi:")) return "Wi-Fi";
  if (l.startsWith("begin:vcard")) return "Contact card";
  if (l.startsWith("geo:")) return "Location";
  if (safeHref(t) && /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) return "URL";
  return "Text";
}

export interface WifiInfo {
  ssid: string;
  password: string;
  security: string;
  hidden: boolean;
}

export function parseWifi(raw: string): WifiInfo | null {
  const t = raw.trim();
  if (!/^wifi:/i.test(t)) return null;
  const body = t.slice(5);
  const fields: Record<string, string> = {};
  let key = "";
  let val = "";
  let inKey = true;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && i + 1 < body.length) {
      val += body[++i];
      continue;
    }
    if (inKey) {
      if (ch === ":") inKey = false;
      else key += ch;
    } else if (ch === ";") {
      fields[key.toUpperCase()] = val;
      key = "";
      val = "";
      inKey = true;
    } else {
      val += ch;
    }
  }
  if (!inKey && key) fields[key.toUpperCase()] = val;
  if (!fields.S) return null;
  return {
    ssid: fields.S,
    password: fields.P ?? "",
    security: fields.T || "nopass",
    hidden: (fields.H ?? "").toLowerCase() === "true",
  };
}

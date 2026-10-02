import QRCode from "qrcode";
import { canvasToBlob } from "./browser";

export type Ecl = "L" | "M" | "Q" | "H";
export type DotStyle = "square" | "rounded" | "dots";
export type EyeStyle = "square" | "rounded" | "circle";

export interface QROptions {
  text: string;
  margin: number;
  fg: string;
  bg: string;
  eyeColor: string;
  transparent: boolean;
  ecl: Ecl;
  dot: DotStyle;
  eye: EyeStyle;
  logo: string | null;
  frame: boolean;
  frameText: string;
}

export interface QRSvg {
  svg: string;
  width: number;
  height: number;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const LOGO = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const color = (c: string, fallback: string) => (HEX.test(c) ? c : fallback);
const num = (n: number) => String(Math.round(n * 1000) / 1000);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

interface Matrix {
  size: number;
  get(row: number, col: number): number | boolean;
}

/** Builds a styled QR code as an SVG string. Throws if the text cannot fit in a QR code. */
export function buildQrSvg(o: QROptions): QRSvg {
  if (!o.text) throw new Error("Nothing to encode.");
  const qr = QRCode.create(o.text, { errorCorrectionLevel: o.logo ? "H" : o.ecl });
  const mod = qr.modules as unknown as Matrix;
  const n = mod.size;
  const dark = (r: number, c: number) => !!mod.get(r, c);

  const fg = color(o.fg, "#14532d");
  const bg = color(o.bg, "#ffffff");
  const eyeColor = color(o.eyeColor, fg);
  const margin = Math.min(10, Math.max(0, Math.round(o.margin)));
  const logo = o.logo && LOGO.test(o.logo) ? o.logo : null;

  const W = n + margin * 2;
  const fp = o.frame ? Math.max(1.2, W * 0.045) : 0;
  const labelH = o.frame ? Math.max(3.6, W * 0.15) : 0;
  const totalW = W + fp * 2;
  const totalH = W + fp * 2 + labelH;
  const ox = fp + margin;
  const oy = fp + margin;

  const inEye = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const logoSize = n * 0.22;
  const clearHalf = logoSize / 2 + 0.8;
  const inLogo = (r: number, c: number) =>
    !!logo && Math.abs(c + 0.5 - n / 2) < clearHalf && Math.abs(r + 0.5 - n / 2) < clearHalf;

  let body = "";

  // background / frame
  if (o.frame) {
    body += `<rect width="${num(totalW)}" height="${num(totalH)}" rx="${num(Math.min(2, fp * 1.4))}" fill="${fg}"/>`;
    body += `<rect x="${num(fp)}" y="${num(fp)}" width="${num(W)}" height="${num(W)}" rx="0.6" fill="${bg}"/>`;
    const fs = labelH * 0.5;
    const label = esc((o.frameText || "SCAN ME").slice(0, 24).toUpperCase());
    body += `<text x="${num(totalW / 2)}" y="${num(fp + W + labelH / 2 + fs * 0.1 + fs * 0.35)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${num(fs)}" fill="${bg}">${label}</text>`;
  } else if (!o.transparent) {
    body += `<rect width="${num(totalW)}" height="${num(totalH)}" fill="${bg}"/>`;
  }

  // data modules
  let path = "";
  let shapes = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c) || inEye(r, c) || inLogo(r, c)) continue;
      const x = ox + c;
      const y = oy + r;
      if (o.dot === "square") path += `M${x} ${y}h1v1h-1z`;
      else if (o.dot === "rounded")
        shapes += `<rect x="${num(x + 0.03)}" y="${num(y + 0.03)}" width="0.94" height="0.94" rx="0.3"/>`;
      else shapes += `<circle cx="${num(x + 0.5)}" cy="${num(y + 0.5)}" r="0.45"/>`;
    }
  }
  if (path) body += `<path d="${path}" fill="${fg}"/>`;
  if (shapes) body += `<g fill="${fg}">${shapes}</g>`;

  // finder patterns (eyes)
  const ringR = o.eye === "square" ? 0 : o.eye === "rounded" ? 1.6 : 3;
  const dotR = o.eye === "square" ? 0 : o.eye === "rounded" ? 0.8 : 1.5;
  for (const [ec, er] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    const x = ox + ec;
    const y = oy + er;
    body += `<rect x="${num(x + 0.5)}" y="${num(y + 0.5)}" width="6" height="6" rx="${ringR}" fill="none" stroke="${eyeColor}" stroke-width="1"/>`;
    body += `<rect x="${num(x + 2)}" y="${num(y + 2)}" width="3" height="3" rx="${dotR}" fill="${eyeColor}"/>`;
  }

  // logo
  if (logo) {
    const lx = ox + n / 2 - logoSize / 2;
    const ly = oy + n / 2 - logoSize / 2;
    body += `<rect x="${num(lx - 0.6)}" y="${num(ly - 0.6)}" width="${num(logoSize + 1.2)}" height="${num(logoSize + 1.2)}" rx="0.9" fill="${bg}"/>`;
    body += `<image href="${logo}" x="${num(lx)}" y="${num(ly)}" width="${num(logoSize)}" height="${num(logoSize)}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const scale = 20;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(totalW)} ${num(totalH)}" ` +
    `width="${Math.round(totalW * scale)}" height="${Math.round(totalH * scale)}">${body}</svg>`;
  return { svg, width: totalW, height: totalH };
}

export const svgToDataUrl = (svg: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

/** Rasterises the SVG to a PNG or JPEG blob of the requested pixel width. */
export async function rasterize(q: QRSvg, px: number, mime: "image/png" | "image/jpeg", flatten: string): Promise<Blob> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not render the QR code image."));
    img.src = svgToDataUrl(q.svg);
  });
  const w = Math.round(px);
  const h = Math.round((px * q.height) / q.width);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (mime === "image/jpeg") {
    ctx.fillStyle = HEX.test(flatten) ? flatten : "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvasToBlob(canvas, mime, 0.95);
}

function luminance(hex: string): number {
  const v = HEX.test(hex) ? hex : "#000000";
  const ch = [1, 3, 5].map((i) => {
    const s = parseInt(v.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---------- content builders for each QR type ----------

export type QrType = "url" | "text" | "email" | "phone" | "sms" | "whatsapp" | "wifi" | "vcard" | "location";

export interface FieldSpec {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "password" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  max?: number;
  half?: boolean;
}

export interface TypeSpec {
  id: QrType;
  label: string;
  hint: string;
  fields: FieldSpec[];
}

export const TYPES: TypeSpec[] = [
  {
    id: "url",
    label: "URL",
    hint: "Link to any website or page.",
    fields: [{ key: "url", label: "Website URL", placeholder: "https://example.com", type: "url", required: true, max: 1500 }],
  },
  {
    id: "text",
    label: "Text",
    hint: "Plain text, notes or any message.",
    fields: [{ key: "text", label: "Your text", placeholder: "Type or paste your text here", type: "textarea", required: true, max: 1500 }],
  },
  {
    id: "email",
    label: "Email",
    hint: "Opens a ready-to-send email.",
    fields: [
      { key: "to", label: "Email address", placeholder: "name@example.com", type: "email", required: true, max: 200 },
      { key: "subject", label: "Subject", placeholder: "Optional", max: 200 },
      { key: "body", label: "Message", placeholder: "Optional", type: "textarea", max: 800 },
    ],
  },
  {
    id: "phone",
    label: "Phone",
    hint: "Dials a phone number.",
    fields: [{ key: "phone", label: "Phone number", placeholder: "+91 98765 43210", type: "tel", required: true, max: 30 }],
  },
  {
    id: "sms",
    label: "SMS",
    hint: "Starts a text message.",
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+91 98765 43210", type: "tel", required: true, max: 30 },
      { key: "message", label: "Message", placeholder: "Optional", type: "textarea", max: 600 },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: "Opens a WhatsApp chat.",
    fields: [
      { key: "phone", label: "Phone with country code", placeholder: "919876543210", type: "tel", required: true, max: 30 },
      { key: "message", label: "Pre-filled message", placeholder: "Optional", type: "textarea", max: 600 },
    ],
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    hint: "Lets people join your network by scanning.",
    fields: [
      { key: "ssid", label: "Network name (SSID)", placeholder: "My Wi-Fi", required: true, max: 32 },
      { key: "password", label: "Password", placeholder: "Leave empty for open network", type: "password", max: 63, half: true },
      {
        key: "security",
        label: "Security",
        type: "select",
        half: true,
        options: [
          { value: "WPA", label: "WPA / WPA2 / WPA3" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "None" },
        ],
      },
      {
        key: "hidden",
        label: "Hidden network",
        type: "select",
        options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ],
      },
    ],
  },
  {
    id: "vcard",
    label: "Contact",
    hint: "Share a contact card (vCard).",
    fields: [
      { key: "first", label: "First name", required: true, max: 60, half: true },
      { key: "last", label: "Last name", max: 60, half: true },
      { key: "phone", label: "Phone", type: "tel", max: 30, half: true },
      { key: "email", label: "Email", type: "email", max: 200, half: true },
      { key: "org", label: "Company", max: 100, half: true },
      { key: "title", label: "Job title", max: 100, half: true },
      { key: "website", label: "Website", type: "url", placeholder: "https://", max: 300 },
    ],
  },
  {
    id: "location",
    label: "Location",
    hint: "Opens a map position.",
    fields: [
      { key: "lat", label: "Latitude", placeholder: "28.6139", required: true, max: 20, half: true },
      { key: "lng", label: "Longitude", placeholder: "77.2090", required: true, max: 20, half: true },
    ],
  },
];

export type BuildResult = { ok: true; text: string } | { ok: false; error: string };

const fail = (error: string): BuildResult => ({ ok: false, error });
const ok = (text: string): BuildResult => ({ ok: true, text });
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const wifiEsc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const vEsc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const cleanPhone = (s: string) => s.replace(/[\s().-]/g, "");

function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t || /\s/.test(t)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : "https://" + t;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".") && u.hostname !== "localhost") return null;
    return u.href;
  } catch {
    return null;
  }
}

export function buildContent(type: QrType, f: Record<string, string>): BuildResult {
  const v = (k: string) => (f[k] ?? "").trim();
  switch (type) {
    case "url": {
      if (!v("url")) return fail("Enter a website URL.");
      const u = normalizeUrl(v("url"));
      return u ? ok(u) : fail("Enter a valid http(s) URL, e.g. https://example.com");
    }
    case "text":
      return v("text") ? ok(f.text.trim()) : fail("Enter some text.");
    case "email": {
      if (!EMAIL.test(v("to"))) return fail("Enter a valid email address.");
      const params: string[] = [];
      if (v("subject")) params.push("subject=" + encodeURIComponent(v("subject")));
      if (v("body")) params.push("body=" + encodeURIComponent(v("body")));
      return ok("mailto:" + v("to") + (params.length ? "?" + params.join("&") : ""));
    }
    case "phone": {
      const p = cleanPhone(v("phone"));
      return /^\+?\d{3,18}$/.test(p) ? ok("tel:" + p) : fail("Enter a valid phone number (digits, optional +).");
    }
    case "sms": {
      const p = cleanPhone(v("phone"));
      if (!/^\+?\d{3,18}$/.test(p)) return fail("Enter a valid phone number (digits, optional +).");
      return ok("SMSTO:" + p + ":" + v("message"));
    }
    case "whatsapp": {
      const p = cleanPhone(v("phone")).replace(/^\+/, "");
      if (!/^\d{6,15}$/.test(p)) return fail("Enter the number with country code, digits only.");
      return ok("https://wa.me/" + p + (v("message") ? "?text=" + encodeURIComponent(v("message")) : ""));
    }
    case "wifi": {
      if (!v("ssid")) return fail("Enter the network name (SSID).");
      const sec = f.security || "WPA";
      if (sec !== "nopass" && !f.password) return fail("Enter the Wi-Fi password or choose Security: None.");
      return ok(
        `WIFI:T:${sec};S:${wifiEsc(f.ssid.trim())};P:${sec === "nopass" ? "" : wifiEsc(f.password)};H:${f.hidden === "true" ? "true" : "false"};;`,
      );
    }
    case "vcard": {
      if (!v("first")) return fail("Enter at least a first name.");
      if (v("email") && !EMAIL.test(v("email"))) return fail("Enter a valid email address.");
      let web = "";
      if (v("website")) {
        const u = normalizeUrl(v("website"));
        if (!u) return fail("Enter a valid website URL.");
        web = u;
      }
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vEsc(v("last"))};${vEsc(v("first"))};;;`,
        `FN:${vEsc((v("first") + " " + v("last")).trim())}`,
      ];
      if (v("org")) lines.push("ORG:" + vEsc(v("org")));
      if (v("title")) lines.push("TITLE:" + vEsc(v("title")));
      if (v("phone")) lines.push("TEL:" + cleanPhone(v("phone")));
      if (v("email")) lines.push("EMAIL:" + v("email"));
      if (web) lines.push("URL:" + web);
      lines.push("END:VCARD");
      return ok(lines.join("\n"));
    }
    case "location": {
      const lat = Number(v("lat"));
      const lng = Number(v("lng"));
      if (!v("lat") || !v("lng") || !Number.isFinite(lat) || !Number.isFinite(lng)) return fail("Enter latitude and longitude as numbers.");
      if (lat < -90 || lat > 90) return fail("Latitude must be between -90 and 90.");
      if (lng < -180 || lng > 180) return fail("Longitude must be between -180 and 180.");
      return ok(`geo:${lat},${lng}`);
    }
  }
}

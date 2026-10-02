import { Github, Globe, Instagram, Linkedin, Mail, Send, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const BRAND = {
  name: "RabbitQR",
  tagline: "Scan. Create. Done.",
};

/**
 * Google AdSense configuration.
 * 1. Paste your publisher id below (format: "ca-pub-0000000000000000").
 * 2. Paste ad-unit slot ids (from AdSense > Ads > By ad unit).
 * 3. Put the same id in public/ads.txt.
 * While ADSENSE_CLIENT is empty, no ad script is loaded and no empty ad boxes are shown.
 */
export const ADSENSE_CLIENT = "";
export const AD_SLOTS = {
  home: "",
  footer: "",
};

export interface ContactLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

// Taken from the public portfolio https://aadi.world/ (Instagram & Telegram updated as requested).
export const CONTACTS: ContactLink[] = [
  { name: "Portfolio", href: "https://aadi.world/", icon: Globe },
  { name: "Email", href: "mailto:adityagupta8004@gmail.com", icon: Mail },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/aditya-gupta-8460a8382", icon: Linkedin },
  { name: "GitHub", href: "https://github.com/adityagupta-c0der", icon: Github },
  { name: "X", href: "https://x.com/adityagupta8004", icon: Twitter },
  { name: "Instagram", href: "https://www.instagram.com/ukn.aadi", icon: Instagram },
  { name: "Telegram", href: "https://t.me/TriggeredBull", icon: Send },
];

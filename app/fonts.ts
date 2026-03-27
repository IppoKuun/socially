import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Manrope,
  Plus_Jakarta_Sans,
  Sora,
  Space_Grotesk,
} from "next/font/google";

// Default UI font for the app. Use for most product surfaces.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Default monospace font. Use for code, ids, logs, and technical UI.
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Safe fallback UI font. Use when you want a very neutral interface.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Stronger premium UI font. Good for modern product UI and dashboards.
export const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Balanced product font. Good when you want cleaner editorial UI.
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

// Expressive display font. Use for hero titles and standout headings.
export const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Alternative display font. Use for strong section titles and branding moments.
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Alternative monospace font. Use for admin, code snippets, and system text.
export const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Slightly more editorial monospace. Good for technical metadata and logs.
export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

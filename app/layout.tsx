import type { Metadata } from "next";
import {
  geistMono,
  geistSans,
  ibmPlexMono,
  inter,
  jetBrainsMono,
  manrope,
  plusJakartaSans,
  sora,
  spaceGrotesk,
} from "./fonts";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl, siteConfig } from "@/lib/seo";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

function getLocaleFromPathname(pathname: string | null) {
  const [, maybeLocale] = pathname?.split("/") ?? [];

  return routing.locales.includes(
    maybeLocale as (typeof routing.locales)[number],
  )
    ? maybeLocale
    : routing.defaultLocale;
}

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;
  const h = await headers();
  const locale = getLocaleFromPathname(h.get("x-pathname"));

  return (
    <html
      lang={locale}
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable} ${plusJakartaSans.variable} ${sora.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} ${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

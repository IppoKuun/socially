import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Socially",
  description: "A social app built with Next.js",
};

export default async function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

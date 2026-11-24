import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { EB_Garamond, Pinyon_Script } from "next/font/google";
import { LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import "lenis/dist/lenis.css";
import "../globals.css";

/** Formal copperplate script — titles, names and key elements only. */
const script = Pinyon_Script({ variable: "--font-script-face", subsets: ["latin"], weight: "400" });
/** Classic book serif — readable body text on mobile. */
const serif = EB_Garamond({ variable: "--font-serif-body", subsets: ["latin"] });

export function generateStaticParams(): Array<{ lang: string }> {
  return LOCALES.map((lang) => ({ lang }));
}

function siteUrl(): URL {
  const host = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!host) return new URL("http://localhost:3000");
  return new URL(host.startsWith("http") ? host : `https://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    metadataBase: siteUrl(),
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: { title: dict.meta.title, description: dict.meta.description, type: "website" },
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">): Promise<ReactNode> {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${script.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}

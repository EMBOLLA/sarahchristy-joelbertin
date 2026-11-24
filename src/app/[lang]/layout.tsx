import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Geist } from "next/font/google";
import { LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import "lenis/dist/lenis.css";
import "../globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export function generateStaticParams(): Array<{ lang: string }> {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.title, description: dict.meta.description };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">): Promise<ReactNode> {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}

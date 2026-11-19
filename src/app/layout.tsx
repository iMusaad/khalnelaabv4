import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/data/site";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import RefCapture from "@/components/RefCapture";
import SourceCapture from "@/components/SourceCapture";
import { GAME_COUNT } from "@/data/quizCards";

const somar = localFont({
  src: [
    {
      path: "../../public/fonts/SomarSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SomarSans-Bold.woff2",
      weight: "700 900",
      style: "normal",
    },
  ],
  variable: "--font-somar",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;

const description = `${GAME_COUNT} لعبة جماعية للجلسات: فريقين على جهاز واحد، وفريق واحد يفوز.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "خل نلعب",
  description,
  applicationName: "خل نلعب",
  openGraph: {
    title: "خل نلعب",
    description,
    siteName: "خل نلعب",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "خل نلعب",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  themeColor: "#070012",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={somar.variable}>
      <body>
        <RefCapture />
        <SourceCapture />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}

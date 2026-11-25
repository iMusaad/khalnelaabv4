import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
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

const title = "خل نلعب | ألعاب جماعية للجلسات والسهرات";

const description = `قسّموا أنفسكم فريقين وتحدّوا بعض في ${GAME_COUNT} لعبة: أعلام، سيارات، شعارات، أمثال، أسئلة وأكثر.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s | خل نلعب" },
  description,
  applicationName: "خل نلعب",
  openGraph: {
    title,
    description,
    siteName: "خل نلعب",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE.name,
      url: siteUrl,
      inLanguage: "ar",
    },
    {
      "@type": "Organization",
      name: SITE.name,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [SITE.tiktok],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <RefCapture />
        <SourceCapture />
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}

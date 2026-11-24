"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { ensureGtag, gaEnabled, syncPageLocation } from "@/lib/analytics";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";

export default function GoogleAnalytics() {
  const [granted, setGranted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (granted) {
      syncPageLocation();
    }
  }, [granted, pathname, searchParams]);

  useEffect(() => {
    function sync() {
      const ok = getConsent() === "granted";

      if (ok) {
        ensureGtag();
      }

      setGranted(ok);
    }

    sync();
    window.addEventListener(CONSENT_EVENT, sync);

    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!gaEnabled() || !granted) {
    return null;
  }

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaMeasurementId}`}
      strategy="afterInteractive"
    />
  );
}

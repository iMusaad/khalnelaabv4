"use client";

import { useEffect } from "react";
import {
  SOURCE_COOKIE,
  SOURCE_COOKIE_MAX_AGE,
  detectSource,
  encodeSource,
} from "@/lib/attribution";

export default function SourceCapture() {
  useEffect(() => {
    const detected = detectSource(
      window.location.search,
      document.referrer,
      window.location.hostname,
    );

    if (detected) {
      document.cookie = `${SOURCE_COOKIE}=${encodeSource(detected)}; path=/; max-age=${SOURCE_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }, []);

  return null;
}

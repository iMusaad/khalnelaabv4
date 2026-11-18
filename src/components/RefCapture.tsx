"use client";

import { useEffect } from "react";

export default function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    const code = ref?.toUpperCase().replace(/[\s-]/g, "");

    if (code && /^[A-Z0-9]{3,16}$/.test(code)) {
      document.cookie = `kn_ref=${code}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    }
  }, []);

  return null;
}

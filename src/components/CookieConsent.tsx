"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gaEnabled } from "@/lib/analytics";
import { getConsent, setConsent, type Consent } from "@/lib/consent";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(gaEnabled() && getConsent() === null);
  }, []);

  if (!open) {
    return null;
  }

  function choose(value: Consent) {
    setConsent(value);
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1200] p-3 sm:p-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-[#221a3f] p-4 shadow-[0_6px_0_#0b081a] ring-1 ring-white/10 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm font-bold leading-6 text-white/80">
          نستخدم كوكيز من قوقل عشان نعرف عدد الزوار ونحسّن الموقع.{" "}
          <Link href="/privacy" className="text-[#ffc23d] underline">
            التفاصيل
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose("granted")}
            className="btn-primary flex-1 px-5 py-2 text-sm sm:flex-none"
          >
            موافق
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className="btn-secondary flex-1 px-5 py-2 text-sm sm:flex-none"
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}

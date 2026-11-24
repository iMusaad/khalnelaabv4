"use client";

import { useEffect, useState } from "react";
import { setAnalyticsDisabled } from "@/lib/analytics";
import { analyticsAllowed, setConsent } from "@/lib/consent";

export default function AnalyticsOptOut() {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    setAllowed(analyticsAllowed());
  }, []);

  function toggle() {
    const next = !allowed;

    setConsent(next ? "granted" : "denied");
    setAnalyticsDisabled(!next);
    setAllowed(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="flex-1">
        {allowed
          ? "التحليلات شغالة على جهازك. تقدر توقفها متى ما تبي."
          : "وقفت التحليلات على جهازك، وما ينرسل لـ Google شي."}
      </p>
      <button
        type="button"
        onClick={toggle}
        className="btn-secondary px-5 py-2 text-sm"
      >
        {allowed ? "أوقف التحليلات" : "شغّل التحليلات"}
      </button>
    </div>
  );
}

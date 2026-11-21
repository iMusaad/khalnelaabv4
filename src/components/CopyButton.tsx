"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "انسخ الكود",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary w-full">
      {copied ? "تم النسخ" : label}
    </button>
  );
}

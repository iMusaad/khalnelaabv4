"use client";

import { useState, type FormEvent } from "react";

export default function AdminDevices({ password }: { password: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, query: query.trim() }),
      });

      const data = (await response.json().catch(() => null)) as {
        found?: boolean;
        cleared?: number;
      } | null;

      if (!response.ok || !data) {
        setResult("ما قدرنا نصفّر الحين، جرّب بعد شوي.");
      } else if (!data.found) {
        setResult("ما لقينا شراء بهذا الكود أو الإيميل.");
      } else {
        setResult(
          `تم التصفير. كان مفعّل على ${data.cleared ?? 0} أجهزة، والحين يقدر يفعّل من جديد.`,
        );
        setQuery("");
      }
    } catch {
      setResult("ما قدرنا نصفّر الحين، جرّب بعد شوي.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-[#221a3f] p-4 shadow-[0_5px_0_#140f29] sm:p-5"
    >
      <div>
        <p className="text-base font-black text-white">تصفير أجهزة كود</p>
        <p className="mt-1 text-sm font-bold text-white/55">
          لو أحد غيّر جهازه ووصل الحد، اكتب كوده أو إيميله اللي شرا فيه.
        </p>
      </div>

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setResult("");
        }}
        placeholder="KN-... أو name@example.com"
        dir="ltr"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={200}
        className="h-11 w-full rounded-xl bg-[#15102b] px-3 text-center text-base font-bold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-[#ffc23d]"
      />

      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="btn-secondary w-full"
      >
        {loading ? "لحظة..." : "صفّر الأجهزة"}
      </button>

      {result && (
        <p className="text-center text-sm font-bold text-white/75">{result}</p>
      )}
    </form>
  );
}

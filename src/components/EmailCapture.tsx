"use client";

import { useState, type FormEvent } from "react";
import { emailProblem, suggestion } from "@/lib/emailCheck";

const inputClass =
  "h-12 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-base font-bold text-white outline-none placeholder:text-white/30 focus:border-cyan-300/60";

export default function EmailCapture({ paymentId }: { paymentId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problem = emailProblem(email);

    if (problem) {
      setError(problem);
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/purchase/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, email: email.trim() }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (data?.ok) {
        setStatus("sent");
        return;
      }

      setError(
        data?.error === "sent"
          ? "أرسلنا الكود قبل على إيميلك."
          : "ما قدرنا نرسل الإيميل، احفظ الكود اللي فوق.",
      );
    } catch {
      setError("صار خطأ، جرّب مرة ثانية.");
    }

    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <p className="rounded-xl bg-black/25 px-4 py-3 text-sm font-bold text-[#4ade80]">
        أرسلنا الكود على{" "}
        <span dir="ltr" className="font-black">
          {email.trim()}
        </span>
      </p>
    );
  }

  const hint = suggestion(email);

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl bg-black/25 p-4 text-right"
    >
      <p className="text-base font-black text-white">
        اكتب إيميلك عشان ما يضيع منك الكود
      </p>
      <p className="text-xs font-bold text-white/50">
        نرسل لك الكود عليه، ولو ضاع منك ترجعه بإيميلك من صفحة «عندي كود».
      </p>

      <input
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
        }}
        placeholder="name@example.com"
        dir="ltr"
        autoComplete="email"
        maxLength={200}
        className={inputClass}
      />

      {hint && !error && (
        <button
          type="button"
          onClick={() => setEmail(hint)}
          className="block w-full text-center text-sm font-bold text-[#ffc23d]"
        >
          تقصد <span dir="ltr">{hint}</span>؟
        </button>
      )}

      {error && (
        <p className="text-center text-sm font-bold text-red-200">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !email.trim()}
        className="btn-primary w-full py-3"
      >
        {status === "sending" ? "لحظة..." : "أرسل لي الكود"}
      </button>
    </form>
  );
}

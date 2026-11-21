"use client";

import { useState, type FormEvent } from "react";
import { OverlayShell } from "@/components/match/Overlays";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "sending" | "sent" | "error";

export default function ReportButton({
  game,
  item,
}: {
  game: string;
  item?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function close() {
    setOpen(false);
    setStatus("idle");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || status === "sending") {
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, item, message, website }),
      });

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      setStatus("sent");
      trackEvent("report_error", { game });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="بلّغ عن غلط"
        title="بلّغ عن غلط"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#221a3f] text-white/70 shadow-[0_3px_0_#140f29] transition-colors hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
      </button>

      {open && (
        <OverlayShell>
          {status === "sent" ? (
            <>
              <h2 className="text-2xl font-black text-white">
                وصلنا، شكرًا لك
              </h2>
              <p className="mt-2 text-sm font-bold text-white/60">
                بنراجعه ونصلحه بأسرع وقت.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-primary mt-6 min-w-[140px]"
              >
                نكمّل اللعب
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-black text-white">
                محد معصوم من الغلط
              </h2>
              <p className="mt-2 text-sm font-bold text-white/60">
                إذا لاحظت شي خطأ، اكتبه هنا
              </p>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                rows={4}
                autoFocus
                placeholder="مثلًا: الجواب الصحيح هو..."
                className="mt-4 w-full resize-none rounded-xl bg-[#15102b] px-4 py-3 text-right text-base font-bold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-[#ffc23d]"
              />

              <input
                type="text"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {status === "error" && (
                <p className="mt-2 text-sm font-bold text-[#ff7a7f]">
                  ما وصل، جرّب بعد شوي
                </p>
              )}

              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="submit"
                  disabled={!message.trim() || status === "sending"}
                  className="btn-primary min-w-[120px]"
                >
                  {status === "sending" ? "لحظة..." : "أرسل"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="btn-secondary min-w-[100px]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </OverlayShell>
      )}
    </>
  );
}

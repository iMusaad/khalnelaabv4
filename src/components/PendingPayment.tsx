"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const POLL_MS = 2000;
const MAX_TRIES = 30;

export default function PendingPayment({
  id,
  restore,
}: {
  id: string;
  restore: boolean;
}) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let tries = 0;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      tries += 1;

      try {
        const response = await fetch("/api/purchase/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const data = (await response.json().catch(() => null)) as {
          ok?: boolean;
        } | null;

        if (data?.ok) {
          window.location.replace("/buy/success");
          return;
        }

        if (response.status !== 202) {
          window.location.replace(
            restore ? "/unlock?error=payment" : "/buy?error=payment",
          );
          return;
        }
      } catch {}

      if (stopped) {
        return;
      }

      if (tries >= MAX_TRIES) {
        setTimedOut(true);
        return;
      }

      timer = setTimeout(check, POLL_MS);
    }

    void check();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, restore]);

  if (timedOut) {
    return (
      <section className="rounded-2xl bg-[#221a3f] p-5 text-center shadow-[0_5px_0_#140f29]">
        <p className="text-lg font-black text-white">
          للحين ما وصلنا تأكيد الدفع
        </p>
        <p className="mt-2 text-sm font-bold leading-6 text-white/65">
          إذا انخصم المبلغ، احفظ رقم العملية وجرب بعد شوي من صفحة «عندي كود»، أو
          تواصل معنا.
        </p>
        <p
          dir="ltr"
          className="mt-3 select-all rounded-xl bg-[#15102b] px-3 py-2 text-sm font-bold text-white/80"
        >
          {id}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/unlock" className="btn-primary px-5 py-2 text-sm">
            عندي كود
          </Link>
          <Link href="/contact" className="btn-secondary px-5 py-2 text-sm">
            تواصل معنا
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-[#221a3f] p-6 text-center shadow-[0_5px_0_#140f29]">
      <div
        aria-hidden="true"
        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-[#ffc23d]"
      />
      <p className="mt-4 text-lg font-black text-white">نأكد الدفع...</p>
      <p className="mt-1 text-sm font-bold text-white/55">
        ثواني بس، لا تسكر الصفحة
      </p>
    </section>
  );
}

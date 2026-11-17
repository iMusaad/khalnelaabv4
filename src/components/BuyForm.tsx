"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

import { emailProblem, suggestion } from "@/lib/emailCheck";

const MOYASAR_VERSION = "1.14.0";
const MOYASAR_CDN = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}`;

type MoyasarGlobal = {
  init: (options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    Moyasar?: MoyasarGlobal;
  }
}

export default function BuyForm({
  publishableKey,
  amount,
  emailEnabled,
  applePay = false,
  next,
}: {
  publishableKey: string;
  amount: number;
  emailEnabled: boolean;
  applePay?: boolean;
  next: string;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [step, setStep] = useState<"details" | "pay">("details");
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (step !== "pay" || !scriptReady || !window.Moyasar) {
      return;
    }

    const origin = window.location.origin;
    const trimmedEmail = email.trim();

    window.Moyasar.init({
      element: ".mysr-form",
      amount,
      currency: "SAR",
      description: "خل نلعب - اللعبة كاملة",
      publishable_api_key: publishableKey,
      callback_url: `${origin}/api/purchase/complete`,
      methods: applePay ? ["creditcard", "applepay"] : ["creditcard"],
      ...(applePay
        ? {
            apple_pay: {
              country: "SA",
              label: "Khal Nelab",
              validate_merchant_url:
                "https://api.moyasar.com/v1/applepay/initiate",
            },
          }
        : {}),
      language: "ar",
      metadata: trimmedEmail ? { email: trimmedEmail } : {},
    });
  }, [step, scriptReady, amount, publishableKey, email, applePay]);

  if (!publishableKey) {
    return (
      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
        <p className="text-lg font-black text-white">الدفع قريبًا</p>
        <p className="mt-1 text-sm font-bold text-white/60">
          نجهز بوابة الدفع، ارجع لنا بعد شوي.
        </p>
        <UnlockLinks next={next} />
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      {step === "details" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (emailEnabled) {
              const problem = emailProblem(email);

              if (problem) {
                setEmailError(problem);
                return;
              }
            }

            setEmailError("");
            setStep("pay");
          }}
        >
          {emailEnabled && (
            <div className="space-y-3 text-right">
              <label className="block">
                <span className="text-sm font-black text-white/80">إيميلك</span>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                  }}
                  placeholder="name@example.com"
                  dir="ltr"
                  autoComplete="email"
                  maxLength={200}
                  className={inputClass}
                />
              </label>

              {suggestion(email) && !emailError && (
                <button
                  type="button"
                  onClick={() => {
                    const fixed = suggestion(email) as string;
                    setEmail(fixed);
                  }}
                  className="block w-full text-center text-sm font-bold text-[#ffc23d]"
                >
                  تقصد <span dir="ltr">{suggestion(email)}</span>؟
                </button>
              )}

              {emailError && (
                <p className="text-center text-sm font-bold text-red-200">
                  {emailError}
                </p>
              )}

              <span className="block text-xs font-bold text-white/45">
                نرسل لك الكود عليه، ولو ضاع منك ترجعه بإيميلك من صفحة «عندي
                كود».
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary mt-4 w-full py-3 text-lg"
          >
            متابعة للدفع
          </button>
        </form>
      ) : (
        <>
          {emailEnabled && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-black/25 px-4 py-3">
              <p className="min-w-0 text-sm font-bold text-white/70">
                بنرسل الكود على{" "}
                <span dir="ltr" className="break-all font-black text-white">
                  {email.trim()}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setStep("details")}
                className="shrink-0 text-sm font-black text-cyan-200 underline"
              >
                تعديل
              </button>
            </div>
          )}

          <link rel="stylesheet" href={`${MOYASAR_CDN}/moyasar.css`} />

          <Script
            src={`${MOYASAR_CDN}/moyasar.js`}
            strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
            onError={() => setScriptFailed(true)}
          />

          {scriptFailed ? (
            <p className="text-center text-sm font-bold text-red-100">
              ما قدرنا نحمّل نموذج الدفع. تأكد من الاتصال وحدّث الصفحة.
            </p>
          ) : (
            <>
              {!scriptReady && (
                <p className="text-center text-sm font-bold text-white/60">
                  لحظة نجهز الدفع...
                </p>
              )}
              <div className="rounded-2xl bg-white p-4 sm:p-5">
                <div className="mysr-form" dir="ltr" />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setStep("details")}
            className="btn-secondary mt-3 w-full"
          >
            رجوع
          </button>
        </>
      )}

      <p className="mt-3 text-center text-xs font-bold text-white/45">
        بالشراء أنت موافق على{" "}
        <Link href="/terms" className="underline">
          الشروط وسياسة الاسترجاع
        </Link>
        .
      </p>

      <UnlockLinks next={next} />
    </section>
  );
}

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 text-center text-base font-bold text-white outline-none placeholder:text-white/30 focus:border-cyan-300/60";

function UnlockLinks({ next }: { next?: string }) {
  const query = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <p className="mt-3 text-center text-sm font-bold text-white/60">
      اشتريت قبل أو عندك كود؟{" "}
      <Link href={`/unlock${query}`} className="text-cyan-200 underline">
        فعّل من هنا
      </Link>
    </p>
  );
}

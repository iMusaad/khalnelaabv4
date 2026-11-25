"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

import RiyalSign from "@/components/RiyalSign";
import { trackEvent } from "@/lib/analytics";
import { SOURCE_COOKIE } from "@/lib/attribution";
import { readCookie, trackFunnel } from "@/lib/track";

const MOYASAR_VERSION = "1.14.0";
const MOYASAR_CDN = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}`;
const APPLE_PAY_SDK =
  "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";

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
  applePay = false,
  next,
  initialRef = null,
}: {
  publishableKey: string;
  amount: number;
  initialRef?: { code: string; discount: number } | null;
  applePay?: boolean;
  next: string;
}) {
  const [step, setStep] = useState<"details" | "pay">("details");
  const [scriptReady, setScriptReady] = useState(false);
  const [appleSdkSettled, setAppleSdkSettled] = useState(!applePay);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [referral, setReferral] = useState(initialRef);
  const [refInput, setRefInput] = useState("");
  const [refOpen, setRefOpen] = useState(false);
  const [refStatus, setRefStatus] = useState<"idle" | "checking" | "invalid">(
    "idle",
  );

  const finalAmount = Math.max(100, amount - (referral?.discount ?? 0) * 100);

  useEffect(() => {
    trackFunnel("buy_view", true);
    trackEvent("view_item", { currency: "SAR", value: amount / 100 });
  }, [amount]);

  useEffect(() => {
    if (step === "pay") {
      trackFunnel("checkout", true);
      trackEvent("begin_checkout", {
        currency: "SAR",
        value: finalAmount / 100,
      });
    }
  }, [step, finalAmount]);

  async function applyRef() {
    if (!refInput.trim() || refStatus === "checking") {
      return;
    }

    setRefStatus("checking");

    try {
      const response = await fetch("/api/referral/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refInput.trim() }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        discount?: number;
      } | null;

      if (data?.ok && data.code) {
        setReferral({ code: data.code, discount: data.discount ?? 0 });
        trackEvent("referral_applied", { coupon: data.code });
        setRefOpen(false);
        setRefStatus("idle");
        return;
      }
    } catch {}

    setRefStatus("invalid");
  }

  useEffect(() => {
    if (step !== "pay" || !scriptReady || !appleSdkSettled || !window.Moyasar) {
      return;
    }

    const origin = window.location.origin;
    const source = readCookie(SOURCE_COOKIE);

    window.Moyasar.init({
      element: ".mysr-form",
      amount: finalAmount,
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
      metadata: {
        ...(referral ? { ref: referral.code } : {}),
        ...(source ? { src: source } : {}),
      },
    });
  }, [
    step,
    scriptReady,
    appleSdkSettled,
    finalAmount,
    publishableKey,
    applePay,
    referral,
  ]);

  if (!publishableKey) {
    return (
      <section className="rounded-3xl bg-[#221a3f] p-5 text-center shadow-[0_6px_0_#140f29]">
        <p className="text-lg font-black text-white">قريبًا</p>
        <p className="mt-1 text-sm font-bold text-white/60">
          نجهز الشراء، ارجع لنا بعد شوي.
        </p>
        <UnlockLinks next={next} />
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-[#221a3f] p-4 shadow-[0_6px_0_#140f29] sm:p-5">
      {step === "details" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep("pay");
          }}
        >
          <div className="text-center">
            {referral ? (
              <p className="rounded-xl bg-black/25 px-3 py-2 text-sm font-bold text-white/80">
                كود{" "}
                <span dir="ltr" className="font-black text-[#ffc23d]">
                  {referral.code}
                </span>
                {referral.discount > 0 && (
                  <>
                    {" "}
                    · السعر بعد الخصم{" "}
                    <span className="font-black text-white">
                      {finalAmount / 100}
                    </span>{" "}
                    <RiyalSign />
                  </>
                )}
              </p>
            ) : refOpen ? (
              <div className="flex gap-2">
                <input
                  value={refInput}
                  onChange={(event) => {
                    setRefInput(event.target.value);
                    setRefStatus("idle");
                  }}
                  placeholder="الكود"
                  dir="ltr"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={20}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-black/25 px-3 text-center text-base font-black uppercase text-white outline-none placeholder:text-white/30 focus:border-cyan-300/60"
                />
                <button
                  type="button"
                  onClick={() => void applyRef()}
                  disabled={!refInput.trim() || refStatus === "checking"}
                  className="btn-secondary shrink-0 px-4"
                >
                  {refStatus === "checking" ? "لحظة..." : "طبّق"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRefOpen(true)}
                className="text-sm font-bold text-cyan-200 underline"
              >
                عندك كود خصم؟
              </button>
            )}

            {refStatus === "invalid" && (
              <p className="mt-2 text-sm font-bold text-red-200">
                الكود غير صحيح.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary mt-4 w-full py-3 text-lg"
          >
            كمّل
          </button>
        </form>
      ) : (
        <>
          <link rel="stylesheet" href={`${MOYASAR_CDN}/moyasar.css`} />

          {applePay && (
            <Script
              src={APPLE_PAY_SDK}
              strategy="afterInteractive"
              crossOrigin="anonymous"
              onReady={() => setAppleSdkSettled(true)}
              onError={() => setAppleSdkSettled(true)}
            />
          )}

          <Script
            src={`${MOYASAR_CDN}/moyasar.js`}
            strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
            onError={() => setScriptFailed(true)}
          />

          {scriptFailed ? (
            <p className="text-center text-sm font-bold text-red-100">
              ما قدرنا نفتح خيارات الشراء. تأكد من الاتصال وحدّث الصفحة.
            </p>
          ) : (
            <>
              {!scriptReady && (
                <p className="text-center text-sm font-bold text-white/60">
                  لحظة...
                </p>
              )}
              <div className="rounded-2xl border-[3px] border-[#130e28] bg-[#fff8e8] px-3 py-4 shadow-[0_5px_0_#130e28] sm:px-5">
                <div className="mysr-form" dir="ltr" />
              </div>
            </>
          )}
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

function UnlockLinks({ next }: { next?: string }) {
  const query = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mt-4 border-t border-white/10 pt-4 text-center">
      <p className="text-sm font-bold text-white/60">اشتريتها قبل؟</p>

      <Link href={`/unlock${query}`} className="btn-secondary mt-2 w-full">
        فعّلها على هذا الجهاز بالكود أو بإيميلك
      </Link>
    </div>
  );
}

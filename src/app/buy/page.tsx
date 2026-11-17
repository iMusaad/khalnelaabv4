import type { Metadata } from "next";
import Link from "next/link";
import BuyForm from "@/components/BuyForm";
import HomeIcon from "@/components/HomeIcon";
import PixelHero from "@/components/PixelHero";
import RiyalSign from "@/components/RiyalSign";
import SiteFooter from "@/components/SiteFooter";
import { isEmailEnabled } from "@/lib/email";
import { safeNextPath } from "@/lib/licenseCookie";
import { PRICING, getCurrentPrice, toHalalas } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "اشترِ خل نلعب",
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  payment: "ما تمت العملية، وما انسحب منك شي. جرّب مرة ثانية.",
  config: "الشراء متوقف الحين، جرّب بعد شوي.",
};

const FEATURES = [
  {
    title: "كل الألعاب",
    text: "ألعاب جماعية متنوعة تشعل الجلسة",
    className: "bg-[#ffc23d] text-[#241339] shadow-[0_6px_0_#c27700]",
    wide: true,
  },
  {
    title: "بلا حد",
    text: "العبوها كل ما اجتمعتوا",
    className: "bg-[#2f9bff] text-white shadow-[0_6px_0_#1662b8]",
  },
  {
    title: "مرة وحدة",
    text: "بدون اشتراك شهري",
    className: "bg-[#ff5a5f] text-white shadow-[0_6px_0_#b8323a]",
  },
  {
    title: "الجديد مجانًا",
    text: "أي لعبة نضيفها توصلك بدون زيادة",
    className: "bg-[#3ddc84] text-[#0d3b22] shadow-[0_6px_0_#1f9a57]",
    wide: true,
  },
];

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const price = getCurrentPrice();

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip text-white">
      <Link
        href="/"
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-xl bg-[#241339] px-3 py-2 text-sm font-black text-white shadow-[0_4px_0_#130e28] transition-transform hover:-translate-y-0.5"
      >
        <HomeIcon />
        الرئيسية
      </Link>
      <PixelHero overlap={false}>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">خل نلعب كاملة</h1>

        <p className="mt-2 flex items-center justify-center gap-3" dir="rtl">
          <span className="text-6xl font-black leading-none sm:text-7xl">
            {price}
          </span>

          <RiyalSign className="text-4xl sm:text-5xl" />

          {PRICING.onSale && (
            <span className="relative text-2xl font-black opacity-50 sm:text-3xl">
              {PRICING.basePrice}
              <span className="absolute inset-x-[-4px] top-1/2 h-[3px] -rotate-12 rounded bg-current" />
            </span>
          )}
        </p>

        {PRICING.onSale && (
          <p className="mx-auto mt-3 w-fit rounded-lg bg-[#241339] px-3 py-1 text-sm font-black text-[#ffc23d]">
            سعر الإطلاق لفترة محدودة
          </p>
        )}
      </PixelHero>

      <div className="mx-auto mt-6 grid max-w-5xl gap-5 px-4 pb-6 md:grid-cols-[1fr_1.1fr] md:items-start">
        <ul className="grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className={`rounded-2xl p-4 text-right sm:p-5 ${feature.className} ${
                feature.wide ? "col-span-2" : ""
              }`}
            >
              <span className="block text-xl font-black sm:text-2xl">
                {feature.title}
              </span>

              <span className="mt-1 block text-sm font-bold opacity-80 sm:text-base">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <div>
          {error && ERRORS[error] && (
            <p
              role="alert"
              className="mb-4 rounded-2xl bg-[#3a1730] px-4 py-3 text-center text-sm font-bold text-red-100"
            >
              {ERRORS[error]}
            </p>
          )}

          <BuyForm
            publishableKey={process.env.MOYASAR_PUBLISHABLE_KEY ?? ""}
            amount={toHalalas(price)}
            emailEnabled={isEmailEnabled()}
            applePay={process.env.APPLE_PAY_ENABLED === "true"}
            next={safeNextPath(next)}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <SiteFooter />
      </div>
    </main>
  );
}

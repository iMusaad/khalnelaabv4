import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getMessageStore } from "@/lib/messageStore";
import { REF_COOKIE, getReferral } from "@/lib/referral";
import Image from "next/image";
import Link from "next/link";
import BuyForm from "@/components/BuyForm";
import HomeIcon from "@/components/HomeIcon";
import PixelHero from "@/components/PixelHero";
import RiyalSign from "@/components/RiyalSign";
import SiteFooter from "@/components/SiteFooter";
import { quizCategoryList } from "@/data/quiz/meta";
import { GAME_COUNT, PLAYABLE_CARDS } from "@/data/quizCards";
import { safeNextPath } from "@/lib/licenseCookie";
import { posterThumb } from "@/lib/poster";
import { SITE } from "@/data/site";
import { PRICING, getCurrentPrice, isOnSale, toHalalas } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "اشترِ الألعاب",
  description:
    "كل ألعاب خل نلعب تصير لكم، وأي لعبة جديدة نضيفها توصلكم مجاناً.",
  alternates: { canonical: "/buy" },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  payment: "ما تمت العملية، وما انسحب منك شي. جرّب مرة ثانية.",
  config: "الشراء متوقف الحين، جرّب بعد شوي.",
};

const QUIZ_FIRST = quizCategoryList[0].key;

const GAME_POSTERS = PLAYABLE_CARDS.filter(
  (game) => !game.category || game.category === QUIZ_FIRST,
);

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; ref?: string }>;
}) {
  const { error, next, ref } = await searchParams;
  const price = getCurrentPrice();
  const store = await getMessageStore();
  const referral = store
    ? await getReferral(store, ref ?? (await cookies()).get(REF_COOKIE)?.value)
    : null;

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: SITE.name,
            description: `قسّموا أنفسكم فريقين وتحدّوا بعض في ${GAME_COUNT} لعبة جماعية للجمعات والسهرات`,
            image: `${SITE.url}/opengraph-image.jpg`,
            brand: { "@type": "Brand", name: SITE.name },
            offers: {
              "@type": "Offer",
              price: price,
              priceCurrency: PRICING.currency,
              availability: "https://schema.org/InStock",
              url: `${SITE.url}/buy`,
            },
          }),
        }}
      />
      <Link
        href="/"
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-xl bg-[#241339] px-3 py-2 text-sm font-black text-white shadow-[0_4px_0_#130e28] transition-transform hover:-translate-y-0.5"
      >
        <HomeIcon />
        الرئيسية
      </Link>
      <PixelHero overlap={false}>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          {GAME_COUNT} لعبة، تصير لكم للأبد
        </h1>

        <p className="mt-2 flex items-center justify-center gap-3" dir="rtl">
          <span className="text-6xl font-black leading-none sm:text-7xl">
            {price}
          </span>

          <RiyalSign className="text-4xl sm:text-5xl" />

          {isOnSale() && (
            <span className="relative text-2xl font-black opacity-50 sm:text-3xl">
              {PRICING.basePrice}
              <span className="absolute inset-x-[-4px] top-1/2 h-[3px] -rotate-12 rounded bg-current" />
            </span>
          )}
        </p>

        {isOnSale() && (
          <p className="mx-auto mt-3 w-fit rounded-lg bg-[#241339] px-3 py-1 text-sm font-black text-[#ffc23d]">
            سعر الإطلاق لين 1 يناير
          </p>
        )}
      </PixelHero>

      <div className="mx-auto mt-6 max-w-md px-4 pb-8">
        {error && ERRORS[error] && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-[#3a1730] px-4 py-3 text-center text-sm font-bold text-red-100"
          >
            {ERRORS[error]}
          </p>
        )}

        <BuyForm
          initialRef={
            referral
              ? { code: referral.code, discount: referral.discount }
              : null
          }
          publishableKey={process.env.MOYASAR_PUBLISHABLE_KEY ?? ""}
          amount={toHalalas(price)}
          applePay={process.env.APPLE_PAY_ENABLED === "true"}
          next={safeNextPath(next)}
        />

        <section className="mt-8">
          <h2 className="text-center text-base font-black text-white/80">
            الألعاب اللي تاخذونها
          </h2>

          <ul className="mt-3 grid grid-cols-4 gap-2">
            {GAME_POSTERS.map((game) => (
              <li
                key={game.key}
                className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#221a3f]"
              >
                <Image
                  src={posterThumb(game.image)}
                  alt={game.title}
                  fill
                  unoptimized
                  sizes="100px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <SiteFooter />
      </div>
    </main>
  );
}

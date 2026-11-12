"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PixelHero from "@/components/PixelHero";
import SaudiMadeSticker from "@/components/SaudiMadeSticker";
import SiteFooter from "@/components/SiteFooter";
import { HOME_GAMES } from "@/data/homeGames";
import { posterThumb } from "@/lib/poster";
import { PRICING, getCurrentPrice } from "@/lib/pricing";
import {
  ACTIVE_SEASON,
  isSeason,
  SEASON_THEMES,
  type Season,
} from "@/lib/season";

const STEPS = [
  {
    title: "قسموا نفسكم فريقين",
    text: "جهاز واحد يكفي، وصاحب الجلسة يحكم",
  },
  { title: "اختاروا ألعابكم", text: "لعبة وحدة أو العشر كلها" },
  { title: "اللي يجمع أكثر يفوز", text: "النقاط تنجمع لين آخر جولة" },
];

export default function Home() {
  const router = useRouter();

  const [season, setSeason] = useState<Season>(ACTIVE_SEASON);

  const theme = SEASON_THEMES[season];

  useEffect(() => {
    router.prefetch("/match?mode=session");
    router.prefetch("/quick");

    const warm = () => {
      HOME_GAMES.forEach((game) => {
        const image = new window.Image();
        image.src = posterThumb(game.image);
      });
    };

    const idle =
      window.requestIdleCallback ??
      ((fn: () => void) => window.setTimeout(fn, 300));

    idle(warm);

    const preview = new URLSearchParams(window.location.search).get("season");

    if (isSeason(preview)) {
      setSeason(preview);
    }
  }, [router]);

  return (
    <main className="min-h-[100svh] text-white">
      <PixelHero overlap={false} season={season}>
        <h1 className="mt-4 text-balance text-3xl font-black leading-snug sm:text-5xl sm:leading-tight">
          {theme.headline}
        </h1>

        {theme.subline && (
          <p
            className="mx-auto mt-2 max-w-lg text-base font-bold sm:text-lg"
            style={{ color: theme.heroSubText }}
          >
            {theme.subline}
          </p>
        )}
      </PixelHero>

      <div className="mx-auto mt-6 max-w-[1100px] px-4">
        <div className="relative z-10 mx-auto grid max-w-3xl items-stretch gap-4 sm:grid-cols-5">
          <Link
            href="/match?mode=session"
            prefetch={false}
            className="block rounded-2xl p-6 text-right transition-transform sm:col-span-3 hover:-translate-y-1 active:translate-y-0.5 sm:p-7"
            style={{
              background: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: `0 7px 0 ${theme.buttonEdge}`,
            }}
          >
            <span className="text-sm font-black opacity-70">اللي نوصي فيه</span>

            <span className="mt-1 block text-3xl font-black">تحدي الجلسة</span>

            <span className="mt-2 block text-base font-bold leading-7 opacity-80">
              كم لعبة ورا بعض، تنجمع نقاطكم، وبالأخير فريق واحد يفوز
            </span>
          </Link>

          <Link
            href="/quick"
            prefetch={false}
            className="flex flex-col justify-center rounded-2xl bg-[#2f9bff] p-5 text-right text-white shadow-[0_7px_0_#1662b8] transition-transform hover:-translate-y-1 active:translate-y-0.5 sm:col-span-2 sm:p-6"
          >
            <span className="text-sm font-black text-white/75">
              ما عندكم وقت؟
            </span>

            <span className="mt-1 block text-2xl font-black">لعبة سريعة</span>

            <span className="mt-2 block text-sm font-bold leading-6 text-white/85">
              اختاروا لعبة وحدة وابدأوا على طول
            </span>
          </Link>
        </div>

        <Link
          href="/buy"
          prefetch={false}
          className="mx-auto mt-6 flex w-fit flex-wrap items-baseline justify-center gap-x-2 rounded-xl px-3 py-2 text-center text-sm font-bold text-white/70 transition-colors hover:text-white sm:text-base"
        >
          <span>كل الألعاب بـ</span>

          {PRICING.onSale && (
            <span className="text-white/40 line-through">
              {PRICING.basePrice}
            </span>
          )}

          <span className="text-lg font-black text-[#ffc23d] sm:text-xl">
            {getCurrentPrice()} ريال
          </span>

          <span>تدفعونها مرة وحدة بدون اشتراك</span>
        </Link>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-black sm:text-3xl">
            كيف تلعبون؟
          </h2>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex items-center gap-4 p-2 sm:justify-center"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#ffc23d] text-2xl font-black text-[#241339] shadow-[0_3px_0_#c27700]">
                  {index + 1}
                </span>

                <span>
                  <span className="block text-lg font-black">{step.title}</span>

                  <span className="block text-sm font-bold text-white/55">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <SaudiMadeSticker />

        <SiteFooter />
      </div>
    </main>
  );
}

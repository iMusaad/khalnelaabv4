"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PixelHero from "@/components/PixelHero";
import SiteFooter from "@/components/SiteFooter";
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

const guideLink = (
  <Link
    href="/guide"
    prefetch={false}
    className="rounded-xl bg-[#241339] px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_#0e0a1f]"
  >
    طريقة اللعب
  </Link>
);

export default function Home() {
  const router = useRouter();

  const [season, setSeason] = useState<Season>(ACTIVE_SEASON);

  const theme = SEASON_THEMES[season];

  useEffect(() => {
    router.prefetch("/match?mode=session");
    router.prefetch("/quick");

    const preview = new URLSearchParams(window.location.search).get("season");

    if (isSeason(preview)) {
      setSeason(preview);
    }
  }, [router]);

  return (
    <main className="min-h-[100svh] text-white">
      <PixelHero action={guideLink} overlap={false} season={season}>
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
        <div className="relative z-10 mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <Link
            href="/match?mode=session"
            prefetch={false}
            className="block rounded-2xl p-6 text-right transition-transform hover:-translate-y-1 active:translate-y-0.5 sm:p-7"
            style={{
              background: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: `0 7px 0 ${theme.buttonEdge}`,
            }}
          >
            <span className="text-sm font-black opacity-70">
              اللي نوصي فيه 🏆
            </span>

            <span className="mt-1 block text-3xl font-black">تحدي الجلسة</span>

            <span className="mt-2 block text-base font-bold leading-7 opacity-80">
              كم لعبة ورا بعض، تنجمع نقاطكم، وبالأخير فريق واحد يفوز
            </span>
          </Link>

          <Link
            href="/quick"
            prefetch={false}
            className="block rounded-2xl bg-[#221a3f] p-6 text-right shadow-[0_7px_0_#140f29] transition-transform hover:-translate-y-1 active:translate-y-0.5 sm:p-7"
          >
            <span className="text-sm font-black text-white/50">
              ما عندكم وقت؟
            </span>

            <span className="mt-1 block text-3xl font-black">لعبة سريعة</span>

            <span className="mt-2 block text-base font-bold leading-7 text-white/60">
              اختاروا لعبة وحدة وابدأوا على طول
            </span>
          </Link>
        </div>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-black sm:text-3xl">
            كيف تلعبون؟
          </h2>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex items-center gap-4 rounded-xl bg-[#221a3f] p-4 shadow-[0_5px_0_#140f29]"
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

        <SiteFooter />
      </div>
    </main>
  );
}

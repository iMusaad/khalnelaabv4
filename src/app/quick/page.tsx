import type { Metadata } from "next";
import Link from "next/link";
import HomeIcon from "@/components/HomeIcon";
import PixelHero from "@/components/PixelHero";
import SiteFooter from "@/components/SiteFooter";
import { HOME_GAMES } from "@/data/homeGames";

export const metadata: Metadata = {
  title: "لعبة سريعة | خل نلعب",
};

const THEMES = [
  {
    bg: "#2f9bff",
    fg: "#ffffff",
    edge: "#1662b8",
    sub: "rgba(255,255,255,0.8)",
  },
  { bg: "#ff8a1e", fg: "#241339", edge: "#b85a00", sub: "rgba(36,19,57,0.75)" },
  {
    bg: "#241339",
    fg: "#ffc23d",
    edge: "#0e0a1f",
    sub: "rgba(255,255,255,0.6)",
  },
  { bg: "#ffc23d", fg: "#241339", edge: "#c27700", sub: "rgba(36,19,57,0.75)" },
];

const homeLink = (
  <Link
    href="/"
    className="inline-flex items-center gap-2 rounded-xl bg-[#241339] px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_#0e0a1f]"
  >
    <HomeIcon />
    الرئيسية
  </Link>
);

export default function QuickPage() {
  return (
    <main className="min-h-[100svh] text-white">
      <PixelHero action={homeLink}>
        <h1 className="mt-5 text-3xl font-black sm:text-5xl">لعبة سريعة</h1>

        <p className="mx-auto mt-2 max-w-lg text-base font-bold opacity-75 sm:text-lg">
          اختاروا لعبة وتبدأ على طول
        </p>
      </PixelHero>

      <div className="mx-auto -mt-16 max-w-[1100px] px-4">
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {HOME_GAMES.map((game, index) => {
            const theme = THEMES[index % THEMES.length];

            return (
              <Link
                key={game.id}
                href={`/match?game=${game.id}`}
                className="flex min-h-[132px] flex-col justify-between rounded-xl p-4 text-right transition-transform hover:-translate-y-1 active:translate-y-0.5"
                style={{
                  background: theme.bg,
                  color: theme.fg,
                  boxShadow: `0 6px 0 ${theme.edge}`,
                }}
              >
                <span className="text-xl font-black leading-tight sm:text-2xl">
                  {game.title}
                </span>

                <span
                  className="mt-3 text-xs font-bold leading-5 sm:text-sm"
                  style={{ color: theme.sub }}
                >
                  {game.text}
                  {game.phone && (
                    <span className="block font-black">يحتاج جوال</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm font-bold text-white/50">
          تبون أكثر من لعبة؟{" "}
          <Link
            href="/match?mode=session"
            className="font-black text-[#ffc23d] underline underline-offset-4"
          >
            سوّوا تحدي جلسة
          </Link>
        </p>

        <SiteFooter />
      </div>
    </main>
  );
}

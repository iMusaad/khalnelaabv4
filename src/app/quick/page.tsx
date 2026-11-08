import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HomeIcon from "@/components/HomeIcon";
import PixelHero from "@/components/PixelHero";
import SiteFooter from "@/components/SiteFooter";
import { HOME_GAMES } from "@/data/homeGames";

export const metadata: Metadata = {
  title: "لعبة سريعة | خل نلعب",
};

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
        <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {HOME_GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/match?game=${game.id}`}
              aria-label={game.title}
              className="group block rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#ffc23d]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_6px_0_#0e0a1f] transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5">
                <Image
                  src={game.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 210px"
                  className="object-cover"
                />
              </div>

              <p className="mt-2 text-center text-xs font-bold text-white/55 sm:text-sm">
                {game.text}
                {game.phone && (
                  <span className="block font-black text-[#ffc23d]">
                    يحتاج جوال
                  </span>
                )}
              </p>
            </Link>
          ))}
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

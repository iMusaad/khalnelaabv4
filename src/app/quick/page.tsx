import type { Metadata } from "next";
import Image from "next/image";
import { posterThumb } from "@/lib/poster";
import Link from "next/link";
import HomeLogoLink from "@/components/HomeLogoLink";
import PixelHero from "@/components/PixelHero";
import { HOME_GAMES } from "@/data/homeGames";

export const metadata: Metadata = {
  title: "لعبة سريعة | خل نلعب",
};

export default function QuickPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-clip pb-6 text-white">
      <HomeLogoLink />

      <PixelHero logo={false} overlap={false} compact>
        <h1 className="pt-16 text-2xl font-black sm:pt-0 sm:text-3xl lg:text-4xl">
          لعبة سريعة
        </h1>

        <p className="mt-2 text-sm font-black opacity-70 sm:text-base">
          اختاروا لعبة وتبدأ على طول
        </p>
      </PixelHero>

      <div className="mx-auto mt-6 w-full max-w-[924px] px-3">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {HOME_GAMES.map((game, index) => (
            <Link
              key={game.id}
              href={`/match?game=${game.id}`}
              aria-label={game.title}
              className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl outline-none outline-2 outline-offset-2 transition-[outline-color,transform] duration-150 hover:-translate-y-1 hover:outline hover:outline-[#ffc23d] focus-visible:outline focus-visible:outline-[#ffc23d] ${
                index === HOME_GAMES.length - 1
                  ? "col-start-2 sm:col-start-auto"
                  : ""
              }`}
            >
              <Image
                src={posterThumb(game.image)}
                alt=""
                fill
                unoptimized
                priority
                className="object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

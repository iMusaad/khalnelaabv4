import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PixelHero from "@/components/PixelHero";
import { HOME_GAMES } from "@/data/homeGames";

export const metadata: Metadata = {
  title: "لعبة سريعة | خل نلعب",
};

export default function QuickPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-clip pb-6 text-white">
      <Link
        href="/"
        aria-label="خل نلعب، الرجوع للرئيسية"
        className="fixed right-3 top-3 z-[60] block rounded-xl outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/70 sm:right-4 sm:top-4"
      >
        <Image
          src="/logo.png"
          alt=""
          width={280}
          height={200}
          priority
          className="h-auto w-[62px] [filter:drop-shadow(2px_0_0_#241339)_drop-shadow(-2px_0_0_#241339)_drop-shadow(0_2px_0_#241339)_drop-shadow(0_-2px_0_#241339)_drop-shadow(0_4px_0_#241339)] sm:w-[64px] xl:w-[78px]"
        />
      </Link>

      <PixelHero logo={false} overlap={false} compact>
        <h1 className="pt-16 text-2xl font-black sm:pt-0 sm:text-3xl lg:text-4xl">
          لعبة سريعة
        </h1>

        <p className="mt-2 text-sm font-black opacity-70 sm:text-base">
          اختاروا لعبة وتبدأ على طول
        </p>
      </PixelHero>

      <div className="mx-auto mt-6 w-full max-w-[724px] px-3">
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
                src={game.image}
                alt=""
                fill
                sizes="(max-width: 640px) 30vw, 130px"
                className="object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

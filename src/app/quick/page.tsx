import type { Metadata } from "next";
import { cookies } from "next/headers";
import LockIcon from "@/components/LockIcon";
import { getLicenseSecrets, verifyLicenseCode } from "@/lib/license";
import { LICENSE_COOKIE, isPaywallEnabled } from "@/lib/licenseCookie";
import { isFreeGame } from "@/lib/trial";
import Image from "next/image";
import { posterThumb } from "@/lib/poster";
import Link from "next/link";
import HomeLogoLink from "@/components/HomeLogoLink";
import PixelHero from "@/components/PixelHero";
import PosterFlip from "@/components/PosterFlip";
import type { GameType } from "@/lib/matchQueue";
import { PLAYABLE_CARDS, QUIZ_COLORS, QUIZ_LABELS } from "@/data/quizCards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لعبة سريعة | خل نلعب",
};

async function isPaid() {
  if (!isPaywallEnabled()) {
    return true;
  }

  const code = (await cookies()).get(LICENSE_COOKIE)?.value;

  return code
    ? (await verifyLicenseCode(code, getLicenseSecrets())).valid
    : false;
}

export default async function QuickPage() {
  const paid = await isPaid();

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
          {PLAYABLE_CARDS.map((game, index) => {
            const href = game.category
              ? `/match?game=quiz&category=${game.category}`
              : `/match?game=${game.id}`;

            const open = paid || isFreeGame(game.id, game.category);

            return (
              <div
                key={game.key}
                className={
                  PLAYABLE_CARDS.length % 3 === 1 &&
                  index === PLAYABLE_CARDS.length - 1
                    ? "col-start-2 sm:col-start-auto"
                    : ""
                }
              >
                <PosterFlip game={game.id as GameType}>
                  <Link
                    href={open ? href : `/buy?next=${encodeURIComponent(href)}`}
                    aria-label={game.title}
                    className="group relative block h-full w-full overflow-hidden rounded-2xl outline-none outline-2 outline-offset-2 transition-[outline-color,transform] duration-150 hover:-translate-y-1 hover:outline hover:outline-[#ffc23d] focus-visible:outline focus-visible:outline-[#ffc23d]"
                  >
                    <Image
                      src={posterThumb(game.image)}
                      alt=""
                      fill
                      unoptimized
                      priority
                      className="object-cover"
                    />

                    {game.category && (
                      <span
                        className="absolute inset-x-0 bottom-0 px-1 pb-2 pt-1.5 text-center text-base font-black text-white sm:text-lg"
                        style={{ background: QUIZ_COLORS[game.category] }}
                      >
                        {QUIZ_LABELS[game.category]}
                      </span>
                    )}

                    {!open && (
                      <span className="absolute inset-0 flex items-end justify-center bg-[#130e28]/55 pb-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffc23d] text-[#241339] shadow-[0_3px_0_#c27700]">
                          <LockIcon />
                        </span>
                      </span>
                    )}
                  </Link>
                </PosterFlip>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

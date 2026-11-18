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
import { PLAYABLE_CARDS } from "@/data/quizCards";

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

const ZOOM_GROUP = ["car", "logo", "geo", "zoom"];
const GUESS_GROUP = ["scramble", "club", "country"];

const quizCards = PLAYABLE_CARDS.filter((card) => card.category);
const zoomCards = PLAYABLE_CARDS.filter(
  (card) => !card.category && ZOOM_GROUP.includes(card.id),
);
const guessCards = PLAYABLE_CARDS.filter(
  (card) => !card.category && GUESS_GROUP.includes(card.id),
);
const otherCards = PLAYABLE_CARDS.filter(
  (card) =>
    !card.category &&
    !ZOOM_GROUP.includes(card.id) &&
    !GUESS_GROUP.includes(card.id),
);

export default async function QuickPage() {
  const paid = await isPaid();

  function card(game: (typeof PLAYABLE_CARDS)[number]) {
    const href = game.category
      ? `/match?game=quiz&category=${game.category}`
      : `/match?game=${game.id}`;

    const open = paid || isFreeGame(game.id, game.category);

    return (
      <div key={game.key}>
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
  }

  function section(
    title: string,
    dot: string,
    cards: typeof PLAYABLE_CARDS,
    cols: string,
  ) {
    if (cards.length === 0) {
      return null;
    }

    return (
      <section className="rounded-3xl bg-[#1b1535] p-3 shadow-[0_6px_0_#0e0a1f] sm:p-4">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black sm:text-xl">
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ background: dot }}
          />
          {title}
        </h2>
        <div className={`grid items-start gap-2.5 ${cols}`}>
          {cards.map(card)}
        </div>
      </section>
    );
  }

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

      <div className="mx-auto mt-6 w-full max-w-[1160px] px-3">
        <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
          {section("أسئلة", "#ff5a5f", quizCards, "grid-cols-4")}
          {section("زوم", "#2f9bff", zoomCards, "grid-cols-3")}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {section("نعم أو لا", "#ffc23d", guessCards, "grid-cols-3")}
          {section("كلمات", "#3ddc84", otherCards, "grid-cols-3")}
        </div>
      </div>
    </main>
  );
}

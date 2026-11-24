"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { posterThumb } from "@/lib/poster";
import PosterFlip from "@/components/PosterFlip";
import TeamSplitter from "@/components/TeamSplitter";
import LockIcon from "@/components/LockIcon";
import { FREE_QUIZ_CATEGORIES, isFreeGame } from "@/lib/trial";
import { UPCOMING_GAME_IDS } from "@/data/upcomingGames";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import PixelHero from "@/components/PixelHero";
import { quizCategoryList, type QuizCategoryKey } from "@/data/quiz/meta";
import { QUIZ_LABELS } from "@/data/quizCards";
import { trackEvent } from "@/lib/analytics";
import { getDefaultRounds } from "@/lib/matchQueue";

type SetupGameId =
  | "word"
  | "quiz"
  | "scramble"
  | "wheel"
  | "categories"
  | "draw"
  | "logo"
  | "country"
  | "club"
  | "car"
  | "zoom"
  | "focus"
  | "letters"
  | "geo";

type SetupGameProps = {
  mode?: "session" | "quick";
  side1: string;
  side2: string;
  setSide1: (value: string) => void;
  setSide2: (value: string) => void;
  selectedGames: SetupGameId[];
  pinnedGame?: SetupGameId | null;
  setSelectedGames: Dispatch<SetStateAction<SetupGameId[]>>;
  quizCategories: QuizCategoryKey[];
  setQuizCategories: Dispatch<SetStateAction<QuizCategoryKey[]>>;
  timerEnabled: boolean;
  setTimerEnabled: (value: boolean) => void;
  timerSeconds: number;
  setTimerSeconds: (value: number) => void;
  onStart: () => void;
  trial?: boolean;
};

const GAMES: {
  id: SetupGameId;
  name: string;
  image: string;
}[] = [
  {
    id: "logo",
    name: "عينك عالشعار",
    image: "/images/posters/Logogame-2.png",
  },
  {
    id: "car",
    name: "عينك عالموتر",
    image: "/images/posters/Cargame-2.png",
  },
  {
    id: "scramble",
    name: "منهو ذا؟",
    image: "/images/posters/Whogame-2.png",
  },
  {
    id: "club",
    name: "وش ناديك؟",
    image: "/images/posters/Clubgame-2.png",
  },
  {
    id: "country",
    name: "وش علمك؟",
    image: "/images/posters/Countries-2.png",
  },
  {
    id: "geo",
    name: "ثبّت الموقع",
    image: "/images/posters/Geogame-3.png",
  },
  {
    id: "categories",
    name: "إنسان حيوان نبات جماد بلاد",
    image: "/images/posters/Categoriesgame-2.png",
  },
  {
    id: "word",
    name: "خمن الكلمة",
    image: "/images/posters/wordgame-2.png",
  },
  {
    id: "wheel",
    name: "لف وخمن",
    image: "/images/posters/Wheelgame-2.png",
  },
  {
    id: "draw",
    name: "خمن المثل",
    image: "/images/posters/Proverbgame-2.png",
  },
  {
    id: "quiz",
    name: "أسئلة وأجوبة",
    image: "/images/posters/Quizgame-2.png",
  },
  {
    id: "zoom",
    name: "عينك عالبوستر",
    image: "/images/posters/Postergame.png",
  },
  {
    id: "focus",
    name: "ركز يانايم",
    image: "/images/posters/Focusgame.png",
  },
  {
    id: "letters",
    name: "خلية الحروف",
    image: "/images/posters/Lettersgame.png",
  },
];

const MAX_SESSION_GAMES = 5;

type SetupCard = {
  key: string;
  game: SetupGameId;
  category?: QuizCategoryKey;
  name: string;
  image: string;
};

function toCards(games: typeof GAMES): SetupCard[] {
  return games.flatMap<SetupCard>((game) =>
    game.id === "quiz"
      ? quizCategoryList.map((category) => ({
          key: `quiz-${category.key}`,
          game: game.id,
          category: category.key,
          name: `أسئلة ${QUIZ_LABELS[category.key]}`,
          image: `/images/posters/Quiz-${category.key}.png`,
        }))
      : [{ key: game.id, game: game.id, name: game.name, image: game.image }],
  );
}

const MINUTES_PER_ROUND: Record<SetupGameId, number> = {
  word: 4,
  quiz: 5,
  scramble: 3,
  wheel: 6,
  categories: 4,
  draw: 4,
  logo: 3,
  country: 5,
  club: 5,
  car: 4,
  zoom: 4,
  focus: 4,
  letters: 8,
  geo: 5,
};

function estimateMinutes(games: SetupGameId[], quizCategoryCount: number) {
  const total = games.reduce((sum, game) => {
    const count =
      game === "quiz" ? Math.max(1, quizCategoryCount) : getDefaultRounds(game);

    return sum + count * MINUTES_PER_ROUND[game];
  }, 0);

  return Math.max(5, Math.round(total / 5) * 5);
}

export default function SetupGame({
  mode = "session",
  side1,
  side2,
  setSide1,
  setSide2,
  selectedGames,
  pinnedGame = null,
  setSelectedGames,
  quizCategories,
  setQuizCategories,
  timerEnabled,
  setTimerEnabled,
  timerSeconds,
  setTimerSeconds,
  onStart,
  trial = false,
}: SetupGameProps) {
  const router = useRouter();

  const isQuickMode = mode === "quick";

  const needsQuizCategory =
    selectedGames.includes("quiz") && quizCategories.length === 0;

  function goBuy() {
    router.push(
      `/buy?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
  }

  const selectedCount =
    selectedGames.filter((game) => game !== "quiz").length +
    (selectedGames.includes("quiz") ? quizCategories.length : 0);

  function isCardActive(card: SetupCard) {
    return card.category
      ? selectedGames.includes("quiz") && quizCategories.includes(card.category)
      : selectedGames.includes(card.game);
  }

  function isCardPaywalled(card: SetupCard) {
    if (!trial) return false;

    return card.category
      ? !FREE_QUIZ_CATEGORIES.includes(card.category)
      : !isFreeGame(card.game);
  }

  function toggleCard(card: SetupCard) {
    if (isQuickMode) {
      return;
    }

    if (isCardPaywalled(card)) {
      trackEvent("locked_game_click", { game: card.key });
      goBuy();
      return;
    }

    const active = isCardActive(card);

    if (!active && selectedCount >= MAX_SESSION_GAMES) {
      return;
    }

    if (!card.category) {
      setSelectedGames((previous) =>
        active
          ? previous.filter((game) => game !== card.game)
          : previous.includes(card.game)
            ? previous
            : [...previous, card.game],
      );

      return;
    }

    const category = card.category;

    if (active) {
      const remaining = quizCategories.filter((item) => item !== category);

      setQuizCategories(remaining);

      if (remaining.length === 0) {
        setSelectedGames((previous) =>
          previous.filter((game) => game !== "quiz"),
        );
      }

      return;
    }

    setQuizCategories((previous) =>
      selectedGames.includes("quiz")
        ? previous.includes(category)
          ? previous
          : [...previous, category]
        : [category],
    );

    setSelectedGames((previous) =>
      previous.includes("quiz") ? previous : [...previous, "quiz"],
    );
  }

  const orderedGames = pinnedGame
    ? [
        ...GAMES.filter((game) => game.id === pinnedGame),
        ...GAMES.filter((game) => game.id !== pinnedGame),
      ]
    : GAMES;

  const visibleGames = isQuickMode
    ? GAMES.filter((game) => selectedGames.includes(game.id))
    : orderedGames.filter(
        (game) =>
          !UPCOMING_GAME_IDS.includes(game.id) || game.id === pinnedGame,
      );

  const visibleCards = toCards(visibleGames).filter(
    (card) =>
      !isQuickMode ||
      !card.category ||
      quizCategories.length === 0 ||
      quizCategories.includes(card.category),
  );

  const minutes = estimateMinutes(selectedGames, quizCategories.length);

  const requiredGames = isQuickMode
    ? 1
    : Math.min(
        MAX_SESSION_GAMES,
        visibleCards.filter((card) => !isCardPaywalled(card)).length,
      );

  const missingGames = Math.max(0, requiredGames - selectedCount);

  const canStart = missingGames === 0 && !needsQuizCategory;

  const startHint =
    missingGames > 0
      ? isQuickMode
        ? "اختاروا لعبة"
        : missingGames === 1
          ? "باقي لعبة وحدة"
          : missingGames === 2
            ? "باقي لعبتين"
            : `اختاروا ${requiredGames} ألعاب، باقي ${missingGames}`
      : needsQuizCategory
        ? "اختاروا فئة للأسئلة"
        : "";

  const ZOOM_GROUP: SetupGameId[] = ["car", "logo", "geo", "zoom"];

  const quizCards = visibleCards.filter((card) => card.category);

  const zoomCards = visibleCards.filter(
    (card) => !card.category && ZOOM_GROUP.includes(card.game),
  );

  const GUESS_GROUP: SetupGameId[] = [
    "scramble",
    "club",
    "country",
    "focus",
    "letters",
  ];

  const guessCards = visibleCards.filter(
    (card) => !card.category && GUESS_GROUP.includes(card.game),
  );

  const otherCards = visibleCards.filter(
    (card) =>
      !card.category &&
      !ZOOM_GROUP.includes(card.game) &&
      !GUESS_GROUP.includes(card.game),
  );

  function renderCard(game: SetupCard) {
    const active = isCardActive(game);

    const locked =
      !isQuickMode && !active && selectedCount >= MAX_SESSION_GAMES;

    const paywalled = isCardPaywalled(game);

    return (
      <div key={game.key}>
        <PosterFlip game={game.game}>
          <button
            type="button"
            onClick={() => toggleCard(game)}
            disabled={isQuickMode || (locked && !paywalled)}
            aria-pressed={isQuickMode ? undefined : active}
            aria-label={game.name}
            className={`relative block h-full w-full overflow-hidden rounded-2xl outline outline-2 outline-offset-2 transition-[outline-color,opacity] duration-200 ${active ? "outline-[#ffc23d]" : "outline-transparent"} ${
              isQuickMode
                ? "cursor-default"
                : locked
                  ? "cursor-not-allowed opacity-35"
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

            {paywalled && (
              <span className="absolute inset-0 z-10 flex flex-col items-center justify-end bg-[#130e28]/55 pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffc23d] text-[#241339] shadow-[0_3px_0_#c27700]">
                  <LockIcon />
                </span>
              </span>
            )}

            {!isQuickMode && active && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffc23d] text-sm font-black text-[#1d1238]"
              >
                ✓
              </span>
            )}
          </button>
        </PosterFlip>
      </div>
    );
  }

  function section(
    title: string,
    dot: string,
    content: ReactNode,
    wide = false,
  ) {
    return (
      <section
        className={`rounded-3xl bg-[#1b1535] p-3 shadow-[0_6px_0_#0e0a1f] sm:p-4 ${
          wide ? "lg:col-span-2" : ""
        }`}
      >
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black sm:text-xl">
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full"
            style={{ background: dot }}
          />
          {title}
        </h2>
        {content}
      </section>
    );
  }

  return (
    <div className="text-white">
      <div className="-mx-3 -mt-16 sm:-mx-6 sm:-mt-6">
        <PixelHero logo={false} overlap={false} compact>
          <h1 className="pt-16 text-2xl font-black sm:pt-0 sm:text-3xl lg:text-4xl">
            {isQuickMode ? "جهزوا الفرق" : "تحدي الجلسة"}
          </h1>

          <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-2 sm:gap-3">
            {[
              { value: side1, set: setSide1, label: "فريق 1", dot: "#ff5a5f" },
              { value: side2, set: setSide2, label: "فريق 2", dot: "#2f9bff" },
            ].map((team) => (
              <label key={team.label} className="relative block">
                <span className="sr-only">{team.label}</span>

                <span
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
                  style={{ background: team.dot }}
                />

                <input
                  value={team.value}
                  maxLength={20}
                  autoComplete="off"
                  enterKeyHint="done"
                  onChange={(event) => team.set(event.target.value)}
                  placeholder={team.label}
                  className="h-11 w-full rounded-xl bg-[#241339] pl-3 pr-8 text-right text-base font-bold text-white outline-none shadow-[0_4px_0_#140a24] placeholder:text-white/40 focus:ring-2 focus:ring-white/60"
                />
              </label>
            ))}
          </div>

          <div className="mx-auto mt-3 flex max-w-2xl items-center justify-center gap-3 text-sm font-black">
            <button
              type="button"
              role="switch"
              aria-checked={timerEnabled}
              onClick={() => setTimerEnabled(!timerEnabled)}
              className="flex items-center gap-2"
            >
              <span
                className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${
                  timerEnabled ? "bg-[#241339]" : "bg-black/20"
                }`}
              >
                <span
                  className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all duration-200 ${
                    timerEnabled ? "left-[3px]" : "left-[19px]"
                  }`}
                />
              </span>
              مؤقت
            </button>

            {timerEnabled && (
              <span className="flex items-center gap-2">
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={timerSeconds}
                  aria-label="مدة المؤقت بالثواني"
                  onChange={(event) =>
                    setTimerSeconds(Number(event.target.value))
                  }
                  className="h-1 w-28 accent-[#241339]"
                />
                <span className="w-12 tabular-nums">{timerSeconds} ث</span>
              </span>
            )}

            <TeamSplitter team1={side1} team2={side2} />
          </div>
        </PixelHero>
      </div>

      <div
        className={`mx-auto mt-3 grid w-full gap-3 ${
          isQuickMode ? "max-w-[420px]" : "max-w-[1160px]"
        }`}
      >
        {isQuickMode ? (
          <div className="mx-auto grid w-full max-w-[200px] grid-cols-1 items-start gap-3">
            {visibleCards.map(renderCard)}
          </div>
        ) : (
          <div>
            <p className="mb-3 text-center text-sm font-black text-[#ffc23d]">
              اخترتوا {selectedCount} من {requiredGames}
            </p>

            <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
              {quizCards.length > 0 &&
                section(
                  "أسئلة",
                  "#ff5a5f",
                  <div className="grid grid-cols-4 items-start gap-2.5">
                    {quizCards.map(renderCard)}
                  </div>,
                )}

              {zoomCards.length > 0 &&
                section(
                  "زوم",
                  "#2f9bff",
                  <div className="grid grid-cols-3 items-start gap-2.5">
                    {zoomCards.map(renderCard)}
                  </div>,
                )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {guessCards.length > 0 &&
                section(
                  "نعم أو لا",
                  "#ffc23d",
                  <div className="grid grid-cols-3 items-start gap-2.5">
                    {guessCards.map(renderCard)}
                  </div>,
                )}

              {otherCards.length > 0 &&
                section(
                  "كلمات",
                  "#3ddc84",
                  <div className="grid grid-cols-3 items-start gap-2.5">
                    {otherCards.map(renderCard)}
                  </div>,
                )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-1 w-full max-w-[280px]">
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="btn-primary w-full py-3 text-lg"
          >
            ابدأوا
          </button>

          <p
            aria-live="polite"
            className="mt-2 min-h-[20px] text-center text-sm font-bold text-white/45"
          >
            {startHint ||
              (!isQuickMode && selectedGames.length > 0
                ? `تقريبًا ${minutes} دقيقة`
                : "")}
          </p>
        </div>
      </div>
    </div>
  );
}

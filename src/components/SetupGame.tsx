"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import PixelHero from "@/components/PixelHero";
import { quizCategoryList, type QuizCategoryKey } from "@/data/quiz/meta";

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
  | "car";

type SetupGameProps = {
  mode?: "session" | "quick";
  side1: string;
  side2: string;
  setSide1: (value: string) => void;
  setSide2: (value: string) => void;
  selectedGames: SetupGameId[];
  pinnedGame?: SetupGameId | null;
  setSelectedGames: Dispatch<SetStateAction<SetupGameId[]>>;
  gameRounds: Record<string, number>;
  setGameRounds: Dispatch<SetStateAction<Record<string, number>>>;
  quizCategories: QuizCategoryKey[];
  setQuizCategories: Dispatch<SetStateAction<QuizCategoryKey[]>>;
  timerEnabled: boolean;
  setTimerEnabled: (value: boolean) => void;
  timerSeconds: number;
  setTimerSeconds: (value: number) => void;
  onStart: () => void;
};

const GAMES: {
  id: SetupGameId;
  name: string;
  image: string;
}[] = [
  {
    id: "word",
    name: "خمن الكلمة",
    image: "/images/posters/wordgame-2.png",
  },
  {
    id: "scramble",
    name: "منهو ذا؟",
    image: "/images/posters/Whogame-2.png",
  },
  {
    id: "wheel",
    name: "لف وخمن",
    image: "/images/posters/Wheelgame-2.png",
  },
  {
    id: "categories",
    name: "إنسان حيوان نبات جماد بلاد",
    image: "/images/posters/Categoriesgame-2.png",
  },
  {
    id: "draw",
    name: "خمن المثل",
    image: "/images/posters/Proverbgame-2.png",
  },
  {
    id: "logo",
    name: "خمن الشعار",
    image: "/images/posters/Logogame-2.png",
  },
  {
    id: "car",
    name: "عينك عالموتر",
    image: "/images/posters/Cargame-2.png",
  },
  {
    id: "country",
    name: "وش علمك؟",
    image: "/images/posters/Countries-2.png",
  },
  {
    id: "club",
    name: "وش ناديك؟",
    image: "/images/posters/Clubgame-2.png",
  },
  {
    id: "quiz",
    name: "أسئلة وأجوبة",
    image: "/images/posters/Quizgame-2.png",
  },
];

function getRoundOptions(gameId: string) {
  switch (gameId) {
    case "quiz":
      return [];

    case "word":
      return [2, 4, 6];

    default:
      return [1, 2, 3];
  }
}

function getDefaultRounds(gameId: string) {
  switch (gameId) {
    case "quiz":
      return 6;

    case "word":
    case "scramble":
      return 2;

    default:
      return 1;
  }
}

const MAX_SESSION_GAMES = 5;

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
};

function estimateMinutes(
  games: SetupGameId[],
  rounds: Record<string, number>,
  quizCategoryCount: number,
) {
  const total = games.reduce((sum, game) => {
    const count =
      game === "quiz" ? Math.max(1, quizCategoryCount) : rounds[game] || 1;

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
  gameRounds,
  setGameRounds,
  quizCategories,
  setQuizCategories,
  timerEnabled,
  setTimerEnabled,
  timerSeconds,
  setTimerSeconds,
  onStart,
}: SetupGameProps) {
  const isQuickMode = mode === "quick";

  const needsQuizCategory =
    selectedGames.includes("quiz") && quizCategories.length === 0;

  const canStart = selectedGames.length > 0 && !needsQuizCategory;

  const startHint =
    selectedGames.length === 0
      ? "اختاروا لعبة وحدة على الأقل"
      : needsQuizCategory
        ? "اختاروا فئة للأسئلة"
        : "";

  function toggleGame(id: SetupGameId) {
    if (isQuickMode) {
      return;
    }

    if (selectedGames.includes(id)) {
      setSelectedGames((previous) => previous.filter((game) => game !== id));

      return;
    }

    if (selectedGames.length >= MAX_SESSION_GAMES) {
      return;
    }

    setSelectedGames((previous) =>
      previous.includes(id) || previous.length >= MAX_SESSION_GAMES
        ? previous
        : [...previous, id],
    );

    setGameRounds((previous) =>
      previous[id]
        ? previous
        : {
            ...previous,
            [id]: getDefaultRounds(id),
          },
    );
  }

  function toggleCategory(category: QuizCategoryKey) {
    setQuizCategories((previous) =>
      previous.includes(category)
        ? previous.filter((current) => current !== category)
        : [...previous, category],
    );
  }

  function selectRounds(gameId: SetupGameId, round: number) {
    setGameRounds((previous) => ({
      ...previous,
      [gameId]: round,
    }));
  }

  const orderedGames = pinnedGame
    ? [
        ...GAMES.filter((game) => game.id === pinnedGame),
        ...GAMES.filter((game) => game.id !== pinnedGame),
      ]
    : GAMES;

  const visibleGames = isQuickMode
    ? GAMES.filter((game) => selectedGames.includes(game.id))
    : orderedGames;

  const minutes = estimateMinutes(
    selectedGames,
    gameRounds,
    quizCategories.length,
  );

  return (
    <div className="intro text-white">
      <div className="-mx-3 -mt-16 sm:-mx-6 sm:-mt-6">
        <PixelHero logo={false} overlap={false} compact>
          <h1 className="pt-16 text-2xl font-black sm:pt-2 sm:text-4xl">
            {isQuickMode ? "جهزوا الفرق" : "اختاروا ألعابكم"}
          </h1>

          <div className="mx-auto mt-4 grid max-w-2xl grid-cols-2 gap-2 sm:gap-3">
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
          </div>
        </PixelHero>
      </div>

      <div
        className={`mx-auto mt-3 grid w-full gap-5 ${
          isQuickMode
            ? "max-w-[420px]"
            : "max-w-[1120px] lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start"
        }`}
      >
        <div>
          {!isQuickMode && (
            <p className="mb-2 text-left text-sm font-bold text-white/45">
              {selectedGames.length}/{MAX_SESSION_GAMES}
            </p>
          )}

          <div
            className={`grid gap-3 ${
              isQuickMode
                ? "mx-auto max-w-[200px] grid-cols-1"
                : "grid-cols-3 sm:grid-cols-5"
            }`}
          >
            {visibleGames.map((game, gameIndex) => {
              const active = selectedGames.includes(game.id);

              const locked =
                !isQuickMode &&
                !active &&
                selectedGames.length >= MAX_SESSION_GAMES;

              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => toggleGame(game.id)}
                  disabled={isQuickMode || locked}
                  aria-pressed={isQuickMode ? undefined : active}
                  aria-label={game.name}
                  className={`relative block aspect-[4/5] overflow-hidden rounded-2xl outline outline-2 outline-offset-2 transition-[outline-color,opacity] duration-200 ${
                    !isQuickMode &&
                    visibleGames.length % 3 === 1 &&
                    gameIndex === visibleGames.length - 1
                      ? "col-start-2 sm:col-start-auto"
                      : ""
                  } ${active ? "outline-[#ffc23d]" : "outline-transparent"} ${
                    isQuickMode
                      ? "cursor-default"
                      : locked
                        ? "cursor-not-allowed opacity-35"
                        : ""
                  }`}
                >
                  <Image
                    src={game.image}
                    alt=""
                    fill
                    sizes={
                      isQuickMode ? "200px" : "(max-width: 640px) 30vw, 150px"
                    }
                    className="object-cover"
                  />

                  {!isQuickMode && active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffc23d] text-sm font-black text-[#1d1238]"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-2xl bg-[#221a3f] p-3 shadow-[0_5px_0_#140f29] lg:mt-7">
          {selectedGames.length > 0 && (
            <ul className="mb-3 space-y-2">
              {GAMES.filter((game) => selectedGames.includes(game.id)).map(
                (game) => (
                  <li key={game.id}>
                    <p className="mb-1 text-sm font-black">{game.name}</p>

                    {game.id !== "quiz" ? (
                      <div
                        className="flex rounded-xl bg-[#15102b] p-1"
                        role="group"
                        aria-label={`عدد جولات ${game.name}`}
                      >
                        {getRoundOptions(game.id).map((round) => {
                          const selected = gameRounds[game.id] === round;

                          return (
                            <button
                              key={round}
                              type="button"
                              aria-pressed={selected}
                              aria-label={`${round} جولات`}
                              onClick={() => selectRounds(game.id, round)}
                              className={`flex h-7 flex-1 items-center justify-center rounded-lg text-sm font-black transition-colors duration-150 ${
                                selected
                                  ? "bg-white text-[#1d1238]"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {round}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#15102b] p-1">
                        {quizCategoryList.map((category) => {
                          const selected = quizCategories.includes(
                            category.key,
                          );

                          return (
                            <button
                              key={category.key}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleCategory(category.key)}
                              className={`h-7 rounded-lg px-1 text-xs font-black transition-colors duration-150 ${
                                selected
                                  ? "bg-white text-[#1d1238]"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {category.title}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}

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
        </aside>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
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

function getSelectedLabel(count: number) {
  if (count === 0) return "ما اخترتوا شي";
  if (count === 1) return "لعبة وحدة";
  if (count === 2) return "لعبتين";

  return `${count} ألعاب`;
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

    setSelectedGames((previous) =>
      previous.includes(id) ? previous : [...previous, id],
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

  return (
    <div className="intro mx-auto w-full max-w-[1100px] pb-6 text-white sm:px-2">
      <header className="text-center">
        <p className="text-sm font-bold text-white/45">
          {isQuickMode ? "لعبة سريعة" : "تحدي الجلسة"}
        </p>

        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          {isQuickMode ? "جهزوا الفرق" : "اختاروا ألعابكم"}
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-black">الفرق</h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white/60">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#ff5a5f]"
              />
              الفريق الأول
            </span>

            <input
              value={side1}
              maxLength={20}
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => setSide1(event.target.value)}
              placeholder="فريق 1"
              className="h-12 w-full rounded-xl border border-white/15 bg-transparent px-4 text-right text-base font-bold text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white/60">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#2f9bff]"
              />
              الفريق الثاني
            </span>

            <input
              value={side2}
              maxLength={20}
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => setSide2(event.target.value)}
              placeholder="فريق 2"
              className="h-12 w-full rounded-xl border border-white/15 bg-transparent px-4 text-right text-base font-bold text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/50"
            />
          </label>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-base font-black">المؤقت</p>

              <p className="mt-0.5 text-sm font-bold text-white/45">
                {timerEnabled
                  ? `${timerSeconds} ثانية، وضعفها لإنسان حيوان والعلم والنادي`
                  : "اختياري"}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={timerEnabled}
              aria-label="تشغيل المؤقت"
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                timerEnabled ? "bg-[#ffc23d]" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all duration-300 ${
                  timerEnabled ? "left-[3px]" : "left-[23px]"
                }`}
              />
            </button>
          </div>

          {timerEnabled && (
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={timerSeconds}
              aria-label="مدة المؤقت بالثواني"
              onChange={(event) => setTimerSeconds(Number(event.target.value))}
              className="mt-3 h-1 w-full accent-[#ffc23d]"
            />
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div className="text-right">
            <h2 className="text-lg font-black">
              {isQuickMode ? "اللعبة" : "الألعاب"}
            </h2>

            <p className="mt-0.5 text-sm font-bold text-white/45">
              {isQuickMode
                ? "اضبطوها وابدأوا"
                : "اضغطوا على اللعبة وتطلع إعداداتها تحتها"}
            </p>
          </div>

          {!isQuickMode && (
            <p className="shrink-0 text-sm font-bold text-white/45">
              {selectedGames.length} من {GAMES.length}
            </p>
          )}
        </div>

        <div
          className={`mt-4 grid items-start gap-3 ${
            isQuickMode
              ? "mx-auto max-w-[230px] grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          }`}
        >
          {visibleGames.map((game) => {
            const active = selectedGames.includes(game.id);

            const roundOptions = getRoundOptions(game.id);

            return (
              <div key={game.id}>
                <button
                  type="button"
                  onClick={() => toggleGame(game.id)}
                  disabled={isQuickMode}
                  aria-pressed={isQuickMode ? undefined : active}
                  aria-label={game.name}
                  className={`group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl outline outline-2 outline-offset-2 transition-[outline-color,opacity] duration-200 ${
                    active ? "outline-[#ffc23d]" : "outline-transparent"
                  } ${isQuickMode ? "cursor-default" : active ? "" : ""}`}
                >
                  <Image
                    src={game.image}
                    alt=""
                    fill
                    sizes={
                      isQuickMode
                        ? "230px"
                        : "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
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

                {active && (
                  <div className="pt-3">
                    {game.id !== "quiz" ? (
                      <>
                        <p className="mb-1.5 text-center text-xs font-bold text-white/50">
                          عدد الجولات
                        </p>

                        <div className="flex rounded-xl bg-white/[0.06] p-1">
                          {roundOptions.map((round) => {
                            const selected = gameRounds[game.id] === round;

                            return (
                              <button
                                key={round}
                                type="button"
                                aria-pressed={selected}
                                aria-label={`عدد الجولات ${round}`}
                                onClick={() => selectRounds(game.id, round)}
                                className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-black transition-colors duration-200 ${
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
                      </>
                    ) : (
                      <>
                        <p className="mb-1.5 text-center text-xs font-bold text-white/50">
                          الفئات · كل فئة جولة
                        </p>

                        <div className="grid grid-cols-2 gap-1.5">
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
                                className={`flex min-h-[40px] min-w-0 items-center justify-center rounded-lg px-1 text-xs font-black leading-tight transition-colors duration-200 ${
                                  selected
                                    ? "bg-white text-[#1d1238]"
                                    : "bg-white/[0.06] text-white/60 hover:text-white"
                                }`}
                              >
                                <span className="max-w-full truncate">
                                  {category.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-10 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="btn-primary min-w-[240px] px-10 py-3 text-lg"
        >
          ابدأوا
        </button>

        <p
          aria-live="polite"
          className="min-h-[16px] text-sm font-bold text-white/45"
        >
          {startHint ||
            (!isQuickMode ? getSelectedLabel(selectedGames.length) : "")}
        </p>
      </div>
    </div>
  );
}

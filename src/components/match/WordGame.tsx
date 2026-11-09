"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import GameLayout from "@/components/match/GameLayout";
import { WORDS } from "@/data/words";
import { createDeck } from "@/lib/deck";
import {
  WORD_LENGTH,
  evaluateGuess,
  isPlayableWord,
  keyboardLetters,
  keyboardRows,
  normalizeArabic,
  type CellState,
} from "@/lib/wordRules";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { WinnerType } from "@/types/game";

type TeamSide = "side1" | "side2";

const MAX_TRIES = 6;

const FLIP_STEP = 230;

const FLIP_DURATION = 460;

const REVEAL_MS = FLIP_STEP * (WORD_LENGTH - 1) + FLIP_DURATION;

const BOUNCE_STEP = 90;

const TILE_COLORS: Record<
  CellState,
  { bg: string; border: string; text: string }
> = {
  correct: { bg: "#22c55e", border: "#4ade80", text: "#ffffff" },
  present: { bg: "#facc15", border: "#fde047", text: "#000000" },
  absent: { bg: "#2f3750", border: "#4b5676", text: "#ffffff" },
};

type WordRoundState = {
  answer: string;
  category: string;
  guesses: string[];
  status: "playing" | "lost";
  keyStatus: Record<string, CellState>;
  removedLetters: string[];
  activeSide: TeamSide;
  side1HintUsed: boolean;
  side2HintUsed: boolean;
  revealedLetters?: string[];
  side1RevealUsed?: boolean;
  side2RevealUsed?: boolean;
};

const wordDeck = createDeck(
  WORDS.filter((word) => isPlayableWord(word.answer)),
);

export default function WordGame({
  onRoundEnd,
  roundKey,
  side1Name = "فريق 1",
  side2Name = "فريق 2",
  side1Score = 0,
  side2Score = 0,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 30,
}: {
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  side1Name?: string;
  side2Name?: string;
  side1Score?: number;
  side2Score?: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
}) {
  const [answer, setAnswer] = useState("");

  const [category, setCategory] = useState("");

  const [loaded, setLoaded] = useState(false);

  const [guesses, setGuesses] = useState<string[]>([]);

  const [current, setCurrent] = useState("");

  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const [keyStatus, setKeyStatus] = useState<Record<string, CellState>>({});

  const [removedLetters, setRemovedLetters] = useState<string[]>([]);

  const [activeSide, setActiveSide] = useState<TeamSide>("side1");

  const [feedback, setFeedback] = useState("ابدأ التخمين");

  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const [side1HintUsed, setSide1HintUsed] = useState(false);

  const [side2HintUsed, setSide2HintUsed] = useState(false);

  const [revealedLetters, setRevealedLetters] = useState<string[]>([]);

  const [side1RevealUsed, setSide1RevealUsed] = useState(false);

  const [side2RevealUsed, setSide2RevealUsed] = useState(false);

  const [revealRow, setRevealRow] = useState<number | null>(null);

  const [revealing, setRevealing] = useState(false);

  const [bounceRow, setBounceRow] = useState<number | null>(null);

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetRoundRef = useRef(resetRound);
  resetRoundRef.current = resetRound;

  const switchTurnRef = useRef(switchTurn);
  switchTurnRef.current = switchTurn;

  useEffect(() => {
    setLoaded(true);
    resetRoundRef.current();
  }, [roundKey, currentRound, timerSeconds]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timerEnabled || status !== "playing" || revealing) {
      return;
    }

    if (timeLeft <= 0) {
      switchTurnRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timerEnabled, timeLeft, status, activeSide, revealing]);

  function resetRound() {
    const startingSide: TeamSide = currentRound % 2 === 1 ? "side1" : "side2";

    const saved = readRoundState<WordRoundState>("word", roundKey);

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    setRevealRow(null);
    setRevealing(false);
    setBounceRow(null);

    if (saved && saved.answer) {
      setAnswer(saved.answer);
      setCategory(saved.category);
      setGuesses(saved.guesses);
      setCurrent("");
      setStatus(saved.status);
      setKeyStatus(saved.keyStatus);
      setRemovedLetters(saved.removedLetters);
      setActiveSide(saved.activeSide);
      setTimeLeft(timerSeconds);
      setSide1HintUsed(saved.side1HintUsed);
      setSide2HintUsed(saved.side2HintUsed);
      setRevealedLetters(saved.revealedLetters ?? []);
      setSide1RevealUsed(saved.side1RevealUsed ?? false);
      setSide2RevealUsed(saved.side2RevealUsed ?? false);
      setFeedback(
        saved.status === "lost"
          ? "انتهت المحاولات"
          : `الدور على ${saved.activeSide === "side1" ? side1Name : side2Name}`,
      );
      return;
    }

    const [randomWord] = wordDeck.draw(1);

    if (!randomWord) {
      setAnswer("");
      setCategory("");

      setFeedback("ما فيه كلمات من 5 حروف في ملف الكلمات");

      return;
    }

    setAnswer(randomWord.answer);
    setCategory(randomWord.category);

    setGuesses([]);
    setCurrent("");

    setStatus("playing");

    setKeyStatus({});
    setRemovedLetters([]);

    setActiveSide(startingSide);

    setTimeLeft(timerSeconds);

    setSide1HintUsed(false);
    setSide2HintUsed(false);
    setRevealedLetters([]);
    setSide1RevealUsed(false);
    setSide2RevealUsed(false);

    setFeedback(
      `الدور على ${startingSide === "side1" ? side1Name : side2Name}`,
    );
  }

  function getCurrentTurnName() {
    return activeSide === "side1" ? side1Name : side2Name;
  }

  function switchTurn() {
    const nextSide: TeamSide = activeSide === "side1" ? "side2" : "side1";

    setActiveSide(nextSide);

    setCurrent("");

    setTimeLeft(timerSeconds);

    setFeedback(
      `انتهى الوقت — الدور على ${nextSide === "side1" ? side1Name : side2Name}`,
    );
  }

  function submitGuess() {
    if (status !== "playing" || !answer || revealing) {
      return;
    }

    const rawGuess = current.trim().replace(/\s+/g, "");

    const guess = normalizeArabic(rawGuess);

    const normalizedAnswer = normalizeArabic(answer);

    if (guess.length !== WORD_LENGTH) {
      setFeedback(`لازم تدخل ${WORD_LENGTH} حروف`);

      return;
    }

    const evaluation = evaluateGuess(rawGuess, answer);

    const nextGuesses = [...guesses, rawGuess];

    const nextKeyStatus = {
      ...keyStatus,
    };

    Array.from(rawGuess).forEach((letter, index) => {
      const normalizedLetter = normalizeArabic(letter);

      const newState = evaluation[index];

      const previousState = nextKeyStatus[normalizedLetter];

      if (previousState === "correct") {
        return;
      }

      if (newState === "correct") {
        nextKeyStatus[normalizedLetter] = "correct";

        return;
      }

      if (previousState === "present") {
        return;
      }

      if (newState === "present") {
        nextKeyStatus[normalizedLetter] = "present";

        return;
      }

      if (!previousState) {
        nextKeyStatus[normalizedLetter] = "absent";
      }
    });

    const rowIndex = nextGuesses.length - 1;

    const guessingSide = activeSide;

    const guessingName = getCurrentTurnName();

    setGuesses(nextGuesses);

    setCurrent("");

    setRevealRow(rowIndex);

    setRevealing(true);

    revealTimerRef.current = setTimeout(() => {
      revealTimerRef.current = null;

      setKeyStatus(nextKeyStatus);

      setRevealing(false);

      if (guess === normalizedAnswer) {
        setStatus("won");

        setFeedback(`${guessingName} عرف الكلمة`);

        setBounceRow(rowIndex);

        revealTimerRef.current = setTimeout(
          () => {
            onRoundEnd(guessingSide);
          },
          BOUNCE_STEP * (WORD_LENGTH - 1) + 900,
        );

        return;
      }

      if (nextGuesses.length >= MAX_TRIES) {
        setStatus("lost");

        setFeedback("انتهت المحاولات");

        return;
      }

      const nextSide: TeamSide = guessingSide === "side1" ? "side2" : "side1";

      setActiveSide(nextSide);

      setTimeLeft(timerSeconds);

      setFeedback(`الدور على ${nextSide === "side1" ? side1Name : side2Name}`);
    }, REVEAL_MS);
  }

  function useHint() {
    if (status !== "playing" || !answer || revealing) {
      return;
    }

    const hintAlreadyUsed =
      activeSide === "side1" ? side1HintUsed : side2HintUsed;

    if (hintAlreadyUsed) {
      setFeedback(`${getCurrentTurnName()} استخدم المساعدة من قبل`);

      return;
    }

    const normalizedAnswer = normalizeArabic(answer);

    const allKeyboardLetters = keyboardRows
      .join("")
      .split("")
      .map((letter) => normalizeArabic(letter));

    const availableWrongLetters = allKeyboardLetters.filter((letter) => {
      const isInAnswer = normalizedAnswer.includes(letter);

      const isAlreadyRemoved = removedLetters.includes(letter);

      const isAlreadyUsed = Boolean(keyStatus[letter]);

      const isInCurrentGuess = current
        .split("")
        .map((item) => normalizeArabic(item))
        .includes(letter);

      return (
        !isInAnswer && !isAlreadyRemoved && !isAlreadyUsed && !isInCurrentGuess
      );
    });

    if (availableWrongLetters.length === 0) {
      setFeedback("ما فيه حرف متاح للحذف");

      return;
    }

    const removedLetter =
      availableWrongLetters[
        Math.floor(Math.random() * availableWrongLetters.length)
      ];

    setRemovedLetters((previous) => [...previous, removedLetter]);

    if (activeSide === "side1") {
      setSide1HintUsed(true);
    } else {
      setSide2HintUsed(true);
    }

    setFeedback(`تم حذف حرف غلط لـ ${getCurrentTurnName()}`);
  }

  function revealLetter() {
    if (status !== "playing" || !answer || revealing) {
      return;
    }

    const revealAlreadyUsed =
      activeSide === "side1" ? side1RevealUsed : side2RevealUsed;

    if (revealAlreadyUsed) {
      setFeedback(`${getCurrentTurnName()} كشف حرف من قبل`);

      return;
    }

    const answerLetters = Array.from(
      new Set(Array.from(answer).map((letter) => normalizeArabic(letter))),
    );

    const hiddenLetters = answerLetters.filter(
      (letter) => !keyStatus[letter] && !revealedLetters.includes(letter),
    );

    if (hiddenLetters.length === 0) {
      setFeedback("كل حروف الكلمة ظاهرة عندكم");

      return;
    }

    const letter =
      hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];

    setRevealedLetters((previous) => [...previous, letter]);

    setKeyStatus((previous) =>
      previous[letter] ? previous : { ...previous, [letter]: "present" },
    );

    if (activeSide === "side1") {
      setSide1RevealUsed(true);
    } else {
      setSide2RevealUsed(true);
    }

    setFeedback(`الدور على ${getCurrentTurnName()}`);
  }

  function handleKeyboardClick(key: string) {
    if (status !== "playing" || revealing) {
      return;
    }

    const normalizedKey = normalizeArabic(key);

    const state = keyStatus[normalizedKey];

    const wasRemoved = removedLetters.includes(normalizedKey);

    if (state === "absent" || wasRemoved) {
      return;
    }

    if (current.length >= WORD_LENGTH) {
      return;
    }

    setCurrent((previous) => previous + key);
  }

  useEffect(() => {
    if (!loaded || !answer || status === "won") {
      return;
    }

    writeRoundState<WordRoundState>("word", roundKey, {
      answer,
      category,
      guesses,
      status,
      keyStatus,
      removedLetters,
      activeSide,
      side1HintUsed,
      side2HintUsed,
      revealedLetters,
      side1RevealUsed,
      side2RevealUsed,
    });
  }, [
    loaded,
    roundKey,
    answer,
    category,
    guesses,
    status,
    keyStatus,
    removedLetters,
    activeSide,
    side1HintUsed,
    side2HintUsed,
    revealedLetters,
    side1RevealUsed,
    side2RevealUsed,
  ]);

  const physicalKeyRef = useRef<(event: KeyboardEvent) => void>(() => {});

  physicalKeyRef.current = (event) => {
    if (
      document.querySelector('[role="dialog"]') ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest("input, textarea")) {
      return;
    }

    if (event.key === "Enter") {
      if (current.length === WORD_LENGTH && !target?.closest("button, a")) {
        event.preventDefault();
        submitGuess();
      }

      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();

      if (revealing) {
        return;
      }

      setCurrent((previous) => previous.slice(0, -1));
      return;
    }

    if (event.key.length !== 1) {
      return;
    }

    const letter = normalizeArabic(event.key);

    if (keyboardLetters.includes(letter)) {
      event.preventDefault();
      handleKeyboardClick(letter);
    }
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => physicalKeyRef.current(event);

    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, []);

  function getTileStyle(
    guess: string,
    rowIndex: number,
    colIndex: number,
  ): { className: string; style: CSSProperties } {
    const state = evaluateGuess(guess, answer)[colIndex];

    const colors = TILE_COLORS[state];

    const style = {
      "--tile-bg": colors.bg,
      "--tile-border": colors.border,
      "--tile-text": colors.text,
      background: colors.bg,
      borderColor: colors.border,
      color: colors.text,
    } as CSSProperties;

    if (rowIndex === revealRow && revealing) {
      return {
        className: "tile-flip",
        style: { ...style, animationDelay: `${colIndex * FLIP_STEP}ms` },
      };
    }

    if (rowIndex === bounceRow) {
      return {
        className: "tile-bounce",
        style: { ...style, animationDelay: `${colIndex * BOUNCE_STEP}ms` },
      };
    }

    return { className: "", style };
  }

  function getKeyColor(key: string) {
    const normalizedKey = normalizeArabic(key);

    const state = keyStatus[normalizedKey];

    const wasRemoved = removedLetters.includes(normalizedKey);

    if (wasRemoved) {
      return "border-red-500/20 bg-red-950/40 text-white/20 line-through";
    }

    if (state === "correct") {
      return "bg-green-500 border-green-400 text-white";
    }

    if (state === "present") {
      return "bg-yellow-400 border-yellow-300 text-black";
    }

    if (state === "absent") {
      return "bg-[#2f3750] border-[#4b5676] text-white/25";
    }

    return "bg-[#2a2150] border-transparent text-white hover:bg-[#342a60]";
  }

  function isKeyDisabled(key: string) {
    const normalizedKey = normalizeArabic(key);

    return (
      status !== "playing" ||
      keyStatus[normalizedKey] === "absent" ||
      removedLetters.includes(normalizedKey)
    );
  }

  const activeTeamHintUsed =
    activeSide === "side1" ? side1HintUsed : side2HintUsed;

  const activeTeamRevealUsed =
    activeSide === "side1" ? side1RevealUsed : side2RevealUsed;

  const remainingRows = MAX_TRIES - guesses.length;

  const timerColor =
    timeLeft <= 5
      ? "text-red-300 animate-pulse"
      : timeLeft <= 10
        ? "text-yellow-300"
        : "text-white/70";

  const routineFeedback =
    feedback === "ابدأ التخمين" || feedback.startsWith("الدور على ");

  const showFeedback = !routineFeedback;

  if (!answer) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه كلمات من 5 حروف</p>

        <button
          type="button"
          onClick={() => onRoundEnd("none")}
          className="btn-primary mt-4"
        >
          إنهاء الجولة
        </button>
      </div>
    );
  }

  return (
    <>
      <GameLayout
        title="خمن الكلمة"
        side1={side1Name}
        side2={side2Name}
        side1Score={side1Score}
        side2Score={side2Score}
        turn={getCurrentTurnName()}
        turnSide={activeSide}
        currentRound={currentRound}
        game="word"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {timerEnabled && status === "playing" && (
              <span className={`text-sm font-black ${timerColor}`}>
                {timeLeft} ثانية
              </span>
            )}
          </div>

          <div className="mt-1 flex justify-center">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-sm font-bold text-white/45">التصنيف:</span>

              <span className="text-base font-black text-white sm:text-lg">
                {category}
              </span>
            </div>
          </div>

          {revealedLetters.length > 0 && (
            <div className="flex justify-center">
              <span className="text-sm font-black text-[#ffb21e]">
                فيها حرف: {revealedLetters.join(" ، ")}
              </span>
            </div>
          )}

          {showFeedback && (
            <div className="mt-1 text-center text-sm font-bold text-white/75">
              {feedback}
            </div>
          )}

          <div className="flex justify-center py-2">
            <div className="space-y-1.5">
              {guesses.map((guess, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1.5">
                  {Array.from(guess).map((letter, colIndex) => {
                    const tile = getTileStyle(guess, rowIndex, colIndex);

                    return (
                      <div
                        key={colIndex}
                        style={tile.style}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-black sm:h-11 sm:w-11 sm:text-xl md:h-12 md:w-12 ${tile.className}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              ))}

              {Array.from({
                length: remainingRows,
              }).map((_, rowIndex) => (
                <div
                  key={`empty-${rowIndex}`}
                  className="flex justify-center gap-1.5"
                >
                  {Array.from({
                    length: WORD_LENGTH,
                  }).map((__, colIndex) => {
                    const previewLetter =
                      rowIndex === 0 ? (current[colIndex] ?? "") : "";

                    return (
                      <div
                        key={previewLetter ? `${colIndex}-filled` : colIndex}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-black text-white sm:h-11 sm:w-11 sm:text-xl md:h-12 md:w-12 ${
                          previewLetter
                            ? "tile-pop border-white/55 bg-[#221a3f]"
                            : rowIndex === 0
                              ? "border-white/20 bg-[#221a3f]"
                              : "border-transparent bg-[#1d1738]"
                        }`}
                      >
                        {previewLetter}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {status === "lost" && (
            <div className="mx-auto mt-3 w-full max-w-md rounded-2xl bg-[#ffb21e] p-5 text-center text-[#241339] shadow-[0_5px_0_#c27700]">
              <p className="text-sm font-bold opacity-70">الكلمة الصحيحة</p>

              <p className="mt-2 text-3xl font-black">{answer}</p>
            </div>
          )}

          <div
            className="mx-auto mt-2 w-full max-w-[560px] space-y-1.5"
            dir="rtl"
          >
            {keyboardRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-center gap-1 sm:gap-1.5"
              >
                {row.split("").map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardClick(key)}
                    disabled={isKeyDisabled(key)}
                    className={`h-11 min-w-0 max-w-[44px] flex-1 rounded-lg border px-0 text-base font-bold transition active:scale-95 disabled:cursor-not-allowed sm:h-11 ${getKeyColor(
                      key,
                    )}`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
            {status === "playing" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrent((previous) => previous.slice(0, -1))
                  }
                  disabled={current.length === 0}
                  className="btn-secondary min-w-[100px] px-4 py-2 text-sm"
                >
                  ⌫ مسح
                </button>

                <button
                  type="button"
                  onClick={submitGuess}
                  disabled={current.length !== WORD_LENGTH}
                  className="btn-primary min-w-[100px] px-4 py-2 text-sm"
                >
                  إدخال
                </button>

                <button
                  type="button"
                  onClick={useHint}
                  disabled={activeTeamHintUsed}
                  className="btn-secondary min-w-[125px] px-4 py-2 text-sm"
                >
                  {activeTeamHintUsed ? "استخدمتوا المساعدة" : "احذف حرف غلط"}
                </button>

                <button
                  type="button"
                  onClick={revealLetter}
                  disabled={activeTeamRevealUsed}
                  className="btn-secondary min-w-[125px] px-4 py-2 text-sm"
                >
                  {activeTeamRevealUsed ? "كشفتوا حرف" : "اكشف حرف"}
                </button>

                <button
                  type="button"
                  onClick={() => onRoundEnd()}
                  className="btn-secondary min-w-[105px] px-4 py-2 text-sm"
                >
                  إنهاء الجولة
                </button>
              </>
            )}

            {status === "lost" && (
              <button
                type="button"
                onClick={() => onRoundEnd("none")}
                className="btn-primary min-w-[150px]"
              >
                إنهاء الجولة
              </button>
            )}
          </div>
        </div>
      </GameLayout>
    </>
  );
}

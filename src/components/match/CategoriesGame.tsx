"use client";

import { useEffect, useState } from "react";
import { GameTitle, TeamPanel } from "@/components/match/GameLayout";
import HowToPlayButton from "@/components/match/HowToPlayButton";
import { CATEGORY_LETTERS as letters } from "@/data/categories";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { WinnerType } from "@/types/game";

const letterDeck = createDeck(letters);

type CategoriesRoundState = {
  letter: string;
  revealed: boolean;
  side1Ready: boolean;
  side2Ready: boolean;
  side1Time: number | null;
  side2Time: number | null;
  roundStartedAt: number;
};

export default function CategoriesGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 40,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
}) {
  const [letter, setLetter] = useState("");

  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [revealed, setRevealed] = useState(false);

  const [side1Ready, setSide1Ready] = useState(false);
  const [side2Ready, setSide2Ready] = useState(false);

  const [side1Time, setSide1Time] = useState<number | null>(null);
  const [side2Time, setSide2Time] = useState<number | null>(null);

  const [roundStartedAt, setRoundStartedAt] = useState(() => Date.now());

  useEffect(() => {
    setTimeLeft(timerSeconds);

    const saved = readRoundState<CategoriesRoundState>("categories", roundKey);

    if (saved && saved.letter) {
      setLetter(saved.letter);
      setRevealed(saved.revealed);
      setSide1Ready(saved.side1Ready);
      setSide2Ready(saved.side2Ready);
      setSide1Time(saved.side1Time);
      setSide2Time(saved.side2Time);
      setRoundStartedAt(saved.roundStartedAt);
      return;
    }

    const [next] = letterDeck.draw(1);

    setLetter(next ?? "");
    setRevealed(false);

    setSide1Ready(false);
    setSide2Ready(false);

    setSide1Time(null);
    setSide2Time(null);

    setRoundStartedAt(Date.now());
  }, [roundKey, timerSeconds]);

  useEffect(() => {
    if (!letter) {
      return;
    }

    writeRoundState<CategoriesRoundState>("categories", roundKey, {
      letter,
      revealed,
      side1Ready,
      side2Ready,
      side1Time,
      side2Time,
      roundStartedAt,
    });
  }, [
    roundKey,
    letter,
    revealed,
    side1Ready,
    side2Ready,
    side1Time,
    side2Time,
    roundStartedAt,
  ]);

  useEffect(() => {
    if (revealed) return;

    if (side1Ready && side2Ready) {
      setRevealed(true);
      return;
    }

    if (timerEnabled && timeLeft <= 0) {
      setRevealed(true);
      return;
    }

    if (!timerEnabled) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, revealed, side1Ready, side2Ready, timerEnabled]);

  function markReady(side: "side1" | "side2") {
    if (revealed) return;

    const elapsedTime = Math.max(
      1,
      Math.floor((Date.now() - roundStartedAt) / 1000),
    );

    if (side === "side1") {
      if (side1Ready) return;

      setSide1Ready(true);
      setSide1Time(elapsedTime);
    } else {
      if (side2Ready) return;

      setSide2Ready(true);
      setSide2Time(elapsedTime);
    }
  }

  const timerTextClass =
    timeLeft <= 5
      ? "animate-pulse text-red-300"
      : timeLeft <= 10
        ? "text-yellow-200"
        : "text-white/70";

  const progressScale =
    timerEnabled && timerSeconds > 0
      ? Math.max(0, Math.min(1, timeLeft / timerSeconds))
      : 1;

  const side1Label = side1Name || "فريق 1";
  const side2Label = side2Name || "فريق 2";

  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <div className="flex items-center justify-between gap-3">
        <p className="w-16 shrink-0 text-right text-sm font-bold text-white/45">
          الجولة {currentRound}
        </p>

        <div className="min-w-0 flex-1 text-center">
          <GameTitle title="إنسان حيوان نبات جماد بلاد" />
        </div>

        <div className="flex w-16 shrink-0 justify-end">
          <HowToPlayButton game="categories" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <TeamPanel
          name={side1Label}
          value={side1Ready ? `خلصوا ${side1Time ?? ""}ث` : "يكتبون"}
          isStatus
          active={!side1Ready}
          tone="orange"
        />

        <TeamPanel
          name={side2Label}
          value={side2Ready ? `خلصوا ${side2Time ?? ""}ث` : "يكتبون"}
          isStatus
          active={!side2Ready}
          tone="blue"
        />
      </div>

      <div className="mt-4">
        {timerEnabled && !revealed && (
          <div className="mx-auto mb-4 max-w-md">
            <p className={`mb-2 text-lg font-black ${timerTextClass}`}>
              {timeLeft} ثانية
            </p>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-right bg-[#ffb21e] transition-transform duration-1000 ease-linear"
                style={{ transform: `scaleX(${progressScale})` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#221a3f] text-6xl shadow-[0_6px_0_#140f29] font-black text-white sm:h-32 sm:w-32 sm:text-7xl">
            {letter}
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-2xl">
          <p className="font-black text-white">
            إنسان • حيوان • نبات • جماد • بلاد
          </p>

          <p className="mt-1.5 text-sm leading-6 text-white/60">
            كلها تبدأ بنفس الحرف. اللي يخلص يضغط زره، وإذا الإجابات صح ياخذها
            الأسرع.
          </p>
        </div>

        {!revealed && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => markReady("side1")}
              disabled={side1Ready}
              className="btn-team-1"
            >
              {side1Ready ? (
                "خلصوا"
              ) : (
                <span className="flex min-w-0 max-w-full flex-col items-center leading-tight">
                  <span dir="auto" className="max-w-full truncate">
                    {side1Label}
                  </span>
                  <span className="text-sm opacity-80">خلصوا</span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => markReady("side2")}
              disabled={side2Ready}
              className="btn-team-2"
            >
              {side2Ready ? (
                "خلصوا"
              ) : (
                <span className="flex min-w-0 max-w-full flex-col items-center leading-tight">
                  <span dir="auto" className="max-w-full truncate">
                    {side2Label}
                  </span>
                  <span className="text-sm opacity-80">خلصوا</span>
                </span>
              )}
            </button>
          </div>
        )}

        {revealed && (
          <p className="mt-4 text-sm font-bold text-white/60">
            راجعوا الإجابات وبعدها أنهوا الجولة
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => onRoundEnd()}
            disabled={!revealed}
            className="btn-primary min-w-[170px]"
          >
            إنهاء الجولة
          </button>
        </div>
      </div>
    </div>
  );
}

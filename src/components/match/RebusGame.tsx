"use client";

import { useEffect, useMemo, useState } from "react";
import GameLayout from "@/components/match/GameLayout";
import { InlineTeamPick } from "@/components/match/Overlays";
import { REBUS_PUZZLES as puzzles } from "@/data/rebus";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { RoundPoints, WinnerType } from "@/types/game";

const TOTAL_ROUNDS = 4;
const SECOND_TIME = 10;

type TeamSide = "side1" | "side2";

const rebusDeck = createDeck(puzzles, "rebus");

type RebusRoundState = {
  rounds: typeof puzzles;
  index: number;
  revealed: boolean;
  secondTurn: boolean;
  side1Score: number;
  side2Score: number;
};

export default function RebusGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 30,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType, points?: RoundPoints) => void;
  roundKey: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
}) {
  const [rounds, setRounds] = useState<typeof puzzles>([]);

  const [index, setIndex] = useState(0);

  const [loaded, setLoaded] = useState(false);

  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const [revealed, setRevealed] = useState(false);

  const [secondTurn, setSecondTurn] = useState(false);

  const [side1Score, setSide1Score] = useState(0);

  const [side2Score, setSide2Score] = useState(0);

  useEffect(() => {
    setLoaded(true);

    setTimeLeft(timerSeconds);

    const saved = readRoundState<RebusRoundState>("rebus", roundKey);

    if (saved && saved.rounds.length > 0) {
      setRounds(saved.rounds);
      setIndex(saved.index);
      setRevealed(saved.revealed);
      setSecondTurn(saved.secondTurn);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      return;
    }

    setRounds(rebusDeck.draw(TOTAL_ROUNDS));

    setIndex(0);

    setRevealed(false);
    setSecondTurn(false);

    setSide1Score(0);
    setSide2Score(0);
  }, [roundKey, timerSeconds]);

  useEffect(() => {
    if (!loaded || rounds.length === 0) {
      return;
    }

    writeRoundState<RebusRoundState>("rebus", roundKey, {
      rounds,
      index,
      revealed,
      secondTurn,
      side1Score,
      side2Score,
    });
  }, [
    loaded,
    roundKey,
    rounds,
    index,
    revealed,
    secondTurn,
    side1Score,
    side2Score,
  ]);

  const current = rounds[index];

  const mainTurn: TeamSide = useMemo(
    () => (index % 2 === 0 ? "side1" : "side2"),
    [index],
  );

  const activeTurn: TeamSide = secondTurn
    ? mainTurn === "side1"
      ? "side2"
      : "side1"
    : mainTurn;

  const activeTeamName =
    activeTurn === "side1" ? side1Name || "فريق 1" : side2Name || "فريق 2";

  useEffect(() => {
    if (!timerEnabled || revealed || !current) {
      return;
    }

    if (timeLeft <= 0) {
      if (!secondTurn) {
        setSecondTurn(true);
        setTimeLeft(SECOND_TIME);
      } else {
        setRevealed(true);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, revealed, secondTurn, current, timerEnabled]);

  function finishGame(final1: number, final2: number) {
    onRoundEnd(final1 > final2 ? "side1" : final2 > final1 ? "side2" : "none", {
      side1: final1,
      side2: final2,
    });
  }

  function goNext(next1: number, next2: number) {
    if (index + 1 >= rounds.length) {
      finishGame(next1, next2);

      return;
    }

    setIndex((currentIndex) => currentIndex + 1);

    setTimeLeft(timerSeconds);

    setRevealed(false);
    setSecondTurn(false);
  }

  function givePoint(winner: "side1" | "side2" | "none") {
    const next1 = side1Score + (winner === "side1" ? 1 : 0);

    const next2 = side2Score + (winner === "side2" ? 1 : 0);

    setSide1Score(next1);
    setSide2Score(next2);

    goNext(next1, next2);
  }

  if (!current) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه ألغاز كافية</p>

        <button
          type="button"
          onClick={() => onRoundEnd("none")}
          className="btn-primary mt-4"
        >
          إنهاء اللعبة
        </button>
      </div>
    );
  }

  const timerTextClass =
    timeLeft <= 5
      ? "animate-pulse text-red-300"
      : timeLeft <= 10
        ? "text-yellow-200"
        : "text-white/70";

  const isLastPuzzle = index + 1 >= rounds.length;

  return (
    <>
      <GameLayout
        reportItem={current?.answer}
        title="ركّبها"
        side1={side1Name || "فريق 1"}
        side2={side2Name || "فريق 2"}
        side1Score={side1Score}
        side2Score={side2Score}
        turn={activeTeamName}
        turnSide={activeTurn}
        currentRound={currentRound}
        game="rebus"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <div className="text-sm font-bold text-white/50">
              اللغز <span className="text-white">{index + 1}</span>
              {" / "}
              {rounds.length}
            </div>

            {secondTurn && !revealed && (
              <div className="text-sm font-black text-[#ffb21e]">
                فرصة ثانية
              </div>
            )}

            {timerEnabled && !revealed && (
              <div className={`text-sm font-black ${timerTextClass}`}>
                {timeLeft} ثانية
              </div>
            )}
          </div>

          <div className="mx-auto flex w-full max-w-[640px] flex-wrap items-center justify-center gap-3 rounded-3xl bg-white p-5 sm:gap-5 sm:p-8">
            {current.parts.map((part, partIndex) => (
              <div
                key={`${current.answer}-${partIndex}`}
                className="flex items-center gap-3 sm:gap-5"
              >
                {partIndex > 0 && (
                  <span
                    aria-hidden="true"
                    className="text-4xl font-black text-[#ffb21e] sm:text-5xl"
                  >
                    +
                  </span>
                )}
                {"image" in part ? (
                  <img
                    src={part.image}
                    alt="صورة من اللغز"
                    className="h-28 w-28 object-contain sm:h-44 sm:w-44"
                  />
                ) : (
                  <span className="text-5xl font-black text-[#241339] sm:text-7xl">
                    {part.text}
                  </span>
                )}
              </div>
            ))}
          </div>

          {revealed && (
            <div className="rounded-2xl bg-[#ffb21e] p-5 text-[#241339] shadow-[0_5px_0_#c27700]">
              <p className="text-sm font-bold opacity-70">الإجابة</p>

              <p className="mt-2 text-2xl font-black">{current.answer}</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="btn-primary"
              >
                إظهار الإجابة
              </button>
            ) : (
              <InlineTeamPick
                resetKey={index}
                title={
                  isLastPuzzle
                    ? "مين جاوب صح؟ وبعدها تخلص اللعبة"
                    : "مين جاوب صح؟"
                }
                side1Name={side1Name}
                side2Name={side2Name}
                onPick={givePoint}
              />
            )}
          </div>
        </div>
      </GameLayout>
    </>
  );
}

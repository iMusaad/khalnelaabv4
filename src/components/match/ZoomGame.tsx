"use client";

import ElapsedTimer from "@/components/match/ElapsedTimer";
import { useEffect, useMemo, useState } from "react";

import GameLayout from "@/components/match/GameLayout";
import { InlineJudge } from "@/components/match/Overlays";
import { ZOOM_ITEMS, type ZoomItem } from "@/data/zoom";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { RoundPoints, WinnerType } from "@/types/game";

const ITEMS_PER_ROUND = 2;

const ZOOM_LEVELS = [3.4, 1.9, 1];

const STAGE_POINTS = [3, 2, 1];

type TeamSide = "side1" | "side2";

const zoomDeck = createDeck(ZOOM_ITEMS, "zoom");

type ZoomRoundState = {
  rounds: ZoomItem[];
  index: number;
  stage: number;
  revealed: boolean;
  side1Score: number;
  side2Score: number;
};

function pointsLabel(points: number) {
  if (points === 1) return "نقطة";
  if (points === 2) return "نقطتين";

  return `${points} نقاط`;
}

export default function ZoomGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType, points?: RoundPoints) => void;
  roundKey: number;
  currentRound?: number;
}) {
  const [index, setIndex] = useState(0);

  const [rounds, setRounds] = useState<ZoomItem[]>([]);

  const [stage, setStage] = useState(0);

  const [revealed, setRevealed] = useState(false);

  const [side1Score, setSide1Score] = useState(0);

  const [side2Score, setSide2Score] = useState(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const saved = readRoundState<ZoomRoundState>("zoom", roundKey);

    if (saved && saved.rounds.length > 0) {
      setRounds(saved.rounds);
      setIndex(saved.index);
      setStage(saved.stage);
      setRevealed(saved.revealed);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      return;
    }

    setRounds(zoomDeck.draw(ITEMS_PER_ROUND));
    setIndex(0);
    setStage(0);
    setRevealed(false);
    setSide1Score(0);
    setSide2Score(0);
  }, [roundKey]);

  useEffect(() => {
    if (!loaded || rounds.length === 0) {
      return;
    }

    writeRoundState<ZoomRoundState>("zoom", roundKey, {
      rounds,
      index,
      stage,
      revealed,
      side1Score,
      side2Score,
    });
  }, [
    loaded,
    roundKey,
    rounds,
    index,
    stage,
    revealed,
    side1Score,
    side2Score,
  ]);

  const current = rounds[index];

  const activeSide: TeamSide = useMemo(
    () => (index % 2 === 0 ? "side1" : "side2"),
    [index],
  );

  const activeTeamName =
    activeSide === "side1" ? side1Name || "فريق 1" : side2Name || "فريق 2";

  useEffect(() => {
    if (current) {
      const preload = new window.Image();
      preload.src = current.full;
    }
  }, [current]);

  const isLastStage = stage >= ZOOM_LEVELS.length - 1;

  const stagePoints = STAGE_POINTS[stage];

  function zoomOut() {
    if (isLastStage) {
      return;
    }

    setStage((previous) => previous + 1);
  }

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
    setStage(0);
    setRevealed(false);
  }

  function award(points: number) {
    const next1 = side1Score + (activeSide === "side1" ? points : 0);

    const next2 = side2Score + (activeSide === "side2" ? points : 0);

    setSide1Score(next1);
    setSide2Score(next2);

    goNext(next1, next2);
  }

  if (!current) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه صور كافية</p>

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

  const zoom = revealed ? 1 : ZOOM_LEVELS[stage];

  return (
    <GameLayout
      reportItem={current?.answer}
      title="عينك عالبوستر"
      side1={side1Name || "فريق 1"}
      side2={side2Name || "فريق 2"}
      side1Score={side1Score}
      side2Score={side2Score}
      turn={activeTeamName}
      turnSide={activeSide}
      currentRound={currentRound}
      game="zoom"
    >
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm font-bold text-white/50">
          الصورة {index + 1} من {rounds.length}
          {!revealed && (
            <>
              {" · "}
              <span className="font-black text-[#ffb21e]">
                لو عرفتوه الحين: {pointsLabel(stagePoints)}
              </span>
            </>
          )}
          {!revealed && (
            <ElapsedTimer key={`${index}-${stage}`} className="ms-3" />
          )}
        </p>

        <div className="text-center">
          {revealed ? (
            <div className="relative mx-auto aspect-[700/998] w-full max-w-[280px] animate-fade-in-up overflow-hidden rounded-3xl bg-black shadow-[0_6px_0_#0b0818] [@media(max-height:900px)]:max-w-[210px] [@media(max-height:760px)]:max-w-[170px]">
              <img
                src={current.full}
                alt={current.answer}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              />
            </div>
          ) : (
            <div className="relative mx-auto aspect-[15/16] w-full max-w-[380px] overflow-hidden rounded-3xl bg-black shadow-[0_6px_0_#0b0818] [@media(max-height:760px)]:max-w-[300px]">
              <img
                src={current.image}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-500 ease-[var(--ease-out)]"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: `${current.focusX}% ${current.focusY}%`,
                }}
              />
            </div>
          )}

          {!revealed && (
            <div
              className="mt-3 flex justify-center gap-1.5"
              aria-hidden="true"
            >
              {ZOOM_LEVELS.map((_, level) => (
                <span
                  key={level}
                  className={`h-1.5 w-8 rounded-full ${
                    level <= stage ? "bg-[#ffb21e]" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          )}

          {revealed && (
            <div className="mt-4 animate-fade-in-up">
              <p className="text-2xl font-black text-white sm:text-3xl">
                {current.answer}
              </p>

              <p className="mt-1 text-sm font-bold text-white/55">
                لو كان جوابهم صح ياخذون {pointsLabel(stagePoints)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!revealed && !isLastStage && (
            <button type="button" onClick={zoomOut} className="btn-secondary">
              بعّد الصورة
            </button>
          )}

          {!revealed && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="btn-primary min-w-[160px]"
            >
              شوفوا الجواب
            </button>
          )}

          {revealed && (
            <InlineJudge
              resetKey={index}
              teamName={activeTeamName}
              onCorrect={() => award(stagePoints)}
              onWrong={() => award(0)}
            />
          )}
        </div>
      </div>
    </GameLayout>
  );
}

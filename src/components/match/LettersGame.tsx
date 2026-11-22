"use client";

import { useEffect, useState } from "react";
import GameLayout from "@/components/match/GameLayout";
import { InlineTeamPick } from "@/components/match/Overlays";
import { LETTERS, LETTER_QUESTIONS, type LetterQuestion } from "@/data/letters";
import { createDeck, shuffle } from "@/lib/deck";
import { HEX_SIZE, hasWinningPath, type HexOwner } from "@/lib/hexBoard";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { RoundPoints, WinnerType } from "@/types/game";

type TeamSide = "side1" | "side2";

const CELL_COUNT = HEX_SIZE * HEX_SIZE;
const RADIUS = 40;
const HEX_W = Math.sqrt(3) * RADIUS;
const PAD = 26;
const VIEW_W = HEX_W * HEX_SIZE + HEX_W / 2 + PAD * 2;
const VIEW_H = RADIUS * 1.5 * (HEX_SIZE - 1) + RADIUS * 2 + PAD * 2;

const TEAM_FILL: Record<TeamSide, string> = {
  side1: "#ff5a5f",
  side2: "#2f9bff",
};

const letterDecks = Object.fromEntries(
  LETTERS.map((letter) => [
    letter,
    createDeck(LETTER_QUESTIONS[letter], `letters-${letter}`),
  ]),
);

type Active = {
  index: number;
  question: LetterQuestion;
  revealed: boolean;
};

type LettersState = {
  letters: string[];
  owners: HexOwner[];
  turn: TeamSide;
  active: Active | null;
};

function cellCenter(index: number) {
  const row = Math.floor(index / HEX_SIZE);
  const col = index % HEX_SIZE;

  return {
    x: PAD + HEX_W / 2 + col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0),
    y: PAD + RADIUS + row * RADIUS * 1.5,
  };
}

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);

    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function newBoard(): LettersState {
  return {
    letters: shuffle(LETTERS).slice(0, CELL_COUNT),
    owners: Array<HexOwner>(CELL_COUNT).fill(null),
    turn: "side1",
    active: null,
  };
}

export default function LettersGame({
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
  timerEnabled?: boolean;
  timerSeconds?: number;
}) {
  const [state, setState] = useState<LettersState | null>(null);

  useEffect(() => {
    const saved = readRoundState<LettersState>("letters", roundKey);

    setState(saved && saved.letters.length === CELL_COUNT ? saved : newBoard());
  }, [roundKey]);

  useEffect(() => {
    if (state) {
      writeRoundState<LettersState>("letters", roundKey, state);
    }
  }, [state, roundKey]);

  if (!state) {
    return null;
  }

  const { letters, owners, turn, active } = state;
  const side1Label = side1Name || "فريق 1";
  const side2Label = side2Name || "فريق 2";
  const count1 = owners.filter((owner) => owner === "side1").length;
  const count2 = owners.filter((owner) => owner === "side2").length;

  function pickCell(index: number) {
    if (!state || state.active || state.owners[index]) {
      return;
    }

    const [question] = letterDecks[state.letters[index]].draw(1);

    setState({ ...state, active: { index, question, revealed: false } });
  }

  function giveCell(winner: WinnerType) {
    if (!state?.active) {
      return;
    }

    const nextOwners = [...state.owners];

    if (winner === "side1" || winner === "side2") {
      nextOwners[state.active.index] = winner;
    }

    const points = {
      side1: nextOwners.filter((owner) => owner === "side1").length,
      side2: nextOwners.filter((owner) => owner === "side2").length,
    };

    if (winner === "side1" || winner === "side2") {
      if (hasWinningPath(nextOwners, winner)) {
        setState({ ...state, owners: nextOwners, active: null });
        onRoundEnd(winner, points);
        return;
      }
    }

    setState({
      ...state,
      owners: nextOwners,
      active: null,
      turn:
        winner === "side1" || winner === "side2"
          ? winner
          : state.turn === "side1"
            ? "side2"
            : "side1",
    });
  }

  return (
    <GameLayout
      reportItem={
        active
          ? `${letters[active.index]} | ${active.question.question} | الجواب: ${active.question.answer}`
          : undefined
      }
      title="خلية الحروف"
      side1={side1Label}
      side2={side2Label}
      side1Score={count1}
      side2Score={count2}
      turn={turn === "side1" ? side1Label : side2Label}
      turnSide={turn}
      currentRound={currentRound}
      game="letters"
    >
      <div className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="mx-auto w-full max-w-[520px] select-none"
          role="img"
          aria-label="لوحة الحروف"
        >
          <rect
            x={0}
            y={PAD}
            width={8}
            height={VIEW_H - PAD * 2}
            rx={4}
            fill={TEAM_FILL.side1}
          />
          <rect
            x={VIEW_W - 8}
            y={PAD}
            width={8}
            height={VIEW_H - PAD * 2}
            rx={4}
            fill={TEAM_FILL.side1}
          />
          <rect
            x={PAD}
            y={0}
            width={VIEW_W - PAD * 2}
            height={8}
            rx={4}
            fill={TEAM_FILL.side2}
          />
          <rect
            x={PAD}
            y={VIEW_H - 8}
            width={VIEW_W - PAD * 2}
            height={8}
            rx={4}
            fill={TEAM_FILL.side2}
          />

          {letters.map((letter, index) => {
            const { x, y } = cellCenter(index);
            const owner = owners[index];
            const selected = active?.index === index;
            const clickable = !active && !owner;

            return (
              <g
                key={index}
                onClick={() => pickCell(index)}
                className={clickable ? "cursor-pointer" : undefined}
              >
                <polygon
                  points={hexPoints(x, y, RADIUS - 2)}
                  fill={
                    owner ? TEAM_FILL[owner] : selected ? "#ffc23d" : "#221a3f"
                  }
                  stroke={selected ? "#ffe39a" : "#3a2f66"}
                  strokeWidth={3}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={30}
                  fontWeight={900}
                  fill={selected ? "#241339" : "#ffffff"}
                >
                  {letter}
                </text>
              </g>
            );
          })}
        </svg>

        <p className="text-center text-xs font-bold text-white/45">
          <span className="text-[#ff7a7f]">{side1Label}</span> يوصل من اليمين
          لليسار، و<span className="text-[#4aa8ff]">{side2Label}</span> من فوق
          لتحت
        </p>

        {!active && (
          <p className="text-center text-sm font-bold text-white/60">
            {turn === "side1" ? side1Label : side2Label} يختار حرف
          </p>
        )}

        {active && (
          <div className="mx-auto w-full max-w-[560px] space-y-4">
            <div className="rounded-3xl bg-[#221a3f] p-5 text-center shadow-[0_6px_0_#140f29]">
              <p className="text-sm font-bold text-white/50">
                حرف{" "}
                <span className="text-xl font-black text-[#ffc23d]">
                  {letters[active.index]}
                </span>
              </p>
              <p className="mt-2 text-xl font-black leading-snug text-white sm:text-2xl">
                {active.question.question}
              </p>
            </div>

            {active.revealed ? (
              <>
                <div className="rounded-2xl bg-[#ffb21e] p-4 text-center text-[#241339] shadow-[0_5px_0_#c27700]">
                  <p className="text-sm font-bold opacity-70">الإجابة</p>
                  <p className="mt-1 text-2xl font-black">
                    {active.question.answer}
                  </p>
                </div>

                <InlineTeamPick
                  resetKey={`${active.index}-${count1}-${count2}`}
                  title="مين جاوب صح؟"
                  side1Name={side1Name}
                  side2Name={side2Name}
                  onPick={giveCell}
                />
              </>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setState({
                      ...state,
                      active: { ...active, revealed: true },
                    })
                  }
                  className="btn-primary"
                >
                  إظهار الإجابة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  );
}

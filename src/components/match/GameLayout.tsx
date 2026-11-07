"use client";

import type { ReactNode } from "react";
import HowToPlayButton from "@/components/match/HowToPlayButton";
import type { GameType } from "@/lib/matchQueue";

type TeamSide = "side1" | "side2";

type GameLayoutProps = {
  title: string;

  side1: string;
  side2: string;

  side1Score: number;
  side2Score: number;

  sideStatus?: {
    side1: string;
    side2: string;
  };

  turn: string;

  turnSide?: TeamSide;

  currentRound?: number;

  neutralTurnStyle?: "default" | "duo";

  game?: GameType;

  children: ReactNode;
};

function normalizeTeamName(value: string) {
  return value
    .trim()
    .replace(/^الدور\s+الحالي\s*/u, "")
    .replace(/^الدور\s+على\s+/u, "")
    .replace(/^دور\s+/u, "")
    .replace(/\s+/g, " ");
}

export function GameTitle({ title }: { title: string }) {
  const titleWords = title.trim().split(/\s+/);

  return (
    <h2
      className="
        truncate
        py-1
        text-xl
        font-black
        leading-tight
        sm:text-3xl
      "
      dir="rtl"
    >
      {titleWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={index % 2 === 0 ? "text-[#ffb21e]" : "text-[#2f9bff]"}
        >
          {word}
          {index < titleWords.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}

export default function GameLayout({
  title,

  side1,
  side2,

  side1Score,
  side2Score,

  sideStatus,

  turn,
  turnSide,

  currentRound = 1,

  neutralTurnStyle = "default",

  game,

  children,
}: GameLayoutProps) {
  const cleanTurn = normalizeTeamName(turn);

  const cleanSide1 = normalizeTeamName(side1);
  const cleanSide2 = normalizeTeamName(side2);

  const detectedSide: TeamSide | null =
    turnSide ??
    (cleanTurn === cleanSide1 || cleanTurn === "فريق 1"
      ? "side1"
      : cleanTurn === cleanSide2 || cleanTurn === "فريق 2"
        ? "side2"
        : null);

  const isSide1Turn = detectedSide === "side1";

  const isSide2Turn = detectedSide === "side2";

  const isNeutralTurn = !isSide1Turn && !isSide2Turn;

  const useDuoNeutral = isNeutralTurn && neutralTurnStyle === "duo";

  const displayedTurn = isSide1Turn ? side1 : isSide2Turn ? side2 : cleanTurn;

  const turnColor = isSide1Turn
    ? "text-[#ffb21e]"
    : isSide2Turn
      ? "text-[#4aa8ff]"
      : "text-white";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <p className="w-16 shrink-0 text-right text-sm font-bold text-white/45">
          الجولة {currentRound}
        </p>

        <div className="min-w-0 flex-1 text-center">
          <GameTitle title={title} />
        </div>

        <div className="flex w-16 shrink-0 justify-end">
          {game ? <HowToPlayButton game={game} /> : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <TeamPanel
          name={side1}
          value={sideStatus ? sideStatus.side1 : side1Score}
          isStatus={Boolean(sideStatus)}
          active={isSide1Turn || useDuoNeutral}
          tone="orange"
        />

        <TeamPanel
          name={side2}
          value={sideStatus ? sideStatus.side2 : side2Score}
          isStatus={Boolean(sideStatus)}
          active={isSide2Turn || useDuoNeutral}
          tone="blue"
        />
      </div>

      <p className="mt-4 text-center text-base font-bold text-white/55 sm:text-lg">
        {isNeutralTurn ? (
          <span dir="auto" className="font-black text-white">
            {displayedTurn}
          </span>
        ) : (
          <>
            الدور على{" "}
            <span dir="auto" className={`font-black ${turnColor}`}>
              {displayedTurn}
            </span>
          </>
        )}
      </p>

      <div className="mt-4">{children}</div>
    </div>
  );
}

export function TeamPanel({
  name,
  value,
  isStatus,
  active,
  tone,
}: {
  name: string;
  value: ReactNode;
  isStatus: boolean;
  active: boolean;
  tone: "orange" | "blue";
}) {
  const activeClass =
    tone === "orange"
      ? "bg-[#ffb21e] text-[#241339] shadow-[0_5px_0_#c27700]"
      : "bg-[#2f9bff] text-white shadow-[0_5px_0_#1662b8]";

  return (
    <div
      className={`flex min-h-[78px] min-w-0 flex-col items-center justify-center rounded-2xl px-3 py-2 transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out)] sm:min-h-[92px] ${
        active
          ? activeClass
          : "bg-[#221a3f] text-white/70 shadow-[0_5px_0_#140f29]"
      }`}
    >
      <p
        dir="auto"
        className="line-clamp-1 max-w-full text-sm font-black leading-tight [overflow-wrap:anywhere]"
      >
        {name}
      </p>

      <p
        className={`mt-1 font-black leading-none ${
          isStatus ? "text-base sm:text-lg" : "text-4xl sm:text-5xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

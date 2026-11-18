import type { GameType } from "@/lib/matchQueue";
import type { WinnerType } from "@/types/game";

export type ModeType = "session" | "quick";

export type RoundStat = {
  game: GameType;
  round: number;
  winner: WinnerType;
  side1Points?: number;
  side2Points?: number;
};

export type GameStat = {
  game: GameType;
  side1Wins: number;
  side2Wins: number;
  side1Points: number;
  side2Points: number;
  draws: number;
  total: number;
};

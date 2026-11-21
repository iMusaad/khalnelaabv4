import type { GameType } from "@/lib/matchQueue";

export const GAME_NAMES: Record<GameType, string> = {
  word: "خمن الكلمة",
  quiz: "أسئلة وأجوبة",
  scramble: "منهو ذا؟",
  wheel: "لف وخمن",
  categories: "إنسان حيوان نبات جماد بلاد",
  draw: "خمن المثل",
  logo: "عينك عالشعار",
  country: "وش علمك؟",
  club: "وش ناديك؟",
  car: "عينك عالموتر",
  zoom: "عينك عالبوستر",
  geo: "ثبّت الموقع",
  rebus: "ركّبها",
};

export function getGameName(game: GameType) {
  return GAME_NAMES[game];
}

export function getGamesLabel(count: number) {
  if (count === 1) return "لعبة وحدة";
  if (count === 2) return "لعبتين";
  if (count >= 3 && count <= 10) return `${count} ألعاب`;

  return `${count} لعبة`;
}

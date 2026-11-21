import { REBUS_PUZZLES } from "@/data/rebus";
import { ZOOM_CATEGORIES, ZOOM_ITEMS } from "@/data/zoom";

export type UpcomingGame = {
  id: string;
  name: string;
  image: string;
  content: string[];
};

export const UPCOMING_GAMES: UpcomingGame[] = [
  {
    id: "rebus",
    name: "ركّبها",
    image: "/images/posters/Proverbgame-2.png",
    content: [`${REBUS_PUZZLES.length} لغز`, "مخفية حالياً"],
  },
  {
    id: "categories",
    name: "إنسان حيوان نبات جماد بلاد",
    image: "/images/posters/Categoriesgame-2.png",
    content: ["مخفية حالياً"],
  },
  {
    id: "zoom",
    name: "عينك عالبوستر",
    image: "/images/posters/Postergame.png",
    content: Object.entries(ZOOM_CATEGORIES).map(
      ([key, category]) =>
        `${category.title}: ${ZOOM_ITEMS.filter((item) => item.category === key).length} صورة`,
    ),
  },
];

export const UPCOMING_GAME_IDS = UPCOMING_GAMES.map((game) => game.id);

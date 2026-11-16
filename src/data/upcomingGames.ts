import { GEO_PLACES } from "@/data/geoPlaces";
import { ZOOM_CATEGORIES, ZOOM_ITEMS } from "@/data/zoom";

export type UpcomingGame = {
  id: string;
  name: string;
  image: string;
  content: string[];
};

export const UPCOMING_GAMES: UpcomingGame[] = [
  {
    id: "zoom",
    name: "عينك عالبوستر",
    image: "/images/posters/Postergame.png",
    content: Object.entries(ZOOM_CATEGORIES).map(
      ([key, category]) =>
        `${category.title}: ${ZOOM_ITEMS.filter((item) => item.category === key).length} صورة`,
    ),
  },
  {
    id: "geo",
    name: "وين هذا؟",
    image: "/images/posters/Geogame.png",
    content: [`أماكن بالسعودية: ${GEO_PLACES.length} صورة`],
  },
];

export const UPCOMING_GAME_IDS = UPCOMING_GAMES.map((game) => game.id);

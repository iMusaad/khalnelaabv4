import { FOCUS_CLIPS } from "@/data/focus";
import { LETTERS, LETTER_QUESTIONS } from "@/data/letters";
import { ZOOM_CATEGORIES, ZOOM_ITEMS } from "@/data/zoom";

export type UpcomingGame = {
  id: string;
  name: string;
  image?: string;
  content: string[];
  planned?: boolean;
};

export const UPCOMING_GAMES: UpcomingGame[] = [
  {
    id: "letters",
    name: "خلية الحروف",
    image: "/images/posters/Lettersgame.png",
    content: [
      `${LETTERS.reduce((sum, letter) => sum + LETTER_QUESTIONS[letter].length, 0)} سؤال على ${LETTERS.length} حرف`,
      "مخفية حالياً",
    ],
  },
  {
    id: "focus",
    name: "ركز يانايم",
    image: "/images/posters/Focusgame.png",
    content: [`${FOCUS_CLIPS.length} مقطع`, "مخفية حالياً"],
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
  {
    id: "charades",
    name: "ولا كلمة",
    content: [
      "مخططة، ما بديناها",
      "واحد يمسح كود ويشوف كلمة ويمثلها بدون ما يتكلم، وفريقه يخمن",
    ],
    planned: true,
  },
];

export const UPCOMING_GAME_IDS = UPCOMING_GAMES.filter(
  (game) => !game.planned,
).map((game) => game.id);

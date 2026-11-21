import { HOME_GAMES, type HomeGame } from "@/data/homeGames";
import { quizCategoryList, type QuizCategoryKey } from "@/data/quiz/meta";

export const QUIZ_LABELS: Record<QuizCategoryKey, string> = {
  seerah: "سيرة",
  saudi: "السعودية",
  football: "كورة",
  geography: "جغرافيا",
};

export const QUIZ_COLORS: Record<QuizCategoryKey, string> = {
  seerah: "#0b7a3e",
  saudi: "#005430",
  football: "#2f9bff",
  geography: "#c27700",
};

export type PlayableCard = HomeGame & {
  key: string;
  category?: QuizCategoryKey;
};

export function expandQuizCards(games: HomeGame[]): PlayableCard[] {
  return games.flatMap<PlayableCard>((game) =>
    game.id === "quiz"
      ? quizCategoryList.map((category) => ({
          ...game,
          key: `quiz-${category.key}`,
          category: category.key,
          title: `أسئلة ${QUIZ_LABELS[category.key]}`,
          image: `/images/posters/Quiz-${category.key}.png`,
        }))
      : [{ ...game, key: game.id }],
  );
}

export const PLAYABLE_CARDS = expandQuizCards(HOME_GAMES);

export const GAME_COUNT = PLAYABLE_CARDS.length;

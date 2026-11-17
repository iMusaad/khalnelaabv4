export const FREE_GAMES = ["geo", "word", "quiz"];

export const FREE_QUIZ_CATEGORIES = ["geography"];

export const TRIAL_LIMITS = {
  geo: 12,
  word: 15,
  quiz: 12,
};

export function isFreeGame(game: string | null, category?: string | null) {
  if (!game || !FREE_GAMES.includes(game)) {
    return false;
  }

  return (
    game !== "quiz" || !category || FREE_QUIZ_CATEGORIES.includes(category)
  );
}

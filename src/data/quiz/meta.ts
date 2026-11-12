export type QuizCategoryKey = "seerah" | "saudi" | "football" | "geography";

export const quizCategoryMeta: Record<QuizCategoryKey, { title: string }> = {
  seerah: { title: "السيرة" },
  saudi: { title: "السعودية" },
  football: { title: "كرة القدم" },
  geography: { title: "جغرافيا" },
};

export const quizCategoryList = Object.entries(quizCategoryMeta).map(
  ([key, value]) => ({
    key: key as QuizCategoryKey,
    ...value,
  }),
);

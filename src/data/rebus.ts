export type RebusPart = { image: string; label: string } | { text: string };

export type RebusPuzzle = {
  parts: RebusPart[];
  answer: string;
};

export const REBUS_PUZZLES: RebusPuzzle[] = [
  {
    parts: [
      { image: "/images/rebus/mat.png", label: "مت" },
      { image: "/images/rebus/gaed.png", label: "قاعد" },
    ],
    answer: "متقاعد",
  },
];

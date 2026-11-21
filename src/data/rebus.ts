export type RebusPart = { image: string; label: string } | { text: string };

export type RebusPuzzle = {
  parts: RebusPart[];
  answer: string;
};

// Each puzzle is a row of pictures (and the odd letter) joined with "+".
// Picture files live in public/images/rebus/ as square PNGs with a clear background.
export const REBUS_PUZZLES: RebusPuzzle[] = [
  {
    parts: [
      { image: "/images/rebus/mat.png", label: "مت" },
      { image: "/images/rebus/gaed.png", label: "قاعد" },
    ],
    answer: "متقاعد",
  },
];

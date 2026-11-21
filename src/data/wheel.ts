export type WheelValue = number | "bankrupt" | "lose";

export const WHEEL_SEGMENTS: {
  label: string;
  value: WheelValue;
  color: string;
  text: string;
  weight: number;
}[] = [
  { label: "50", value: 50, color: "#22b573", text: "#ffffff", weight: 1 },
  { label: "250", value: 250, color: "#ffc23d", text: "#241339", weight: 1 },
  { label: "100", value: 100, color: "#2f9bff", text: "#ffffff", weight: 1 },
  {
    label: "إفلاس",
    value: "bankrupt",
    color: "#d62839",
    text: "#ffffff",
    weight: 0.35,
  },
  { label: "300", value: 300, color: "#ff8a1e", text: "#241339", weight: 1 },
  { label: "150", value: 150, color: "#8b5cf6", text: "#ffffff", weight: 1 },
  { label: "500", value: 500, color: "#ffe28a", text: "#241339", weight: 1 },
  { label: "200", value: 200, color: "#14b8a6", text: "#ffffff", weight: 1 },
  {
    label: "تخطي",
    value: "lose",
    color: "#5b5675",
    text: "#ffffff",
    weight: 0.35,
  },
];

export const WHEEL_PUZZLES = [
  { answer: "مفتوت", category: "أكل نجدي" },
  { answer: "مراصيع", category: "أكل نجدي" },
  { answer: "هريس", category: "أكل نجدي" },
  { answer: "مرقوق", category: "أكل نجدي" },
  { answer: "أسعد الزهراني", category: "ممثل سعودي" },
  { answer: "عبدالمحسن النمر", category: "ممثل سعودي" },
  { answer: "خالد سامي", category: "ممثل سعودي" },
  { answer: "خالد صقر", category: "ممثل سعودي" },
  { answer: "سويسرا", category: "دولة" },
  { answer: "كولومبيا", category: "دولة" },
];

export const WHEEL_LETTER_ROWS = ["دجحخهعغفقثصض", "طكمنتالبيسش", "ذظزوئر"];

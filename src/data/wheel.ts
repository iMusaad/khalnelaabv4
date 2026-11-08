export type WheelValue = number | "bankrupt" | "lose";

export const WHEEL_SEGMENTS: {
  label: string;
  value: WheelValue;
  color: string;
  text: string;
  weight: number;
}[] = [
  { label: "100", value: 100, color: "#22b573", text: "#ffffff", weight: 1 },
  { label: "500", value: 500, color: "#ffc23d", text: "#241339", weight: 1 },
  { label: "200", value: 200, color: "#2f9bff", text: "#ffffff", weight: 1 },
  {
    label: "إفلاس",
    value: "bankrupt",
    color: "#d62839",
    text: "#ffffff",
    weight: 0.45,
  },
  { label: "600", value: 600, color: "#ff8a1e", text: "#241339", weight: 1 },
  { label: "400", value: 400, color: "#8b5cf6", text: "#ffffff", weight: 1 },
  { label: "1000", value: 1000, color: "#ffe28a", text: "#241339", weight: 1 },
  { label: "700", value: 700, color: "#14b8a6", text: "#ffffff", weight: 1 },
  {
    label: "تخطي",
    value: "lose",
    color: "#5b5675",
    text: "#ffffff",
    weight: 0.45,
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
  { answer: "المكسيك", category: "دولة" },
  { answer: "جمهورية موريشيوس", category: "دولة" },

  { answer: "غوتشي", category: "براند عالمي" },
  { answer: "كارتييه", category: "براند عالمي" },
  { answer: "لويس فيتون", category: "براند عالمي" },
  { answer: "رالف لورين", category: "براند عالمي" },

  { answer: "تاهو", category: "سيارة" },
  { answer: "كورولا", category: "سيارة" },
  { answer: "ازيرا", category: "سيارة" },
  { answer: "اكسنت", category: "سيارة" },

  { answer: "ريد بول", category: "مشروب" },
  { answer: "كينزا", category: "مشروب" },
  { answer: "دكتور بيبر", category: "مشروب" },
  { answer: "سن كويك", category: "مشروب" },

  { answer: "روبرتو كارلوس", category: "لاعب" },
  { answer: "بنزيما", category: "لاعب" },
  { answer: "رونالدينيو", category: "لاعب" },

  { answer: "هنقرستيشن", category: "تطبيق" },
  { answer: "اوتلوك", category: "تطبيق" },
  { answer: "المسافر", category: "تطبيق" },
  { answer: "معروف", category: "تطبيق" },

  { answer: "وينديز", category: "مطعم" },
  { answer: "بوبايز", category: "مطعم" },
  { answer: "بيت الشواية", category: "مطعم" },
  { answer: "بيت الشاورما", category: "مطعم" },
  { answer: "دجاج تكساس", category: "مطعم" },

  { answer: "مكتبة جرير", category: "شركة سعودية" },
  { answer: "أرامكو السعودية", category: "شركة سعودية" },
  { answer: "طيران ناس", category: "شركة سعودية" },
  { answer: "العبيكان للنشر", category: "شركة سعودية" },

  { answer: "الأحوال المدنية", category: "جهة حكومية" },
  { answer: "أمانة الرياض", category: "جهة حكومية" },
  { answer: "وزارة السياحة", category: "جهة حكومية" },
  { answer: "وزارة الرياضة", category: "جهة حكومية" },

  { answer: "الأمن السيبراني", category: "تخصص" },
  { answer: "تكنولوجيا المعلومات", category: "تخصص" },
  { answer: "هندسة الطيران", category: "تخصص" },
  { answer: "موارد بشرية", category: "تخصص" },

  { answer: "أبو العصافير", category: "مسلسل سعودي" },
  { answer: "كلنا عيال قرية", category: "مسلسل سعودي" },
  { answer: "حارة الشيخ", category: "مسلسل سعودي" },
  { answer: "شارع الأعشى", category: "مسلسل سعودي" },

  { answer: "دار الحكمة", category: "جامعة سعودية" },
  { answer: "دار العلوم", category: "جامعة سعودية" },
  { answer: "الأمير سلطان", category: "جامعة سعودية" },
];

export const WHEEL_LETTER_ROWS = ["دجحخهعغفقثصض", "طكمنتالبيسش", "ذظزوئر"];

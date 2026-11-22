type FocusClipBase = {
  id: string;
  question: string;
  answer: string;
  credit: string;
};

export type FocusFileClip = FocusClipBase & {
  kind: "file";
  video: string;
  poster?: string;
};

export type FocusYouTubeClip = FocusClipBase & {
  kind: "youtube";
  youtubeId: string;
  start: number;
  end: number;
};

export type FocusClip = FocusFileClip | FocusYouTubeClip;

export const FOCUS_CLIPS: FocusClip[] = [
  {
    id: "japan-street",
    kind: "file",
    video: "/videos/focus/japan-street.mp4",
    poster: "/videos/focus/japan-street.jpg",
    question: "وش الماركة اللي كانت مكتوبة على الشنطة الزرقاء؟",
    answer: "Adidas",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "shibuya",
    kind: "file",
    video: "/videos/focus/shibuya.mp4",
    poster: "/videos/focus/shibuya.jpg",
    question: "التاكسي اللي مر جنب الباص في النص، وش كان لونه؟",
    answer: "أصفر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "times-square",
    kind: "file",
    video: "/videos/focus/times-square.mp4",
    poster: "/videos/focus/times-square.jpg",
    question: "وش الكلمة المكتوبة على اللوحة الصفراء الطويلة يسار الشاشة؟",
    answer: "Kodak",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fountain",
    kind: "file",
    video: "/videos/focus/fountain.mp4",
    poster: "/videos/focus/fountain.jpg",
    question: "الولد اللي لابس أسود، وش كان معلق على ظهره؟",
    answer: "دمية صفراء (دبدوب)",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "subway",
    kind: "file",
    video: "/videos/focus/subway.mp4",
    poster: "/videos/focus/subway.jpg",
    question: "الشخص اللي واقف ثابت يمين الدرج، وش لون جاكيته؟",
    answer: "أحمر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "las-vegas",
    kind: "file",
    video: "/videos/focus/las-vegas.mp4",
    poster: "/videos/focus/las-vegas.jpg",
    question: "وش لون الباص اللي بطابقين؟",
    answer: "أحمر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "balloons",
    kind: "file",
    video: "/videos/focus/balloons.mp4",
    poster: "/videos/focus/balloons.jpg",
    question: "وش الكلمة المكتوبة على البالون الأحمر والأبيض؟",
    answer: "Puratos",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fish-market",
    kind: "file",
    video: "/videos/focus/fish-market.mp4",
    poster: "/videos/focus/fish-market.jpg",
    question: "العربية اللي يسار الشاشة، وش لون الغطا اللي عليها؟",
    answer: "أزرق",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "grand-central",
    kind: "file",
    video: "/videos/focus/grand-central.mp4",
    poster: "/videos/focus/grand-central.jpg",
    question: "وش لون الساعة اللي فوق الكشك اللي بالنص؟",
    answer: "ذهبي",
    credit: "Mixkit · رخصة مجانية",
  },
];

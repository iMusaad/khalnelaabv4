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
    question: "ما الماركة المكتوبة على الحقيبة الزرقاء؟",
    answer: "Adidas",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "shibuya",
    kind: "file",
    video: "/videos/focus/shibuya.mp4",
    poster: "/videos/focus/shibuya.jpg",
    question: "ما لون التاكسي الذي مر بجانب الباص في الوسط؟",
    answer: "أصفر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "times-square",
    kind: "file",
    video: "/videos/focus/times-square.mp4",
    poster: "/videos/focus/times-square.jpg",
    question: "ما الكلمة المكتوبة على اللوحة الصفراء الطويلة يسار الشاشة؟",
    answer: "Kodak",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fountain",
    kind: "file",
    video: "/videos/focus/fountain.mp4",
    poster: "/videos/focus/fountain.jpg",
    question: "ماذا كان يحمل على ظهره الولد الذي يلبس الأسود؟",
    answer: "دمية صفراء",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "subway",
    kind: "file",
    video: "/videos/focus/subway.mp4",
    poster: "/videos/focus/subway.jpg",
    question: "ما لون جاكيت الشخص الواقف يمين الدرج؟",
    answer: "أحمر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "las-vegas",
    kind: "file",
    video: "/videos/focus/las-vegas.mp4",
    poster: "/videos/focus/las-vegas.jpg",
    question: "ما لون الباص ذي الطابقين؟",
    answer: "أحمر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "balloons",
    kind: "file",
    video: "/videos/focus/balloons.mp4",
    poster: "/videos/focus/balloons.jpg",
    question: "ما الكلمة المكتوبة على البالون الأحمر والأبيض؟",
    answer: "Puratos",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fish-market",
    kind: "file",
    video: "/videos/focus/fish-market.mp4",
    poster: "/videos/focus/fish-market.jpg",
    question: "ما لون الغطاء الذي على العربة يسار الشاشة؟",
    answer: "أزرق",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "grand-central",
    kind: "file",
    video: "/videos/focus/grand-central.mp4",
    poster: "/videos/focus/grand-central.jpg",
    question: "ما لون الساعة التي فوق الكشك في الوسط؟",
    answer: "ذهبي",
    credit: "Mixkit · رخصة مجانية",
  },
];

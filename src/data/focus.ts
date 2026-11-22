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
    id: "cake",
    kind: "file",
    video: "/videos/focus/cake.mp4",
    poster: "/videos/focus/cake.jpg",
    question: "كم شمعة كانت على الكيكة؟",
    answer: "3 شمعات",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "dogs",
    kind: "file",
    video: "/videos/focus/dogs.mp4",
    poster: "/videos/focus/dogs.jpg",
    question: "وش لون الكلب اللي كان على اليمين؟",
    answer: "أسود",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "market-price",
    kind: "file",
    video: "/videos/focus/market-price.mp4",
    poster: "/videos/focus/market-price.jpg",
    question: "كم السعر المكتوب على الورقة؟",
    answer: "4.50",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "crossing-timer",
    kind: "file",
    video: "/videos/focus/crossing-timer.mp4",
    poster: "/videos/focus/crossing-timer.jpg",
    question: "عداد الإشارة بدأ من كم؟",
    answer: "12",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "rubber-duck",
    kind: "file",
    video: "/videos/focus/rubber-duck.mp4",
    poster: "/videos/focus/rubber-duck.jpg",
    question: "وش لون منقار البطة؟",
    answer: "أحمر",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "cats",
    kind: "file",
    video: "/videos/focus/cats.mp4",
    poster: "/videos/focus/cats.jpg",
    question: "وش لون القطوة اللي جات بعدين تاكل؟",
    answer: "أبيض",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fruit-market",
    kind: "file",
    video: "/videos/focus/fruit-market.mp4",
    poster: "/videos/focus/fruit-market.jpg",
    question: "وش لون قميص الشخص اللي مر قدام الكاميرا؟",
    answer: "أزرق",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "camels",
    kind: "file",
    video: "/videos/focus/camels.mp4",
    poster: "/videos/focus/camels.jpg",
    question: "وش لون آخر جمل مر؟",
    answer: "فاتح (أبيض)",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "carousel",
    kind: "file",
    video: "/videos/focus/carousel.mp4",
    poster: "/videos/focus/carousel.jpg",
    question: "وش لون الحصان اللي راكبته البنت؟",
    answer: "أبيض",
    credit: "Mixkit · رخصة مجانية",
  },
];

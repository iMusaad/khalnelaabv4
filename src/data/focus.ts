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
    question: "كم بالون كان في المقطع؟",
    answer: "واحد (أحمر، على اليسار)",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "dogs",
    kind: "file",
    video: "/videos/focus/dogs.mp4",
    poster: "/videos/focus/dogs.jpg",
    question: "كم كلب كان عنده بقعة بيضاء على صدره؟",
    answer: "الاثنين",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "market-price",
    kind: "file",
    video: "/videos/focus/market-price.mp4",
    poster: "/videos/focus/market-price.jpg",
    question: "وش الخضار الطويل الأخضر اللي كان على اليمين؟",
    answer: "فاصوليا خضراء",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "crossing-timer",
    kind: "file",
    video: "/videos/focus/crossing-timer.mp4",
    poster: "/videos/focus/crossing-timer.jpg",
    question: "الرجّال اللي يمشي في الإشارة، كان ثابت ولا يطفي ويشتغل؟",
    answer: "يطفي ويشتغل (يرمش)",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "rubber-duck",
    kind: "file",
    video: "/videos/focus/rubber-duck.mp4",
    poster: "/videos/focus/rubber-duck.jpg",
    question: "في آخر المقطع، البطة كانت معطيتكم وجهها ولا ظهرها؟",
    answer: "ظهرها",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "cats",
    kind: "file",
    video: "/videos/focus/cats.mp4",
    poster: "/videos/focus/cats.jpg",
    question: "وش لون الطوق اللي على رقبة القطوة البيضاء؟",
    answer: "بنفسجي",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "fruit-market",
    kind: "file",
    video: "/videos/focus/fruit-market.mp4",
    poster: "/videos/focus/fruit-market.jpg",
    question: "الشخص اللي مر قدام الكاميرا، كان شايل شنطة؟",
    answer: "إيه، حزامها على كتفه",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "camels",
    kind: "file",
    video: "/videos/focus/camels.mp4",
    poster: "/videos/focus/camels.jpg",
    question: "آخر جمل مر، كان كبير ولا صغير؟",
    answer: "صغير",
    credit: "Mixkit · رخصة مجانية",
  },
  {
    id: "carousel",
    kind: "file",
    video: "/videos/focus/carousel.mp4",
    poster: "/videos/focus/carousel.jpg",
    question:
      "الحصان اللي كان يسار الشاشة في أول المقطع، وش لون اللي على راسه؟",
    answer: "أزرق",
    credit: "Mixkit · رخصة مجانية",
  },
];

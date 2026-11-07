export type HomeGame = {
  id: string;
  title: string;
  text: string;
  phone?: boolean;
};

export const HOME_GAMES: HomeGame[] = [
  { id: "car", title: "عينك عالموتر", text: "تعرفون الموتر من جزء صغير منه؟" },
  {
    id: "club",
    title: "وش ناديك؟",
    text: "نعم أو لا لين تعرفون ناديكم",
    phone: true,
  },
  {
    id: "scramble",
    title: "منهو ذا؟",
    text: "واحد يوصف والباقي يخمنون",
    phone: true,
  },
  { id: "word", title: "خمن الكلمة", text: "خمس حروف وست محاولات" },
  { id: "quiz", title: "أسئلة وأجوبة", text: "من الفئات اللي تختارونها" },
  { id: "logo", title: "خمن الشعار", text: "مبكسل، تعرفونه قبل يتضح؟" },
  {
    id: "country",
    title: "خمن العلم",
    text: "نعم أو لا لين تعرفون علمكم",
    phone: true,
  },
  { id: "wheel", title: "لف وخمن", text: "لفوا العجلة واكشفوا الكلمة" },
  { id: "draw", title: "خمن المثل", text: "إيموجي يوصف مثل، وش هو؟" },
  { id: "categories", title: "إنسان حيوان نبات", text: "حرف واحد وخمس خانات" },
];

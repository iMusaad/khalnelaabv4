export type HomeGame = {
  id: string;
  title: string;
  text: string;
  phone?: boolean;
  image: string;
};

export const HOME_GAMES: HomeGame[] = [
  {
    id: "logo",
    image: "/images/posters/Logogame-2.png",
    title: "خمن الشعار",
    text: "مبكسل، تعرفونه قبل يتضح؟",
  },
  {
    id: "car",
    image: "/images/posters/Cargame-2.png",
    title: "عينك عالموتر",
    text: "تعرفون الموتر من جزء صغير منه؟",
  },
  {
    id: "scramble",
    image: "/images/posters/Whogame-2.png",
    title: "منهو ذا؟",
    text: "واحد يوصف والباقي يخمنون",
    phone: true,
  },
  {
    id: "club",
    image: "/images/posters/Clubgame-2.png",
    title: "وش ناديك؟",
    text: "نعم أو لا لين تعرفون ناديكم",
    phone: true,
  },
  {
    id: "country",
    image: "/images/posters/Countries-2.png",
    title: "وش علمك؟",
    text: "نعم أو لا لين تعرفون علمكم",
    phone: true,
  },
  {
    id: "categories",
    image: "/images/posters/Categoriesgame-2.png",
    title: "إنسان حيوان نبات",
    text: "حرف واحد وخمس خانات",
  },
  {
    id: "word",
    image: "/images/posters/wordgame-2.png",
    title: "خمن الكلمة",
    text: "خمس حروف وست محاولات",
  },
  {
    id: "wheel",
    image: "/images/posters/Wheelgame-2.png",
    title: "لف وخمن",
    text: "لفوا العجلة واكشفوا الكلمة",
  },
  {
    id: "draw",
    image: "/images/posters/Proverbgame-2.png",
    title: "خمن المثل",
    text: "إيموجي يوصف مثل، وش هو؟",
  },
  {
    id: "quiz",
    image: "/images/posters/Quizgame-2.png",
    title: "أسئلة وأجوبة",
    text: "من الفئات اللي تختارونها",
  },
];

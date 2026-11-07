export type HomeGame = {
  id: string;
  title: string;
  text: string;
  phone?: boolean;
  image: string;
};

export const HOME_GAMES: HomeGame[] = [
  {
    id: "car",
    image: "/images/posters/Cargame.png",
    title: "عينك عالموتر",
    text: "تعرفون الموتر من جزء صغير منه؟",
  },
  {
    id: "club",
    image: "/images/posters/Clubgame.png",
    title: "وش ناديك؟",
    text: "نعم أو لا لين تعرفون ناديكم",
    phone: true,
  },
  {
    id: "scramble",
    image: "/images/posters/Whogame.png",
    title: "منهو ذا؟",
    text: "واحد يوصف والباقي يخمنون",
    phone: true,
  },
  {
    id: "word",
    image: "/images/posters/wordgame.png",
    title: "خمن الكلمة",
    text: "خمس حروف وست محاولات",
  },
  {
    id: "quiz",
    image: "/images/posters/Quizgame.png",
    title: "أسئلة وأجوبة",
    text: "من الفئات اللي تختارونها",
  },
  {
    id: "logo",
    image: "/images/posters/Logogame.png",
    title: "خمن الشعار",
    text: "مبكسل، تعرفونه قبل يتضح؟",
  },
  {
    id: "country",
    image: "/images/posters/Countries.png",
    title: "خمن العلم",
    text: "نعم أو لا لين تعرفون علمكم",
    phone: true,
  },
  {
    id: "wheel",
    image: "/images/posters/Wheelgame.png",
    title: "لف وخمن",
    text: "لفوا العجلة واكشفوا الكلمة",
  },
  {
    id: "draw",
    image: "/images/posters/Proverbgame.png",
    title: "خمن المثل",
    text: "إيموجي يوصف مثل، وش هو؟",
  },
  {
    id: "categories",
    image: "/images/posters/Categoriesgame.png",
    title: "إنسان حيوان نبات",
    text: "حرف واحد وخمس خانات",
  },
];

export type GeoPlace = {
  id: string;
  place: string;
  region: string;
  image: string;
  lat: number;
  lon: number;
  author: string;
  license: string;
  source: string;
};

export const GEO_PLACES: GeoPlace[] = [
  {
    id: "al-qarah",
    place: "جبل القارة",
    region: "الأحساء",
    image: "/images/geo/al-qarah.jpg",
    lat: 25.4145,
    lon: 49.6868,
    author: "marviikad",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Qarah_mountain_in_the_-hofuf_-saudi_arabia._The_entrance_to_the_caves.jpg",
  },
  {
    id: "at-turaif",
    place: "حي الطريف",
    region: "الدرعية",
    image: "/images/geo/at-turaif.jpg",
    lat: 24.7362,
    lon: 46.5751,
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    source:
      "https://commons.wikimedia.org/wiki/File:At-Turaif_District_in_ad-Dir%27iyah_(1).jpg",
  },
  {
    id: "khobar-corniche",
    place: "كورنيش الخبر",
    region: "الخبر",
    image: "/images/geo/khobar-corniche.jpg",
    lat: 26.3017,
    lon: 50.2275,
    author: "Francisco Anzola",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Al_Khobar_Corniche_(12482233074).jpg",
  },
  {
    id: "najran-market",
    place: "سوق الجنابي",
    region: "نجران",
    image: "/images/geo/najran-market.jpg",
    lat: 17.4901,
    lon: 44.129,
    author: "Richard Mortel",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Traditional_dagger_market_in_Najran,_Saudi_Arabia_(1).jpg",
  },
  {
    id: "wahbah-crater",
    place: "فوهة الوعبة",
    region: "منطقة مكة المكرمة",
    image: "/images/geo/wahbah-crater.jpg",
    lat: 22.9,
    lon: 41.1389,
    author: "SariSabban",
    license: "CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Wahbah_Crater_Palm_Trees.JPG",
  },
  {
    id: "al-balad",
    place: "جدة التاريخية (البلد)",
    region: "جدة",
    image: "/images/geo/al-balad.jpg",
    lat: 21.4849,
    lon: 39.1876,
    author: "Francisco Anzola",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Old_Jeddah_(Al_Balad)_architecture_3_Feb_2022.jpg",
  },
  {
    id: "rijal-almaa",
    place: "قرية رجال ألمع",
    region: "عسير",
    image: "/images/geo/rijal-almaa.jpg",
    lat: 18.184,
    lon: 42.2522,
    author: "Saudi Press Agency (SPA)",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Rijal_Almaa,_Aseer,_Saudi_Arabia_(2020).jpg",
  },
  {
    id: "elephant-rock",
    place: "جبل الفيل",
    region: "العلا",
    image: "/images/geo/elephant-rock.jpg",
    lat: 26.69,
    lon: 37.9823,
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    source:
      "https://commons.wikimedia.org/wiki/File:Elephant_rock,_Al-%27Ula_(1).jpg",
  },
  {
    id: "shubra-palace",
    place: "قصر شبرا",
    region: "الطائف",
    image: "/images/geo/shubra-palace.jpg",
    lat: 21.286,
    lon: 40.4148,
    author: "Richard Mortel",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Shubra_Palace,_1905,_al-Taif,_Saudi_Arabia_(6).jpg",
  },
  {
    id: "ukhdood",
    place: "الأخدود",
    region: "نجران",
    image: "/images/geo/ukhdood.jpg",
    lat: 17.4773,
    lon: 44.1794,
    author: "Mohammad Umair Yaqub",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:AlUkhdood_Village_01.jpg",
  },
  {
    id: "buraidah",
    place: "طريق الملك فهد",
    region: "بريدة",
    image: "/images/geo/buraidah.jpg",
    lat: 26.3515,
    lon: 43.9612,
    author: "Kskhh",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:King_Fahad_Road_in_Buraydah.jpg",
  },
  {
    id: "taif-hada",
    place: "الهدا",
    region: "الطائف",
    image: "/images/geo/taif-hada.jpg",
    lat: 21.3661,
    lon: 40.2629,
    author: "Richard Mortel",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Al-Hada,_near_al-Taif,_Saudi_Arabia_(2).jpg",
  },
  {
    id: "tabuk-castle",
    place: "قلعة تبوك",
    region: "تبوك",
    image: "/images/geo/tabuk-castle.jpg",
    lat: 28.3838,
    lon: 36.5662,
    author: "Heritage Commission",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:%D9%82%D9%84%D8%B9%D8%A9_%D8%AA%D8%A8%D9%88%D9%83.jpg",
  },
  {
    id: "hegra",
    place: "الحجر (مدائن صالح)",
    region: "العلا",
    image: "/images/geo/hegra.jpg",
    lat: 26.7917,
    lon: 37.9536,
    author: "Following Hadrian",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:27,_Hegra_(Mada%27in_Salih),_Saudi_Arabia_-_53535097234.jpg",
  },
  {
    id: "uhud",
    place: "جبل أحد",
    region: "المدينة المنورة",
    image: "/images/geo/uhud.jpg",
    lat: 24.5,
    lon: 39.6167,
    author: "Adiput (talk)",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Mount_Uhud.JPG",
  },
];

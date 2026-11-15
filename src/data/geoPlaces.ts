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
    id: "kingdom-centre",
    place: "برج المملكة",
    region: "الرياض",
    image: "/images/geo/kingdom-centre.jpg",
    lat: 24.7113,
    lon: 46.6743,
    author: "Wajahat Mahmood from Perth, Australia",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kingdom_Centre,_Riyadh_(6129688934).jpg",
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
    id: "jeddah-fountain",
    place: "نافورة الملك فهد",
    region: "جدة",
    image: "/images/geo/jeddah-fountain.jpg",
    lat: 21.5186,
    lon: 39.1528,
    author: "Tahir mq",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:King_Fahd%27s_Fountain_2.jpg",
  },
];

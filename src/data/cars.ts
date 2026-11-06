export type CarItem = {
  id: string;
  brand: string;
  model: string;
  image: string;
  focusX: number;
  focusY: number;
  author: string;
  license: string;
  source: string;
};

export const CARS: CarItem[] = [
  {
    id: "camry",
    brand: "تويوتا",
    model: "كامري",
    image: "/images/cars/camry.jpg",
    focusX: 58,
    focusY: 51,
    author: "MercurySable99",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2023_Toyota_Camry_XSE,_front_right,_08-30-2026.jpg",
  },
  {
    id: "landcruiser",
    brand: "تويوتا",
    model: "لاندكروزر",
    image: "/images/cars/landcruiser.jpg",
    focusX: 65,
    focusY: 48,
    author: "TTTNIS",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:2021_Toyota_Land_Cruieser_300_ZX.jpg",
  },
  {
    id: "patrol",
    brand: "نيسان",
    model: "باترول",
    image: "/images/cars/patrol.jpg",
    focusX: 20,
    focusY: 44,
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:NISSAN_PATROL_Y62_China_(30).jpg",
  },
  {
    id: "yukon",
    brand: "جي إم سي",
    model: "يوكن",
    image: "/images/cars/yukon.jpg",
    focusX: 49,
    focusY: 47,
    author: "Kevauto",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2021_GMC_Yukon_XL_SLT,_front_9.24.20.jpg",
  },
  {
    id: "tahoe",
    brand: "شفروليه",
    model: "تاهو",
    image: "/images/cars/tahoe.jpg",
    focusX: 74,
    focusY: 52,
    author: "MercurySable99",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:15-20_Chevrolet_Tahoe_LT.jpg",
  },
  {
    id: "sonata",
    brand: "هيونداي",
    model: "سوناتا",
    image: "/images/cars/sonata.jpg",
    focusX: 31,
    focusY: 54,
    author: "MercurySable99",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2020_Hyundai_Sonata_SE,_front_left,_12-08-2022.jpg",
  },
  {
    id: "accent",
    brand: "هيونداي",
    model: "أكسنت",
    image: "/images/cars/accent.jpg",
    focusX: 35,
    focusY: 54,
    author: "Kevauto",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2018_Hyundai_Accent_1.6L_front_7.28.18.jpg",
  },
  {
    id: "elantra",
    brand: "هيونداي",
    model: "إلنترا",
    image: "/images/cars/elantra.jpg",
    focusX: 66,
    focusY: 56,
    author: "Mr.choppers",
    license: "CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2021_Hyundai_Elantra_Limited_in_Quartz_White,_front_right.jpg",
  },
  {
    id: "corolla",
    brand: "تويوتا",
    model: "كورولا",
    image: "/images/cars/corolla.jpg",
    focusX: 27,
    focusY: 49,
    author: "Matti Blume",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Hybrid_Sedan,_GIMS_2019,_Le_Grand-Saconnex_(GIMS1338).jpg",
  },
  {
    id: "hilux",
    brand: "تويوتا",
    model: "هايلكس",
    image: "/images/cars/hilux.jpg",
    focusX: 79,
    focusY: 59,
    author: "RL GNZLZ from Chile",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Hilux_2016_(32113310141).jpg",
  },
  {
    id: "accord",
    brand: "هوندا",
    model: "أكورد",
    image: "/images/cars/accord.jpg",
    focusX: 37,
    focusY: 58,
    author: "Kevauto",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2018_Honda_Accord_front_4.1.18.jpg",
  },
  {
    id: "civic",
    brand: "هوندا",
    model: "سيفيك",
    image: "/images/cars/civic.jpg",
    focusX: 71,
    focusY: 55,
    author: "MercurySable99",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2022_Honda_Civic_LX_Sedan,_front_right,_11-02-2022.jpg",
  },
  {
    id: "mazda6",
    brand: "مازدا",
    model: "6",
    image: "/images/cars/mazda6.jpg",
    focusX: 75,
    focusY: 55,
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2016_Mazda6_(GJ_Series_2)_Touring_sedan_(2018-10-22)_01.jpg",
  },
  {
    id: "rangerover",
    brand: "لاند روفر",
    model: "رنج روفر",
    image: "/images/cars/rangerover.jpg",
    focusX: 37,
    focusY: 53,
    author: "DeFacto",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Land_Rover_Range_Rover_Autobiography_2016.jpg",
  },
  {
    id: "gclass",
    brand: "مرسيدس",
    model: "جي كلاس",
    image: "/images/cars/gclass.jpg",
    focusX: 62,
    focusY: 61,
    author: "crash71100",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:Mercedes_G-Class_(50472054506).jpg",
  },
  {
    id: "sclass",
    brand: "مرسيدس",
    model: "إس كلاس",
    image: "/images/cars/sclass.jpg",
    focusX: 48,
    focusY: 54,
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:MERCEDES-BENZ_S-CLASS_(W223)_China_(26).jpg",
  },
  {
    id: "bmw7",
    brand: "بي إم دبليو",
    model: "الفئة السابعة",
    image: "/images/cars/bmw7.jpg",
    focusX: 68,
    focusY: 53,
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:BMW_7_SERIES_LWB_(G11)_China_(15).jpg",
  },
  {
    id: "lexuslx",
    brand: "لكزس",
    model: "LX",
    image: "/images/cars/lexuslx.jpg",
    focusX: 37,
    focusY: 49,
    author: "Alexander Migl",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Lexus_LX_570_(URJ201W)_IMG_4913.jpg",
  },
  {
    id: "porsche911",
    brand: "بورش",
    model: "911",
    image: "/images/cars/porsche911.jpg",
    focusX: 57,
    focusY: 52,
    author: "Alexander Migl",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Porsche_992_Carrera_S_coupe_IMG_5838.jpg",
  },
  {
    id: "mustang",
    brand: "فورد",
    model: "موستنج",
    image: "/images/cars/mustang.jpg",
    focusX: 40,
    focusY: 56,
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2018_Ford_Mustang_GT_5.0_Front.jpg",
  },
];

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter";

type GameCard = {
  id: string;
  image: string;
  title: string;
};

const GAME_CARDS: GameCard[] = [
  { id: "car", image: "/images/posters/Cargame.png", title: "عينك عالموتر" },
  { id: "club", image: "/images/posters/Clubgame.png", title: "وش ناديك؟" },
  { id: "scramble", image: "/images/posters/Whogame.png", title: "منهو ذا؟" },
  { id: "word", image: "/images/posters/wordgame.png", title: "خمن الكلمة" },
  { id: "quiz", image: "/images/posters/Quizgame.png", title: "أسئلة وأجوبة" },
  { id: "logo", image: "/images/posters/Logogame.png", title: "خمن الشعار" },
  { id: "country", image: "/images/posters/Countries.png", title: "خمن العلم" },
  { id: "wheel", image: "/images/posters/Wheelgame.png", title: "لف وخمن" },
  { id: "draw", image: "/images/posters/Proverbgame.png", title: "خمن المثل" },
  {
    id: "categories",
    image: "/images/posters/Categoriesgame.png",
    title: "إنسان حيوان نبات جماد بلاد",
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/match");
    router.prefetch("/guide");
  }, [router]);

  return (
    <main className="min-h-[100svh] px-4 pb-4 pt-3 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <header className="relative flex min-h-[112px] items-start justify-center">
          <Image
            src="/logo.png"
            alt="خل نلعب"
            width={280}
            height={200}
            priority
            className="h-auto w-[150px] object-contain sm:w-[170px]"
          />

          <Link
            href="/guide"
            prefetch={false}
            className="nav-pill absolute left-0 top-2"
          >
            طريقة اللعب
          </Link>
        </header>

        <section className="mt-2 text-center">
          <p className="text-sm font-black text-[#ffb21e] sm:text-base">
            تحدي الجلسة 🏆
          </p>

          <h1 className="mt-1 text-4xl font-black leading-normal sm:text-5xl">
            وش تبون تلعبون؟
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-base font-bold leading-7 text-white/60">
            اختاروا لعبة وضيفوا معها اللي تبون. تلعبونها ورا بعض، واللي يجمع
            نقاط أكثر يفوز.
          </p>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {GAME_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/match?mode=session&pick=${card.id}`}
              prefetch={false}
              aria-label={card.title}
              className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ffb21e]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_6px_0_#0e0a1f] transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-1 group-active:translate-y-0.5">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 210px"
                  className="object-cover"
                />
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-bold text-white/50">
            تبون تختارون الألعاب بنفسكم من البداية؟
          </p>

          <Link
            href="/match?mode=session"
            prefetch={false}
            className="btn-primary px-10 py-3 text-lg"
          >
            ابدأ تحدي الجلسة
          </Link>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}

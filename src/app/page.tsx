"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";

type GameCard = {
  href: string;
  image: string;
  title: string;
  x: number;
  y: number;
  scale: number;
  z: number;
  delay: number;
};

const GAME_CARDS: GameCard[] = [
  {
    href: "/match?game=scramble",
    image: "/images/posters/Whogame.png",
    title: "منهو ذا؟",
    x: -405,
    y: 16,
    scale: 0.84,
    z: 10,
    delay: -1.2,
  },
  {
    href: "/match?game=quiz",
    image: "/images/posters/Quizgame.png",
    title: "أسئلة وأجوبة",
    x: -315,
    y: 12,
    scale: 0.88,
    z: 20,
    delay: -3.6,
  },
  {
    href: "/match?game=word",
    image: "/images/posters/wordgame.png",
    title: "خمن الكلمة",
    x: -225,
    y: 8,
    scale: 0.92,
    z: 30,
    delay: -2.1,
  },
  {
    href: "/match?game=logo",
    image: "/images/posters/Logogame.png",
    title: "خمن الشعار",
    x: -135,
    y: 4,
    scale: 0.96,
    z: 40,
    delay: -5.1,
  },
  {
    href: "/match?game=car",
    image: "/images/posters/Cargame.png",
    title: "عينك عالموتر",
    x: -45,
    y: 0,
    scale: 1,
    z: 50,
    delay: -3.3,
  },
  {
    href: "/match?game=club",
    image: "/images/posters/Clubgame.png",
    title: "وش ناديك؟",
    x: 45,
    y: 0,
    scale: 1,
    z: 50,
    delay: -4.1,
  },
  {
    href: "/match?game=country",
    image: "/images/posters/Countries.png",
    title: "خمن العلم",
    x: 135,
    y: 4,
    scale: 0.96,
    z: 40,
    delay: -1.8,
  },
  {
    href: "/match?game=wheel",
    image: "/images/posters/Wheelgame.png",
    title: "لف وخمن",
    x: 225,
    y: 8,
    scale: 0.92,
    z: 30,
    delay: -4.4,
  },
  {
    href: "/match?game=draw",
    image: "/images/posters/Proverbgame.png",
    title: "خمن المثل",
    x: 315,
    y: 12,
    scale: 0.88,
    z: 20,
    delay: -0.7,
  },
  {
    href: "/match?game=categories",
    image: "/images/posters/Categoriesgame.png",
    title: "إنسان حيوان نبات جماد بلاد",
    x: 405,
    y: 16,
    scale: 0.84,
    z: 10,
    delay: -2.9,
  },
];

const CARD_TRANSITION =
  "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease";

export default function Home() {
  const router = useRouter();

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    router.prefetch("/match");
    router.prefetch("/guide");
  }, [router]);

  function prepareNavigation() {
    setIsLeaving(true);
    setHoveredCard(null);
  }

  return (
    <main
      className={`
        relative
        min-h-[100svh]
        overflow-x-hidden
        px-4
        pb-4
        pt-3
        text-white
        sm:px-6
        lg:px-8

        ${isLeaving ? "home-leaving" : ""}
      `}
    >
      <div className="mx-auto max-w-[1450px]">
        <header className="flex min-h-[112px] items-start justify-center">
          <Image
            src="/logo.png"
            alt="خل نلعب"
            width={280}
            height={200}
            priority
            className="
              h-auto
              w-[175px]
              object-contain
              sm:w-[190px]
            "
          />
        </header>

        <section
          className="
            relative
            pb-4
            pt-3
          "
        >
          <Link
            href="/guide"
            prefetch={false}
            onClick={prepareNavigation}
            className="
              nav-pill
              relative
              z-50
              mx-auto
              mb-3
              flex
              w-fit
              md:absolute
              md:left-5
              md:top-5
              md:mb-0
            "
          >
            <span>طريقة اللعب</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black leading-normal sm:text-5xl">
              تحدي الجلسة 🏆
            </h1>

            <div className="mx-auto mt-2 max-w-xl">
              <p className="text-base font-bold leading-7 text-white/60">
                تقسمون نفسكم فريقين، تلعبون كم لعبة ورا بعض، واللي يجمع نقاط
                أكثر يفوز.
              </p>
            </div>

            <Link
              href="/match?mode=session"
              prefetch={false}
              onClick={prepareNavigation}
              className="btn-primary mt-5 px-10 py-3 text-lg"
            >
              ابدأ تحدي الجلسة
            </Link>
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-sm font-bold text-white/35">أو</span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="relative mx-auto mt-3 max-w-[1120px] pb-1 pt-3">
            <div className="relative z-10 text-center">
              <h2 className="text-xl font-black sm:text-2xl">
                جرّبوا لعبة وحدة
              </h2>

              <p className="mt-1 text-sm font-bold text-white/45">
                ما عندكم وقت لجلسة كاملة؟ اضغطوا على أي لعبة
              </p>
            </div>

            <div
              className="relative mx-auto hidden h-[268px] max-w-[1020px] lg:block"
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute left-1/2 top-[49%]">
                {GAME_CARDS.map((card, index) => {
                  const active = hoveredCard === index;

                  const spread =
                    hoveredCard === null
                      ? 0
                      : index < hoveredCard
                        ? -24
                        : index > hoveredCard
                          ? 24
                          : 0;

                  const finalX = card.x + spread;

                  const finalY = active ? card.y - 30 : card.y;

                  return (
                    <Link
                      key={card.title}
                      href={card.href}
                      prefetch={false}
                      aria-label={card.title}
                      onClick={prepareNavigation}
                      onMouseEnter={() => {
                        if (!isLeaving) {
                          setHoveredCard(index);
                        }
                      }}
                      onFocus={() => {
                        if (!isLeaving) {
                          setHoveredCard(index);
                        }
                      }}
                      onBlur={() => setHoveredCard(null)}
                      className="
                          home-card-link
                          group
                          absolute
                          left-1/2
                          top-1/2
                          cursor-pointer
                          rounded-[20px]
                          outline-none
                        "
                      style={{
                        width: "190px",
                        height: "238px",

                        zIndex: active ? 100 : card.z,

                        transform: `
                            translate(-50%, -50%)
                            translate3d(
                              ${finalX}px,
                              ${finalY}px,
                              0
                            )
                            scale(
                              ${active ? card.scale + 0.11 : card.scale}
                            )
                          `,

                        transition: CARD_TRANSITION,

                        opacity: hoveredCard !== null && !active ? 0.78 : 1,
                      }}
                    >
                      <div
                        className={`
                            game-idle-card
                            relative
                            h-full
                            w-full
                            overflow-hidden
                            rounded-[20px]
                            border
                            bg-[#11091f]
                            transition-shadow
                            duration-300
                            group-focus-visible:ring-2
                            group-focus-visible:ring-[#ffc23d]

                            ${
                              active
                                ? "game-idle-paused border-[#ffc23d]"
                                : "border-transparent"
                            }
                          `}
                        style={{
                          animationDelay: `${card.delay}s`,
                        }}
                      >
                        <Image
                          src={card.image}
                          alt=""
                          fill
                          sizes="190px"
                          className={`
                              object-cover
                              transition-transform
                              duration-500
                              ease-out

                              ${active ? "scale-[1.025]" : "scale-100"}
                            `}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 lg:hidden">
              {GAME_CARDS.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  prefetch={false}
                  aria-label={card.title}
                  onClick={prepareNavigation}
                  className="group rounded-[20px] outline-none"
                >
                  <div
                    className="
                        game-mobile-card
                        relative
                        aspect-[4/5]
                        overflow-hidden
                        rounded-[20px]
                        transition-transform
                        duration-300
                        group-focus-visible:ring-2
                        group-focus-visible:ring-[#ffc23d]
                        group-active:scale-[0.97]
                      "
                    style={{
                      animationDelay: `${card.delay}s`,
                    }}
                  >
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>

      <style>{`
        @keyframes gameCardIdle {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes gameMobileIdle {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }
        }

        .game-idle-card {
          animation: gameCardIdle 7s ease-in-out infinite;
        }

        .game-idle-paused {
          animation-play-state: paused;
        }

        .game-mobile-card {
          animation: gameMobileIdle 7s ease-in-out infinite;
        }

        .home-leaving .game-idle-card,
        .home-leaving .game-mobile-card {
          animation: none !important;
        }

        .home-leaving .home-card-link {
          transition: none !important;
        }

        .home-leaving * {
          scroll-behavior: auto !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .game-idle-card,
          .game-mobile-card {
            animation: none;
          }

          .home-card-link {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import HomeIcon from "@/components/HomeIcon";
import { HOW_TO_PLAY as games } from "@/data/howToPlay";

export default function GuidePage() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  function toggleCard(index: number) {
    setFlippedCard((current) => (current === index ? null : index));
  }

  return (
    <main className="min-h-[100dvh] px-4 py-4 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 pb-5">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">طريقة اللعب</h1>

            <p className="mt-1 text-sm font-bold text-white/50">
              اضغطوا على اللعبة وتنقلب لكم
            </p>
          </div>

          <Link href="/" className="nav-pill shrink-0">
            <HomeIcon />
            الرئيسية
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {games.map((game, index) => {
            const flipped = flippedCard === index;

            return (
              <button
                key={game.title}
                type="button"
                onClick={() => toggleCard(index)}
                aria-label={
                  flipped ? `الرجوع إلى ${game.title}` : `عرض شرح ${game.title}`
                }
                className="group relative aspect-[4/5] w-full cursor-pointer rounded-2xl text-right outline-none [perspective:1400px] focus-visible:ring-4 focus-visible:ring-[#ffc23d]"
              >
                <div
                  className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transitionTimingFunction: "var(--ease-out)",
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_6px_0_#0e0a1f] [backface-visibility:hidden]">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                      className="object-cover"
                    />
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[#221a3f] p-3 shadow-[0_6px_0_#140f29] [backface-visibility:hidden] sm:p-4"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <h2 className="shrink-0 text-base font-black sm:text-lg">
                      {game.title}
                    </h2>

                    <ol className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                      {game.how.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#ffc23d] text-[10px] font-black text-[#241339]">
                            {stepIndex + 1}
                          </span>

                          <span className="text-xs font-bold leading-5 text-white/80">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>

                    {game.example && (
                      <p className="mt-2 shrink-0 text-xs font-black leading-5 text-[#ffc23d]">
                        {game.example}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

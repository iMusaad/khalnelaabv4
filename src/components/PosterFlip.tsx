"use client";

import { useState, type ReactNode } from "react";
import { getHowToPlay } from "@/data/howToPlay";
import type { GameType } from "@/lib/matchQueue";

export default function PosterFlip({
  game,
  children,
}: {
  game: GameType;
  children: ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);

  const info = getHowToPlay(game);

  return (
    <div className="relative aspect-[4/5] w-full [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          inert={flipped}
        >
          {children}
        </div>

        {info && (
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[#221a3f] p-2.5 text-right shadow-[0_5px_0_#140f29] [backface-visibility:hidden] sm:p-3"
            style={{ transform: "rotateY(180deg)" }}
            inert={!flipped}
          >
            <h3 className="shrink-0 pl-6 text-xs font-black text-white sm:text-sm">
              {info.title}
            </h3>

            <ol className="mt-1.5 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
              {info.how.map((step, index) => (
                <li key={step} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#ffc23d] text-[9px] font-black text-[#241339]">
                    {index + 1}
                  </span>

                  <span className="text-[10px] font-bold leading-4 text-white/80 sm:text-[11px]">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {info && (
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          aria-label={
            flipped ? `رجوع لبوستر ${info.title}` : `طريقة لعب ${info.title}`
          }
          aria-expanded={flipped}
          className="absolute -left-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#2f9bff] text-base font-black text-white shadow-[0_3px_0_#1662b8] ring-[3px] ring-[#130e28] transition-transform hover:scale-110 active:scale-95"
        >
          {flipped ? "✕" : "؟"}
        </button>
      )}
    </div>
  );
}

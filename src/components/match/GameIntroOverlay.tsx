"use client";

import Image from "next/image";
import { OverlayShell } from "@/components/match/Overlays";
import { getHowToPlay } from "@/data/howToPlay";
import type { GameType } from "@/lib/matchQueue";
import { posterThumb } from "@/lib/poster";

export default function GameIntroOverlay({
  game,
  onStart,
}: {
  game: GameType;
  onStart: () => void;
}) {
  const info = getHowToPlay(game);

  if (!info) {
    return null;
  }

  return (
    <OverlayShell zIndex="z-[997]">
      <p className="text-sm font-black text-white/50">اللعبة الجاية</p>

      <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:text-right">
        <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-2xl sm:w-40">
          <Image
            src={posterThumb(info.image)}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="w-full">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {info.title}
          </h2>

          <ol className="mt-3 space-y-1.5 text-right">
            {info.how.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffb21e] text-xs font-black text-[#241339]">
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-6 text-white/85 sm:text-base">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          {info.example && (
            <p className="mt-3 rounded-xl bg-[#15102b] px-3 py-2 text-right text-sm font-bold text-white/60">
              {info.example}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="btn-primary min-w-[180px] py-3 text-lg"
        >
          فهمنا، يلا
        </button>

        <button
          type="button"
          onClick={onStart}
          className="text-sm font-black text-white/50 underline hover:text-white"
        >
          تخطي
        </button>
      </div>

      <p className="mt-4 text-xs font-bold text-white/35">
        الشرح يطلع أول مرة بس، وتلقونه بعدين في زر ؟ فوق اللعبة
      </p>
    </OverlayShell>
  );
}

"use client";

import { useEffect, useState } from "react";

import QrCode from "@/components/QrCode";
import GameLayout from "@/components/match/GameLayout";
import { CLUBS, type ClubItem } from "@/data/clubs";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { WinnerType } from "@/types/game";

type Props = {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
};

const clubDeck = createDeck(CLUBS);

type ClubRoundState = {
  clubs: [ClubItem, ClubItem];
  started: boolean;
  revealed: boolean;
};

const actionButtonClass = "btn-primary mt-5 w-full py-3 text-lg";

export default function ClubGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 60,
}: Props) {
  const [clubs, setClubs] = useState<[ClubItem, ClubItem] | null>(null);

  const [origin, setOrigin] = useState("");

  const [started, setStarted] = useState(false);

  const [revealed, setRevealed] = useState(false);

  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const side1 = side1Name || "فريق 1";

  const side2 = side2Name || "فريق 2";

  useEffect(() => {
    setOrigin(window.location.origin);

    setTimeLeft(timerSeconds);

    const saved = readRoundState<ClubRoundState>("club", roundKey);

    if (saved && saved.clubs.length === 2) {
      setClubs(saved.clubs);
      setStarted(saved.started);
      setRevealed(saved.revealed);
      return;
    }

    const picked = clubDeck.draw(2);

    if (picked.length < 2) {
      return;
    }

    setClubs([picked[0], picked[1]]);

    setStarted(false);
    setRevealed(false);
  }, [roundKey, timerSeconds]);

  useEffect(() => {
    if (!clubs) {
      return;
    }

    writeRoundState<ClubRoundState>("club", roundKey, {
      clubs,
      started,
      revealed,
    });
  }, [roundKey, clubs, started, revealed]);

  useEffect(() => {
    if (!timerEnabled || !started || revealed || timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [timerEnabled, started, revealed, timeLeft]);

  if (!clubs) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-white">
        <p className="font-black">جاري تجهيز الأندية...</p>
      </div>
    );
  }

  const [side1Club, side2Club] = clubs;

  const side1ClubUrl = origin ? `${origin}/club/${side1Club.id}` : "";

  const side2ClubUrl = origin ? `${origin}/club/${side2Club.id}` : "";

  return (
    <GameLayout
      title="وش ناديك؟"
      side1={side1}
      side2={side2}
      side1Score={0}
      side2Score={0}
      sideStatus={
        revealed
          ? { side1: "انكشف", side2: "انكشف" }
          : started
            ? { side1: "يخمنون", side2: "يخمنون" }
            : { side1: "يمسحون الكود", side2: "يمسحون الكود" }
      }
      turn={started ? "خمنوا الأندية" : "جاهزين؟"}
      neutralTurnStyle="duo"
      currentRound={currentRound}
      game="club"
    >
      <div className="mx-auto w-full max-w-5xl" dir="rtl">
        {!started ? (
          <>
            <div className="mb-4 text-center">
              <h2 className="text-xl font-black text-white sm:text-2xl">
                كل فريق يمسح كوده
              </h2>

              <p className="mt-2 text-sm font-bold text-white/50">
                بيطلع لكم النادي اللي لازم الفريق الثاني يخمنه
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                sm:gap-8
                lg:gap-16
              "
            >
              <div
                className="
                  mx-auto
                  w-full
                  max-w-[310px]
                  rounded-[20px]
                  bg-[#221a3f]
                  p-3
                  text-center
                  shadow-[0_5px_0_#140f29]
                "
              >
                <p className="text-base font-black text-[#ffb21e]">{side1}</p>

                <div className="mx-auto mt-3 w-fit rounded-[16px] bg-white p-2">
                  {side2ClubUrl ? (
                    <QrCode
                      value={side2ClubUrl}
                      label={`كود ${side1}`}
                      className="h-[200px] w-[200px]"
                    />
                  ) : (
                    <div className="h-[200px] w-[200px]" />
                  )}
                </div>
              </div>

              <div
                className="
                  mx-auto
                  w-full
                  max-w-[310px]
                  rounded-[20px]
                  bg-[#221a3f]
                  p-3
                  text-center
                  shadow-[0_5px_0_#140f29]
                "
              >
                <p className="text-base font-black text-[#4aa8ff]">{side2}</p>

                <div className="mx-auto mt-3 w-fit rounded-[16px] bg-white p-2">
                  {side1ClubUrl ? (
                    <QrCode
                      value={side1ClubUrl}
                      label={`كود ${side2}`}
                      className="h-[200px] w-[200px]"
                    />
                  ) : (
                    <div className="h-[200px] w-[200px]" />
                  )}
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-sm font-bold text-white/50">
              اللي يسكن كود الفريق اللي ضده يا ويله
            </p>

            <button
              type="button"
              onClick={() => {
                setStarted(true);

                setTimeLeft(timerSeconds);
              }}
              className={actionButtonClass}
            >
              الكل شاف النادي؟ ابدأوا
            </button>
          </>
        ) : (
          <>
            <div className="py-2 text-center">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                وش ناديكم؟
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-6 text-white/55">
                اسألوا الفريق الثاني أسئلة جوابها نعم أو لا لين تعرفون ناديكم
              </p>

              {timerEnabled && (
                <div
                  className={`mt-4 text-center text-lg font-black ${
                    timeLeft <= 10 ? "text-red-300" : "text-white/70"
                  }`}
                >
                  {timeLeft} ثانية
                </div>
              )}
            </div>

            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className={actionButtonClass}
              >
                كشف الأندية
              </button>
            ) : (
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-12">
                  <div
                    className="
                      rounded-[22px]
                      bg-[#221a3f]
                      p-3
                      text-center
                      sm:p-4
                    "
                  >
                    <p className="text-sm font-black text-[#ffb21e]">
                      نادي {side1}
                    </p>

                    <div className="mt-3 overflow-hidden rounded-[16px] bg-white p-2 sm:p-3">
                      <img
                        src={side1Club.crest}
                        alt={side1Club.nameAr}
                        className="mx-auto h-[110px] w-full object-contain sm:h-[145px]"
                      />
                    </div>

                    <p className="mt-3 text-base font-black text-white sm:text-xl">
                      {side1Club.nameAr}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-[22px]
                      bg-[#221a3f]
                      p-3
                      text-center
                      sm:p-4
                    "
                  >
                    <p className="text-sm font-black text-[#4aa8ff]">
                      نادي {side2}
                    </p>

                    <div className="mt-3 overflow-hidden rounded-[16px] bg-white p-2 sm:p-3">
                      <img
                        src={side2Club.crest}
                        alt={side2Club.nameAr}
                        className="mx-auto h-[110px] w-full object-contain sm:h-[145px]"
                      />
                    </div>

                    <p className="mt-3 text-base font-black text-white sm:text-xl">
                      {side2Club.nameAr}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRoundEnd()}
                  className={actionButtonClass}
                >
                  إنهاء الجولة
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </GameLayout>
  );
}

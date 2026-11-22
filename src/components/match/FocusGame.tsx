"use client";

import { useEffect, useRef, useState } from "react";
import GameLayout from "@/components/match/GameLayout";
import { InlineTeamPick } from "@/components/match/Overlays";
import YouTubeClip from "@/components/match/YouTubeClip";
import { FOCUS_CLIPS as clips, type FocusClip } from "@/data/focus";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { RoundPoints, WinnerType } from "@/types/game";

const CLIPS_PER_GAME = 4;
const SECOND_TIME = 10;

type TeamSide = "side1" | "side2";

type Stage = "ready" | "watching" | "question" | "revealed" | "failed";

const clipDeck = createDeck(clips, "focus");

type FocusRoundState = {
  rounds: FocusClip[];
  index: number;
  stage: Stage;
  secondTurn: boolean;
  side1Score: number;
  side2Score: number;
};

export default function FocusGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 30,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType, points?: RoundPoints) => void;
  roundKey: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
}) {
  const [rounds, setRounds] = useState<FocusClip[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<Stage>("ready");
  const [secondTurn, setSecondTurn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [side1Score, setSide1Score] = useState(0);
  const [side2Score, setSide2Score] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setLoaded(true);
    setTimeLeft(timerSeconds);

    const saved = readRoundState<FocusRoundState>("focus", roundKey);

    if (saved && saved.rounds.length > 0) {
      setRounds(saved.rounds);
      setIndex(saved.index);
      setStage(saved.stage === "watching" ? "ready" : saved.stage);
      setSecondTurn(saved.secondTurn);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      return;
    }

    setRounds(clipDeck.draw(CLIPS_PER_GAME));
    setIndex(0);
    setStage("ready");
    setSecondTurn(false);
    setSide1Score(0);
    setSide2Score(0);
  }, [roundKey, timerSeconds]);

  useEffect(() => {
    if (!loaded || rounds.length === 0) {
      return;
    }

    writeRoundState<FocusRoundState>("focus", roundKey, {
      rounds,
      index,
      stage,
      secondTurn,
      side1Score,
      side2Score,
    });
  }, [
    loaded,
    roundKey,
    rounds,
    index,
    stage,
    secondTurn,
    side1Score,
    side2Score,
  ]);

  const current = rounds[index];

  const mainTurn: TeamSide = index % 2 === 0 ? "side1" : "side2";

  const activeTurn: TeamSide = secondTurn
    ? mainTurn === "side1"
      ? "side2"
      : "side1"
    : mainTurn;

  const activeTeamName =
    activeTurn === "side1" ? side1Name || "فريق 1" : side2Name || "فريق 2";

  useEffect(() => {
    if (!timerEnabled || stage !== "question" || !current) {
      return;
    }

    if (timeLeft <= 0) {
      if (!secondTurn) {
        setSecondTurn(true);
        setTimeLeft(SECOND_TIME);
      } else {
        setStage("revealed");
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, stage, secondTurn, current, timerEnabled]);

  function startClip() {
    setStage("watching");
    setReplaying(false);
  }

  function handleClipEnded() {
    if (stage === "watching") {
      setTimeLeft(timerSeconds);
      setStage("question");
    }
  }

  function handleClipError() {
    if (stage === "watching") {
      setStage("failed");
    } else {
      setReplaying(false);
    }
  }

  function skipClip() {
    if (index + 1 >= rounds.length) {
      finishGame(side1Score, side2Score);
      return;
    }

    setIndex((currentIndex) => currentIndex + 1);
    setStage("ready");
    setSecondTurn(false);
    setReplaying(false);
    setTimeLeft(timerSeconds);
  }

  function finishGame(final1: number, final2: number) {
    onRoundEnd(final1 > final2 ? "side1" : final2 > final1 ? "side2" : "none", {
      side1: final1,
      side2: final2,
    });
  }

  function givePoint(winner: WinnerType) {
    const next1 = side1Score + (winner === "side1" ? 1 : 0);
    const next2 = side2Score + (winner === "side2" ? 1 : 0);

    setSide1Score(next1);
    setSide2Score(next2);

    if (index + 1 >= rounds.length) {
      finishGame(next1, next2);
      return;
    }

    setIndex((currentIndex) => currentIndex + 1);
    setStage("ready");
    setSecondTurn(false);
    setReplaying(false);
    setTimeLeft(timerSeconds);
  }

  if (!current) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه مقاطع كافية</p>

        <button
          type="button"
          onClick={() => onRoundEnd("none")}
          className="btn-primary mt-4"
        >
          إنهاء اللعبة
        </button>
      </div>
    );
  }

  const isLast = index + 1 >= rounds.length;

  const timerTextClass =
    timeLeft <= 5
      ? "animate-pulse text-red-300"
      : timeLeft <= 10
        ? "text-yellow-200"
        : "text-white/70";

  return (
    <GameLayout
      reportItem={`${current.question} | الجواب: ${current.answer}`}
      title="ركّز"
      side1={side1Name || "فريق 1"}
      side2={side2Name || "فريق 2"}
      side1Score={side1Score}
      side2Score={side2Score}
      turn={activeTeamName}
      turnSide={activeTurn}
      currentRound={currentRound}
      game="focus"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <div className="text-sm font-bold text-white/50">
            المقطع <span className="text-white">{index + 1}</span>
            {" / "}
            {rounds.length}
          </div>

          {secondTurn && stage === "question" && (
            <div className="text-sm font-black text-[#ffb21e]">فرصة ثانية</div>
          )}

          {timerEnabled && stage === "question" && (
            <div className={`text-sm font-black ${timerTextClass}`}>
              {timeLeft} ثانية
            </div>
          )}
        </div>

        {stage === "ready" && (
          <div className="mx-auto flex aspect-video w-full max-w-[640px] flex-col items-center justify-center gap-4 rounded-3xl bg-[#221a3f] p-6 text-center shadow-[0_6px_0_#140f29]">
            <p className="text-2xl font-black text-white">ركّزوا زين</p>
            <p className="text-sm font-bold text-white/60">
              المقطع يطلع مرة وحدة، وبعده سؤال
            </p>
            <button type="button" onClick={startClip} className="btn-primary">
              شغّل المقطع
            </button>
          </div>
        )}

        {(stage === "watching" || replaying) &&
          (current.kind === "youtube" ? (
            <YouTubeClip
              key={`${current.id}-${replaying ? "replay" : "watch"}`}
              youtubeId={current.youtubeId}
              start={current.start}
              end={current.end}
              controls={replaying}
              onEnded={stage === "watching" ? handleClipEnded : undefined}
              onError={handleClipError}
            />
          ) : (
            <video
              key={`${current.id}-${replaying ? "replay" : "watch"}`}
              ref={videoRef}
              src={current.video}
              poster={current.poster}
              autoPlay
              muted
              playsInline
              controls={replaying}
              onEnded={handleClipEnded}
              onError={handleClipError}
              className="mx-auto aspect-video w-full max-w-[640px] rounded-3xl bg-black object-contain"
            />
          ))}

        {stage === "failed" && (
          <div className="mx-auto flex aspect-video w-full max-w-[640px] flex-col items-center justify-center gap-4 rounded-3xl bg-[#221a3f] p-6 text-center shadow-[0_6px_0_#140f29]">
            <p className="text-xl font-black text-white">المقطع ما اشتغل</p>
            <p className="text-sm font-bold text-white/60">
              تأكدوا من النت، أو تخطّوا للمقطع اللي بعده
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={startClip} className="btn-primary">
                جرّبوا مرة ثانية
              </button>
              <button
                type="button"
                onClick={skipClip}
                className="btn-secondary"
              >
                تخطّوا المقطع
              </button>
            </div>
          </div>
        )}

        {(stage === "question" || stage === "revealed") && (
          <div className="mx-auto w-full max-w-[640px] rounded-3xl bg-[#221a3f] p-6 text-center shadow-[0_6px_0_#140f29]">
            <p className="text-sm font-bold text-white/50">السؤال</p>
            <p className="mt-2 text-2xl font-black leading-snug text-white sm:text-3xl">
              {current.question}
            </p>
          </div>
        )}

        {stage === "revealed" && (
          <div className="mx-auto w-full max-w-[640px] rounded-2xl bg-[#ffb21e] p-5 text-center text-[#241339] shadow-[0_5px_0_#c27700]">
            <p className="text-sm font-bold opacity-70">الإجابة</p>
            <p className="mt-2 text-2xl font-black">{current.answer}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {stage === "question" && (
            <button
              type="button"
              onClick={() => setStage("revealed")}
              className="btn-primary"
            >
              إظهار الإجابة
            </button>
          )}

          {stage === "revealed" && (
            <>
              {!replaying && (
                <button
                  type="button"
                  onClick={() => setReplaying(true)}
                  className="btn-secondary"
                >
                  شوفوا المقطع مرة ثانية
                </button>
              )}

              <InlineTeamPick
                resetKey={index}
                title={
                  isLast ? "مين جاوب صح؟ وبعدها تخلص اللعبة" : "مين جاوب صح؟"
                }
                side1Name={side1Name}
                side2Name={side2Name}
                onPick={givePoint}
              />
            </>
          )}
        </div>

        {stage === "revealed" && (
          <p className="text-center text-xs font-bold text-white/35" dir="auto">
            المقطع: {current.credit}
          </p>
        )}
      </div>
    </GameLayout>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameLayout from "@/components/match/GameLayout";

import {
  WHEEL_SEGMENTS as SEGMENTS,
  WHEEL_PUZZLES as PUZZLES,
  WHEEL_LETTER_ROWS as LETTER_ROWS,
} from "@/data/wheel";

import { createDeck } from "@/lib/deck";
import { getPointsWinner } from "@/lib/scoring";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { TeamTurn as Turn, WinnerType } from "@/types/game";
import type { WheelValue as Value } from "@/data/wheel";

const puzzleDeck = createDeck(PUZZLES);

type WheelRoundState = {
  answer: string;
  category: string;
  revealed: string[];
  usedLetters: string[];
  turn: Turn;
  phase: "spin" | "guess";
  currentValue: Value | null;
  score1: number;
  score2: number;
  shield1Used?: boolean;
  shield2Used?: boolean;
};

type Phase = "spin" | "result" | "guess" | "celebrate";

function normalizeArabic(text: string) {
  return text
    .trim()
    .replace(/\s+/g, "")
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

function formatValue(value: Value | null) {
  if (value === null) return "لف العجلة";
  if (value === "bankrupt") return "إفلاس";
  if (value === "lose") return "خسارة الدور";
  return `${value}`;
}

function splitAnswerWords(answer: string) {
  return answer.trim().split(/\s+/);
}

export default function WheelGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  timerEnabled = false,
  timerSeconds = 30,
  gameRoundIndex = 0,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  currentRound?: number;
  timerEnabled?: boolean;
  timerSeconds?: number;
  gameRoundIndex?: number;
}) {
  const startingTurn: Turn = gameRoundIndex % 2 === 0 ? "side1" : "side2";

  const [turn, setTurn] = useState<Turn>(startingTurn);
  const [phase, setPhase] = useState<Phase>("spin");

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [currentValue, setCurrentValue] = useState<Value | null>(null);
  const [winnerName, setWinnerName] = useState("");

  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const [shield1Used, setShield1Used] = useState(false);

  const [shield2Used, setShield2Used] = useState(false);

  const [shieldActive, setShieldActive] = useState(false);

  const [shieldNote, setShieldNote] = useState("");

  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const [wheelGlow, setWheelGlow] = useState(false);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(
    null,
  );

  const [loaded, setLoaded] = useState(false);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flowTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastTickIndexRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const totalWeight = SEGMENTS.reduce(
    (sum, segment) => sum + segment.weight,
    0,
  );

  const segmentArcs = SEGMENTS.reduce<{ start: number; end: number }[]>(
    (arcs, segment) => {
      const start = arcs.length ? arcs[arcs.length - 1].end : 0;

      return [
        ...arcs,
        { start, end: start + (segment.weight / totalWeight) * 360 },
      ];
    },
    [],
  );

  const currentTeamName = turn === "side1" ? side1Name : side2Name;

  function later(action: () => void, delay: number) {
    const timer = setTimeout(() => {
      flowTimersRef.current = flowTimersRef.current.filter(
        (item) => item !== timer,
      );

      action();
    }, delay);

    flowTimersRef.current.push(timer);
  }

  function clearFlowTimers() {
    flowTimersRef.current.forEach(clearTimeout);
    flowTimersRef.current = [];
  }

  useEffect(() => {
    setLoaded(true);

    const cleanup = () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
      }

      clearFlowTimers();
    };

    setRotation(0);
    setSpinning(false);
    setWinnerName("");
    setTimeLeft(timerSeconds);
    setWheelGlow(false);
    setActiveSegmentIndex(null);

    const saved = readRoundState<WheelRoundState>("wheel", roundKey);

    if (saved && saved.answer) {
      const guessing =
        saved.phase === "guess" && typeof saved.currentValue === "number";

      setAnswer(saved.answer);
      setCategory(saved.category);
      setRevealed(saved.revealed);
      setUsedLetters(saved.usedLetters);
      setTurn(saved.turn);
      setPhase(guessing ? "guess" : "spin");
      setCurrentValue(guessing ? saved.currentValue : null);
      setScore1(saved.score1);
      setScore2(saved.score2);
      setShield1Used(Boolean(saved.shield1Used));
      setShield2Used(Boolean(saved.shield2Used));

      return cleanup;
    }

    const [q] = puzzleDeck.draw(1);

    if (!q) {
      return cleanup;
    }

    setAnswer(q.answer);
    setCategory(q.category);

    setRevealed(Array(q.answer.length).fill(""));
    setUsedLetters([]);

    setTurn(startingTurn);
    setPhase("spin");

    setCurrentValue(null);

    setScore1(0);
    setScore2(0);

    return cleanup;
  }, [roundKey, timerSeconds, startingTurn]);

  useEffect(() => {
    if (
      !loaded ||
      !answer ||
      phase === "celebrate" ||
      phase === "result" ||
      spinning
    ) {
      return;
    }

    writeRoundState<WheelRoundState>("wheel", roundKey, {
      answer,
      category,
      revealed,
      usedLetters,
      turn,
      phase,
      currentValue,
      score1,
      score2,
      shield1Used,
      shield2Used,
    });
  }, [
    loaded,
    roundKey,
    shield1Used,
    shield2Used,
    answer,
    category,
    revealed,
    usedLetters,
    turn,
    phase,
    currentValue,
    score1,
    score2,
    spinning,
  ]);

  useEffect(() => {
    return () => {
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
      }

      clearFlowTimers();

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!timerEnabled || phase !== "guess") return;

    if (timeLeft <= 0) {
      setCurrentValue(null);
      nextTurn();
      setPhase("spin");
      setTimeLeft(timerSeconds);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timerEnabled, phase, timeLeft, timerSeconds]);

  const answerWords = useMemo(() => splitAnswerWords(answer), [answer]);

  const revealedWordGroups = useMemo(() => {
    let cursor = 0;

    return answerWords.map((word) => {
      const letters = revealed.slice(cursor, cursor + word.length);

      cursor += word.length + 1;

      return letters;
    });
  }, [answerWords, revealed]);

  function ensureAudio() {
    if (typeof window === "undefined") return;
    if (audioContextRef.current) return;

    const AudioCtx =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const gain = ctx.createGain();

    gain.gain.value = 0.09;
    gain.connect(ctx.destination);

    audioContextRef.current = ctx;
    masterGainRef.current = gain;
  }

  async function unlockAudio() {
    ensureAudio();

    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch {}
    }
  }

  function playTickSound() {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;

    if (!ctx || !masterGain) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";

    osc.frequency.setValueAtTime(950, now);

    osc.frequency.exponentialRampToValueAtTime(620, now + 0.024);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(420, now);

    gain.gain.setValueAtTime(0.0001, now);

    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.003);

    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  function playFinalTickSound() {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;

    if (!ctx || !masterGain) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";

    osc.frequency.setValueAtTime(560, now);

    osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);

    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.01);

    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  function nextTurn() {
    setShieldActive(false);
    setShieldNote("");
    setTurn((prev) => (prev === "side1" ? "side2" : "side1"));
  }

  const activeShieldUsed = turn === "side1" ? shield1Used : shield2Used;

  function activateShield() {
    if (phase !== "guess" || activeShieldUsed || shieldActive) return;

    if (turn === "side1") {
      setShield1Used(true);
    } else {
      setShield2Used(true);
    }

    setShieldActive(true);
    setShieldNote("");
  }

  function finishRound(final1: number, final2: number) {
    if (phase === "celebrate") return;

    const winner = getPointsWinner(final1, final2);

    setWinnerName(
      winner === "side1" ? side1Name : winner === "side2" ? side2Name : "",
    );

    setPhase("celebrate");

    later(() => {
      onRoundEnd(winner);
    }, 1400);
  }

  function getPointerSegmentIndex(currentRotation: number) {
    const normalized = ((currentRotation % 360) + 360) % 360;

    const pointerAngle = (360 - normalized) % 360;

    const index = segmentArcs.findIndex(
      (arc) => pointerAngle >= arc.start && pointerAngle < arc.end,
    );

    return index === -1 ? 0 : index;
  }

  function startTicking() {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
    }

    tickTimerRef.current = setInterval(() => {
      setRotation((current) => {
        const idx = getPointerSegmentIndex(current);

        if (lastTickIndexRef.current !== idx) {
          lastTickIndexRef.current = idx;

          setActiveSegmentIndex(idx);
          setWheelGlow(true);

          playTickSound();

          later(() => setWheelGlow(false), 90);
        }

        return current;
      });
    }, 58);
  }

  function stopTicking(finalRotation: number) {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }

    const idx = getPointerSegmentIndex(finalRotation);

    setActiveSegmentIndex(idx);
    setWheelGlow(true);

    playFinalTickSound();

    later(() => setWheelGlow(false), 180);
  }

  async function spinWheel() {
    if (spinning || phase !== "spin") {
      return;
    }

    await unlockAudio();

    setSpinning(true);
    setTimeLeft(timerSeconds);

    const pick = Math.random() * 360;

    const found = segmentArcs.findIndex(
      (arc) => pick >= arc.start && pick < arc.end,
    );

    const index = found === -1 ? 0 : found;

    const value: Value = SEGMENTS[index].value as Value;

    setCurrentValue(value);

    const arc = segmentArcs[index];

    const margin = Math.min(4, (arc.end - arc.start) / 4);

    const targetCenter =
      arc.start + margin + Math.random() * (arc.end - arc.start - margin * 2);

    const extraSpins = 8 * 360;

    const nextRotation =
      rotation + extraSpins + (360 - (rotation % 360)) + (360 - targetCenter);

    startTicking();

    setRotation(nextRotation);

    later(() => {
      stopTicking(nextRotation);

      setSpinning(false);
      setPhase("result");

      later(() => {
        if (value === "bankrupt") {
          if (turn === "side1") {
            setScore1(0);
          } else {
            setScore2(0);
          }

          setCurrentValue(null);
          nextTurn();
          setPhase("spin");

          return;
        }

        if (value === "lose") {
          setCurrentValue(null);
          nextTurn();
          setPhase("spin");

          return;
        }

        setTimeLeft(timerSeconds);
        setPhase("guess");
      }, 850);
    }, 3000);
  }

  function pickLetter(letter: string) {
    if (phase !== "guess") return;
    if (usedLetters.includes(letter)) return;

    if (typeof currentValue !== "number") {
      return;
    }

    setUsedLetters((prev) => [...prev, letter]);

    let count = 0;

    const next = [...revealed];

    answer.split("").forEach((char, i) => {
      if (char === " ") return;

      if (normalizeArabic(char) === normalizeArabic(letter)) {
        next[i] = char;
        count++;
      }
    });

    setRevealed(next);

    const shielded = shieldActive;

    setShieldActive(false);
    setShieldNote("");

    if (count > 0) {
      const gained = count * currentValue;

      if (turn === "side1") {
        setScore1((score) => score + gained);
      } else {
        setScore2((score) => score + gained);
      }

      const solved = answer
        .split("")
        .every((char, i) => char === " " || next[i] !== "");

      if (solved) {
        finishRound(
          score1 + (turn === "side1" ? gained : 0),
          score2 + (turn === "side2" ? gained : 0),
        );
      }

      return;
    }

    if (shielded) {
      setShieldNote("الدرع حماكم، جربوا حرف ثاني");
      setTimeLeft(timerSeconds);
      return;
    }

    setCurrentValue(null);

    nextTurn();

    setPhase("spin");

    setTimeLeft(timerSeconds);
  }

  if (!answer) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه كلمات للعجلة</p>

        <button
          type="button"
          onClick={() => onRoundEnd("none")}
          className="btn-primary mt-4"
        >
          إنهاء الجولة
        </button>
      </div>
    );
  }

  const timerTextClass =
    timeLeft <= 5
      ? "animate-pulse text-red-300"
      : timeLeft <= 10
        ? "text-yellow-200"
        : "text-white/70";

  return (
    <>
      <GameLayout
        title="لف وخمن"
        side1={side1Name}
        side2={side2Name}
        side1Score={score1}
        side2Score={score2}
        turn={currentTeamName}
        turnSide={turn}

        currentRound={currentRound}
        game="wheel"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-black text-white/80">
              <span className="text-white/70">التصنيف:</span>

              <span>{category}</span>
            </div>
          </div>

          <div className="py-1 text-center text-base font-black md:text-lg">
            {phase === "result"
              ? `طلعت لك: ${formatValue(currentValue)}`
              : phase === "guess"
                ? `اختاروا حرف — الحرف بـ ${formatValue(currentValue)}`
                : phase === "celebrate"
                  ? "انتهت الجولة"
                  : "لف العجلة"}

            {phase === "guess" && timerEnabled && (
              <span className={`mr-3 font-black ${timerTextClass}`}>
                {timeLeft} ثانية
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {revealedWordGroups.map((word, wordIndex) => (
              <div
                key={wordIndex}
                className="flex max-w-full items-center gap-4"
              >
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {word.map((letter, i) => (
                    <div
                      key={`${wordIndex}-${i}`}
                      className="flex h-10 w-9 items-center justify-center rounded-xl bg-[#221a3f] text-xl font-black shadow-[0_3px_0_#140f29] sm:h-14 sm:w-14 sm:rounded-2xl sm:text-2xl"
                    >
                      {letter || ""}
                    </div>
                  ))}
                </div>

                {wordIndex < revealedWordGroups.length - 1 && (
                  <div className="hidden h-10 w-6 items-center justify-center md:flex">
                    <div className="h-1 w-6 rounded-full bg-white/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {revealedWordGroups.length > 1 && (
            <p className="text-sm text-white/55">
              الكلمة مكوّنة من {revealedWordGroups.length} كلمات
            </p>
          )}

          <div className="mt-2">
            {(phase === "spin" || phase === "result") && (
              <div className="flex flex-col items-center">
                <div className="relative h-[300px] w-[300px] max-w-full md:h-[350px] md:w-[350px]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 40 34"
                    className={`absolute left-1/2 top-0 z-30 w-11 -translate-x-1/2 -translate-y-3 transition-transform duration-150 ${
                      wheelGlow ? "scale-110" : ""
                    }`}
                  >
                    <path
                      d="M4 3 H36 L20 31 Z"
                      fill="#ffc23d"
                      stroke="#241339"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div
                    className="h-full w-full rounded-full shadow-[0_10px_0_#0b0818]"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition:
                        "transform 3s cubic-bezier(0.08, 0.9, 0.2, 1)",
                    }}
                  >
                    <svg viewBox="0 0 200 200" className="h-full w-full">
                      <circle cx="100" cy="100" r="96" fill="#241339" />

                      {SEGMENTS.map((segment, i) => {
                        const { start, end } = segmentArcs[i];
                        const r = 91;
                        const toXY = (deg: number) => {
                          const rad = ((deg - 90) * Math.PI) / 180;
                          return [
                            100 + r * Math.cos(rad),
                            100 + r * Math.sin(rad),
                          ];
                        };
                        const [x1, y1] = toXY(start);
                        const [x2, y2] = toXY(end);
                        const large = end - start > 180 ? 1 : 0;
                        const mid = (start + end) / 2;
                        const isActive = activeSegmentIndex === i;
                        const narrow = end - start < 30;

                        return (
                          <g key={`${segment.label}-${i}`}>
                            <path
                              d={`M100 100 L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                              fill={segment.color}
                              stroke="#241339"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                              style={{
                                filter: isActive
                                  ? "brightness(1.15)"
                                  : undefined,
                              }}
                            />
                            {narrow ? (
                              <text
                                x="100"
                                y="100"
                                transform={`rotate(${mid} 100 100) translate(0 -58) rotate(-90 100 100)`}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={segment.text}
                                fontSize="8"
                                fontWeight="900"
                                style={{ fontFamily: "inherit" }}
                              >
                                {segment.label}
                              </text>
                            ) : (
                              <text
                                x="100"
                                y="34"
                                transform={`rotate(${mid} 100 100)`}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={segment.text}
                                fontSize="12"
                                fontWeight="900"
                                style={{ fontFamily: "inherit" }}
                              >
                                {segment.label}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      <circle
                        cx="100"
                        cy="100"
                        r="19"
                        fill="#241339"
                        stroke="#ffc23d"
                        strokeWidth="3"
                      />
                      <rect
                        x="94"
                        y="94"
                        width="12"
                        height="12"
                        rx="2"
                        fill="#ffc23d"
                      />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={spinWheel}
                  disabled={phase !== "spin" || spinning}
                  className="btn-primary mt-5 min-w-[170px] disabled:opacity-50"
                >
                  {spinning ? "العجلة تدور..." : "لف العجلة"}
                </button>
              </div>
            )}

            {phase === "guess" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  {LETTER_ROWS.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
                    >
                      {row.split("").map((letter) => {
                        const isUsed = usedLetters.includes(letter);

                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => pickLetter(letter)}
                            disabled={isUsed}
                            className={`h-11 min-w-[40px] rounded-xl border px-2 text-base font-bold transition sm:min-w-[44px] sm:px-3 ${
                              isUsed
                                ? "border-transparent bg-white/[0.04] text-white/25"
                                : "border-transparent bg-[#2a2150] text-white shadow-[0_3px_0_#160f2e] hover:bg-[#342a60] active:translate-y-[2px] active:shadow-none"
                            }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={activateShield}
                      disabled={activeShieldUsed && !shieldActive}
                      aria-pressed={shieldActive}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-right transition-[transform,box-shadow,background-color] duration-150 active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-40 ${
                        shieldActive
                          ? "bg-[#2f9bff] text-white shadow-[0_4px_0_#1662b8]"
                          : "bg-[#221a3f] text-white shadow-[0_4px_0_#140f29] ring-2 ring-[#2f9bff]/60"
                      }`}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-8 w-8 shrink-0"
                      >
                        <path
                          d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6Z"
                          fill={shieldActive ? "#ffffff" : "#2f9bff"}
                          stroke="#241339"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.5 12.2 11 14.6l4.6-5"
                          fill="none"
                          stroke={shieldActive ? "#2f9bff" : "#ffffff"}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="leading-tight">
                        <span
                          className={`block text-[11px] font-black ${
                            shieldActive ? "text-white/85" : "text-[#4aa8ff]"
                          }`}
                        >
                          وسيلة مساعدة
                        </span>
                        <span className="block text-base font-black">
                          {shieldActive
                            ? "الدرع شغّال"
                            : activeShieldUsed
                              ? "استخدمتوا الدرع"
                              : "الدرع"}
                        </span>
                      </span>
                    </button>
                  </div>

                  {(shieldActive || shieldNote) && (
                    <p className="text-sm font-bold text-white/60">
                      {shieldNote || "لو طلع الحرف غلط تجربون مرة ثانية"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {phase === "celebrate" && (
              <div className="mt-4">
                <div className="rounded-3xl border border-yellow-300/40 bg-yellow-400/15 px-6 py-8 shadow-2xl">
                  <p className="text-3xl font-black">{winnerName || "تعادل"}</p>

                  <p className="mt-2 text-lg text-white/85">
                    {winnerName
                      ? `أخذ الجولة بـ ${Math.max(score1, score2)} نقطة`
                      : `النقاط متساوية: ${score1}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GameLayout>
    </>
  );
}

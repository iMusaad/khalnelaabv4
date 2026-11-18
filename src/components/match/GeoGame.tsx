"use client";

import { useEffect, useState, type MouseEvent } from "react";

import GameLayout from "@/components/match/GameLayout";
import { GEO_CITIES, GEO_MAP, GEO_REGIONS } from "@/data/geoMap";
import { GEO_PLACES, type GeoPlace } from "@/data/geoPlaces";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import { TRIAL_LIMITS } from "@/lib/trial";
import type { WinnerType } from "@/types/game";

const PLACES_PER_ROUND = 3;

const TEAM_COLORS = { side1: "#ff5a5f", side2: "#2f9bff" } as const;

type TeamSide = "side1" | "side2";

type Phase = "first" | "second" | "revealed";

type Point = { lat: number; lon: number };

const placeDeck = createDeck(GEO_PLACES, "geo");

const trialPlaceDeck = createDeck(
  GEO_PLACES.slice(0, TRIAL_LIMITS.geo),
  "geo-trial",
);

type GeoRoundState = {
  rounds: GeoPlace[];
  index: number;
  phase: Phase;
  guesses: Record<TeamSide, Point | null>;
  side1Score: number;
  side2Score: number;
};

const EMPTY_GUESSES: Record<TeamSide, Point | null> = {
  side1: null,
  side2: null,
};

function toMap({ lat, lon }: Point) {
  return {
    x: (lon - GEO_MAP.lonMin) * GEO_MAP.cosLat * GEO_MAP.scale,
    y: (GEO_MAP.latMax - lat) * GEO_MAP.scale,
  };
}

function fromMap(x: number, y: number): Point {
  return {
    lon: x / (GEO_MAP.cosLat * GEO_MAP.scale) + GEO_MAP.lonMin,
    lat: GEO_MAP.latMax - y / GEO_MAP.scale,
  };
}

function distanceKm(a: Point, b: Point) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export default function GeoGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
  trial = false,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  currentRound?: number;
  trial?: boolean;
}) {
  const [rounds, setRounds] = useState<GeoPlace[]>([]);

  const [index, setIndex] = useState(0);

  const [phase, setPhase] = useState<Phase>("first");

  const [guesses, setGuesses] = useState(EMPTY_GUESSES);

  const [side1Score, setSide1Score] = useState(0);

  const [side2Score, setSide2Score] = useState(0);

  const [loaded, setLoaded] = useState(false);

  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomed(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  useEffect(() => {
    setLoaded(true);

    const saved = readRoundState<GeoRoundState>("geo", roundKey);

    if (saved && saved.rounds.length > 0 && saved.guesses) {
      setRounds(saved.rounds);
      setIndex(saved.index);
      setPhase(saved.phase);
      setGuesses(saved.guesses);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      return;
    }

    setRounds((trial ? trialPlaceDeck : placeDeck).draw(PLACES_PER_ROUND));
    setIndex(0);
    setPhase("first");
    setGuesses(EMPTY_GUESSES);
    setSide1Score(0);
    setSide2Score(0);
  }, [roundKey, trial]);

  useEffect(() => {
    if (!loaded || rounds.length === 0) {
      return;
    }

    writeRoundState<GeoRoundState>("geo", roundKey, {
      rounds,
      index,
      phase,
      guesses,
      side1Score,
      side2Score,
    });
  }, [loaded, roundKey, rounds, index, phase, guesses, side1Score, side2Score]);

  const current = rounds[index];

  const firstSide: TeamSide = index % 2 === 0 ? "side1" : "side2";
  const secondSide: TeamSide = firstSide === "side1" ? "side2" : "side1";
  const activeSide: TeamSide = phase === "second" ? secondSide : firstSide;

  const names: Record<TeamSide, string> = {
    side1: side1Name || "فريق 1",
    side2: side2Name || "فريق 2",
  };

  const distances =
    phase === "revealed" && current && guesses.side1 && guesses.side2
      ? {
          side1: distanceKm(guesses.side1, current),
          side2: distanceKm(guesses.side2, current),
        }
      : null;

  const photoWinner: WinnerType | null = distances
    ? Math.abs(distances.side1 - distances.side2) < 1
      ? "none"
      : distances.side1 < distances.side2
        ? "side1"
        : "side2"
    : null;

  function placePin(event: MouseEvent<SVGSVGElement>) {
    if (phase === "revealed") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * GEO_MAP.width;
    const y = ((event.clientY - rect.top) / rect.height) * GEO_MAP.height;

    setGuesses((previous) => ({ ...previous, [activeSide]: fromMap(x, y) }));
  }

  function confirmPin() {
    setPhase(phase === "first" ? "second" : "revealed");
  }

  function next() {
    const next1 = side1Score + (photoWinner === "side1" ? 1 : 0);
    const next2 = side2Score + (photoWinner === "side2" ? 1 : 0);

    setSide1Score(next1);
    setSide2Score(next2);

    if (index + 1 >= rounds.length) {
      onRoundEnd(next1 > next2 ? "side1" : next2 > next1 ? "side2" : "none");
      return;
    }

    setIndex((value) => value + 1);
    setPhase("first");
    setGuesses(EMPTY_GUESSES);
  }

  if (!current) {
    if (!loaded) return null;

    return (
      <div className="text-center text-white">
        <p>ما فيه أماكن كافية</p>

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

  const answerPoint = toMap(current);

  const visiblePins = (["side1", "side2"] as TeamSide[]).filter(
    (side) => guesses[side] && (phase === "revealed" || side === activeSide),
  );

  return (
    <GameLayout
      title="ثبّت الموقع"
      side1={names.side1}
      side2={names.side2}
      side1Score={side1Score}
      side2Score={side2Score}
      turn={phase === "revealed" ? names[firstSide] : names[activeSide]}
      turnSide={phase === "revealed" ? firstSide : activeSide}
      currentRound={currentRound}
      game="geo"
    >
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm font-bold text-white/50">
          الصورة {index + 1} من {rounds.length}
          {phase !== "revealed" && (
            <>
              {" · "}
              <span
                className="font-black"
                style={{ color: TEAM_COLORS[activeSide] }}
              >
                {names[activeSide]}
              </span>{" "}
              حطوا دبوسكم
              {phase === "second" && " (دبوس الفريق الأول مخفي)"}
            </>
          )}
        </p>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-3 md:grid-cols-[2fr_3fr]">
          <div>
            <figure className="overflow-hidden rounded-3xl bg-black shadow-[0_6px_0_#0b0818]">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label="كبّر الصورة"
                className="block w-full cursor-zoom-in"
              >
                <img
                  src={current.image}
                  alt={phase === "revealed" ? current.place : ""}
                  draggable={false}
                  className="aspect-[4/3] w-full select-none object-cover"
                />
              </button>
            </figure>

            <button
              type="button"
              onClick={() => setZoomed(true)}
              className="btn-secondary mx-auto mt-3 flex items-center gap-2 px-5 py-2 text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
              كبّر الصورة
            </button>
          </div>

          <div className="rounded-3xl bg-[#221a3f] p-2 shadow-[0_6px_0_#140f29]">
            <svg
              viewBox={`0 0 ${GEO_MAP.width} ${GEO_MAP.height}`}
              onClick={placePin}
              role="img"
              direction="ltr"
              aria-label="خريطة السعودية، اضغطوا لتحطون الدبوس"
              className={`block h-auto w-full ${
                phase === "revealed" ? "" : "cursor-crosshair"
              }`}
            >
              {GEO_REGIONS.map((region, regionIndex) => (
                <path
                  key={region.name}
                  d={region.path}
                  fill={regionIndex % 2 === 0 ? "#2b2252" : "#33295f"}
                  stroke="#6b5fa6"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ))}

              <path
                d={GEO_MAP.path}
                fill="none"
                stroke="#8a7fc4"
                strokeWidth={4}
                strokeLinejoin="round"
                className="pointer-events-none"
              />

              {GEO_CITIES.map((city) => {
                const point = toMap(city);

                return (
                  <g key={city.name} className="pointer-events-none">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={5}
                      fill="rgba(255,255,255,0.5)"
                    />
                    <text
                      x={point.x + city.dx}
                      y={point.y + city.dy}
                      textAnchor={city.anchor}
                      fontSize={22}
                      fontWeight={800}
                      fill="rgba(255,255,255,0.5)"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {phase === "revealed" &&
                visiblePins.map((side) => {
                  const point = toMap(guesses[side] as Point);

                  return (
                    <line
                      key={`line-${side}`}
                      x1={point.x}
                      y1={point.y}
                      x2={answerPoint.x}
                      y2={answerPoint.y}
                      stroke={TEAM_COLORS[side]}
                      strokeWidth={4}
                      strokeDasharray="12 10"
                    />
                  );
                })}

              {phase === "revealed" && (
                <circle
                  cx={answerPoint.x}
                  cy={answerPoint.y}
                  r={16}
                  fill="#3ddc84"
                  stroke="#130e28"
                  strokeWidth={5}
                />
              )}

              {visiblePins.map((side) => {
                const point = toMap(guesses[side] as Point);

                return (
                  <circle
                    key={`pin-${side}`}
                    cx={point.x}
                    cy={point.y}
                    r={16}
                    fill={TEAM_COLORS[side]}
                    stroke="#ffffff"
                    strokeWidth={5}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {distances && (
          <div className="animate-fade-in-up text-center">
            <p className="text-2xl font-black text-white sm:text-3xl">
              {current.place}
            </p>

            <p className="mt-1 text-sm font-bold text-white/60">
              {current.region}
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-black">
              {(["side1", "side2"] as TeamSide[]).map((side) => (
                <span key={side} style={{ color: TEAM_COLORS[side] }}>
                  {names[side]}: {Math.round(distances[side])} كم
                </span>
              ))}
            </div>

            <p className="mt-2 text-lg font-black text-[#ffc23d]">
              {photoWinner === "none"
                ? "تعادل!"
                : `${names[photoWinner as TeamSide]} أقرب وياخذ النقطة`}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          {phase !== "revealed" ? (
            <button
              type="button"
              onClick={confirmPin}
              disabled={!guesses[activeSide]}
              className="btn-primary min-w-[180px] disabled:opacity-50"
            >
              ثبّتوا الدبوس
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="btn-primary min-w-[180px]"
            >
              {index + 1 >= rounds.length ? "إنهاء الجولة" : "الصورة الجاية"}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] font-bold text-white/30">
          الصورة: {current.author} · {current.license}
        </p>

        {zoomed && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="الصورة بالشاشة كاملة"
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-black/95 p-2 sm:p-6"
          >
            <img
              src={current.image}
              alt={phase === "revealed" ? current.place : ""}
              draggable={false}
              className="max-h-full max-w-full select-none rounded-2xl object-contain"
            />

            <button
              type="button"
              onClick={() => setZoomed(false)}
              className="btn-primary absolute bottom-5 left-1/2 -translate-x-1/2 px-8 py-2.5"
            >
              رجوع
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}

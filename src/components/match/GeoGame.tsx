"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";

import GameLayout from "@/components/match/GameLayout";
import { GEO_MAP } from "@/data/geoMap";
import { GEO_PLACES, type GeoPlace } from "@/data/geoPlaces";
import { createDeck } from "@/lib/deck";
import { readRoundState, writeRoundState } from "@/lib/roundState";
import type { WinnerType } from "@/types/game";

const PLACES_PER_ROUND = 4;

const SCORE_STEPS = [
  { km: 50, points: 5 },
  { km: 150, points: 4 },
  { km: 300, points: 3 },
  { km: 500, points: 2 },
  { km: 800, points: 1 },
];

const LANDMARKS = [
  { name: "الرياض", lat: 24.71, lon: 46.68 },
  { name: "جدة", lat: 21.49, lon: 39.19 },
  { name: "الدمام", lat: 26.43, lon: 50.1 },
];

type TeamSide = "side1" | "side2";

type Point = { lat: number; lon: number };

const placeDeck = createDeck(GEO_PLACES);

type GeoRoundState = {
  rounds: GeoPlace[];
  index: number;
  guess: Point | null;
  revealed: boolean;
  side1Score: number;
  side2Score: number;
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

function pointsFor(km: number) {
  return SCORE_STEPS.find((step) => km <= step.km)?.points ?? 0;
}

function pointsLabel(points: number) {
  if (points === 0) return "ولا نقطة";
  if (points === 1) return "نقطة";
  if (points === 2) return "نقطتين";

  return `${points} نقاط`;
}

export default function GeoGame({
  side1Name,
  side2Name,
  onRoundEnd,
  roundKey,
  currentRound = 1,
}: {
  side1Name: string;
  side2Name: string;
  onRoundEnd: (winner?: WinnerType) => void;
  roundKey: number;
  currentRound?: number;
}) {
  const [rounds, setRounds] = useState<GeoPlace[]>([]);

  const [index, setIndex] = useState(0);

  const [guess, setGuess] = useState<Point | null>(null);

  const [revealed, setRevealed] = useState(false);

  const [side1Score, setSide1Score] = useState(0);

  const [side2Score, setSide2Score] = useState(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const saved = readRoundState<GeoRoundState>("geo", roundKey);

    if (saved && saved.rounds.length > 0) {
      setRounds(saved.rounds);
      setIndex(saved.index);
      setGuess(saved.guess);
      setRevealed(saved.revealed);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      return;
    }

    setRounds(placeDeck.draw(PLACES_PER_ROUND));
    setIndex(0);
    setGuess(null);
    setRevealed(false);
    setSide1Score(0);
    setSide2Score(0);
  }, [roundKey]);

  useEffect(() => {
    if (!loaded || rounds.length === 0) {
      return;
    }

    writeRoundState<GeoRoundState>("geo", roundKey, {
      rounds,
      index,
      guess,
      revealed,
      side1Score,
      side2Score,
    });
  }, [
    loaded,
    roundKey,
    rounds,
    index,
    guess,
    revealed,
    side1Score,
    side2Score,
  ]);

  const current = rounds[index];

  const activeSide: TeamSide = useMemo(
    () => (index % 2 === 0 ? "side1" : "side2"),
    [index],
  );

  const activeTeamName =
    activeSide === "side1" ? side1Name || "فريق 1" : side2Name || "فريق 2";

  const km = current && guess ? distanceKm(guess, current) : null;

  const earned = km === null ? 0 : pointsFor(km);

  function placePin(event: MouseEvent<SVGSVGElement>) {
    if (revealed) {
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * GEO_MAP.width;
    const y = ((event.clientY - rect.top) / rect.height) * GEO_MAP.height;

    setGuess(fromMap(x, y));
  }

  function next() {
    const next1 = side1Score + (activeSide === "side1" ? earned : 0);
    const next2 = side2Score + (activeSide === "side2" ? earned : 0);

    setSide1Score(next1);
    setSide2Score(next2);

    if (index + 1 >= rounds.length) {
      onRoundEnd(next1 > next2 ? "side1" : next2 > next1 ? "side2" : "none");
      return;
    }

    setIndex((value) => value + 1);
    setGuess(null);
    setRevealed(false);
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

  const guessPoint = guess ? toMap(guess) : null;
  const answerPoint = toMap(current);

  return (
    <GameLayout
      title="وين هذا؟"
      side1={side1Name || "فريق 1"}
      side2={side2Name || "فريق 2"}
      side1Score={side1Score}
      side2Score={side2Score}
      turn={activeTeamName}
      turnSide={activeSide}
      currentRound={currentRound}
      game="geo"
    >
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm font-bold text-white/50">
          الصورة {index + 1} من {rounds.length}
          {!revealed && " · حطوا الدبوس على الخريطة"}
        </p>

        <div className="mx-auto grid w-full max-w-4xl items-start gap-3 md:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl bg-black shadow-[0_6px_0_#0b0818]">
            <img
              src={current.image}
              alt={revealed ? current.place : ""}
              draggable={false}
              className="aspect-[4/3] w-full select-none object-cover"
            />
          </figure>

          <div className="rounded-3xl bg-[#221a3f] p-2 shadow-[0_6px_0_#140f29]">
            <svg
              viewBox={`0 0 ${GEO_MAP.width} ${GEO_MAP.height}`}
              onClick={placePin}
              role="img"
              aria-label="خريطة السعودية، اضغطوا لتحطون الدبوس"
              className={`block h-auto w-full ${revealed ? "" : "cursor-crosshair"}`}
            >
              <path
                d={GEO_MAP.path}
                fill="#2b2252"
                stroke="#6b5fa6"
                strokeWidth={3}
                strokeLinejoin="round"
              />

              {LANDMARKS.map((city) => {
                const point = toMap(city);

                return (
                  <g key={city.name} className="pointer-events-none">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={7}
                      fill="rgba(255,255,255,0.45)"
                    />
                    <text
                      x={point.x}
                      y={point.y - 16}
                      textAnchor="middle"
                      fontSize={30}
                      fontWeight={800}
                      fill="rgba(255,255,255,0.45)"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {revealed && guessPoint && (
                <line
                  x1={guessPoint.x}
                  y1={guessPoint.y}
                  x2={answerPoint.x}
                  y2={answerPoint.y}
                  stroke="#ffc23d"
                  strokeWidth={4}
                  strokeDasharray="12 10"
                />
              )}

              {revealed && (
                <circle
                  cx={answerPoint.x}
                  cy={answerPoint.y}
                  r={16}
                  fill="#3ddc84"
                  stroke="#130e28"
                  strokeWidth={5}
                />
              )}

              {guessPoint && (
                <circle
                  cx={guessPoint.x}
                  cy={guessPoint.y}
                  r={16}
                  fill={activeSide === "side1" ? "#ff5a5f" : "#2f9bff"}
                  stroke="#ffffff"
                  strokeWidth={5}
                />
              )}
            </svg>
          </div>
        </div>

        {revealed && km !== null && (
          <div className="animate-fade-in-up text-center">
            <p className="text-2xl font-black text-white sm:text-3xl">
              {current.place}
            </p>

            <p className="mt-1 text-sm font-bold text-white/60">
              {current.region} · بعدتوا {Math.round(km)} كم ·{" "}
              <span className="font-black text-[#ffc23d]">
                {pointsLabel(earned)}
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-center">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={!guess}
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
      </div>
    </GameLayout>
  );
}

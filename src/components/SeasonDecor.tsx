import PixelArt from "@/components/PixelArt";
import type { Season } from "@/lib/season";

const CRESCENT = [
  "....yyyy..",
  "..yyyy....",
  ".yyyy.....",
  "yyyy......",
  "yyyy......",
  "yyyy......",
  "yyyy......",
  ".yyyy.....",
  "..yyyy....",
  "....yyyy..",
];

const LANTERN = [
  "...kk...",
  "..kkkk..",
  ".kkkkkk.",
  ".kyyyyk.",
  "kyowwoyk",
  "kyowwoyk",
  "kyooooyk",
  ".kyyyyk.",
  ".kkkkkk.",
  "..kkkk..",
  "...kk...",
];

const STAR = [".y.", "yyy", ".y."];

const PALM = [
  "..gg...gg..",
  ".ggggggggg.",
  "gg..ggg..gg",
  "g...bbb...g",
  ".....b.....",
  ".....b.....",
  ".....b.....",
  ".....b.....",
  "....bbb....",
];

const SADU_TILE = [
  "rrrrrrrrrrrr",
  "kkwkkkkkkwkk",
  "kwwwkkkkwwwk",
  "wwrwwkkwwrww",
  "kwwwkkkkwwwk",
  "kkwkkkkkkwkk",
  "rrrrrrrrrrrr",
];

export default function SeasonDecor({ season }: { season: Season }) {
  if (season === "ramadan") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <PixelArt
          rows={CRESCENT}
          colors={{ y: "#ffd36b" }}
          size={9}
          className="absolute right-[6%] top-10 sm:right-[12%] sm:top-12"
        />
        <PixelArt
          rows={LANTERN}
          colors={{ k: "#ffd36b", y: "#f0a92b", o: "#ff8a1e", w: "#fff3c4" }}
          size={7}
          className="absolute left-[8%] top-28 hidden sm:block"
        />
        {[
          ["left-[20%] top-10", 5],
          ["left-[38%] top-20", 4],
          ["right-[30%] top-8", 4],
          ["right-[22%] top-44", 5],
          ["left-[12%] top-56", 4],
          ["right-[8%] top-64", 4],
        ].map(([pos, size], index) => (
          <PixelArt
            key={index}
            rows={STAR}
            colors={{ y: "#fff3c4" }}
            size={size as number}
            className={`absolute ${pos}`}
          />
        ))}
      </div>
    );
  }

  if (season === "founding") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 flex overflow-hidden">
          {Array.from({ length: 40 }).map((_, index) => (
            <PixelArt
              key={index}
              rows={SADU_TILE}
              colors={{ r: "#b3261e", k: "#2b1a12", w: "#f6e7c8" }}
              size={6}
              className="shrink-0"
            />
          ))}
        </div>
        <PixelArt
          rows={PALM}
          colors={{ g: "#8fae5a", b: "#d9b27c" }}
          size={9}
          className="absolute left-[6%] top-28 hidden sm:block"
        />
        <PixelArt
          rows={PALM}
          colors={{ g: "#8fae5a", b: "#d9b27c" }}
          size={9}
          className="absolute right-[6%] top-28 hidden sm:block"
        />
      </div>
    );
  }

  if (season === "national") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <PixelArt
          rows={PALM}
          colors={{ g: "#7ed957", b: "#c8a36a" }}
          size={9}
          className="absolute left-[6%] top-24 hidden sm:block"
        />
        <PixelArt
          rows={PALM}
          colors={{ g: "#7ed957", b: "#c8a36a" }}
          size={9}
          className="absolute right-[6%] top-24 hidden sm:block"
        />
        <PixelArt
          rows={PALM}
          colors={{ g: "#7ed957", b: "#c8a36a" }}
          size={5}
          className="absolute right-[6%] top-6 sm:hidden"
        />
      </div>
    );
  }

  return null;
}

import Image from "next/image";
import type { ReactNode } from "react";
import SeasonDecor from "@/components/SeasonDecor";
import { SEASON_THEMES, type Season } from "@/lib/season";

const PIXELS = [
  1, 2, 1, 0, 1, 2, 3, 2, 1, 1, 0, 1, 2, 1, 0, 0, 1, 2, 2, 1, 0, 1, 3, 2, 1, 0,
  1, 1, 2, 1,
];

export default function PixelHero({
  children,
  action,
  overlap = true,
  season = "default",
  logo = true,
  compact = false,
}: {
  children: ReactNode;
  action?: ReactNode;
  overlap?: boolean;
  season?: Season;
  logo?: boolean;
  compact?: boolean;
}) {
  const theme = SEASON_THEMES[season];

  return (
    <section
      className={`relative overflow-hidden px-4 text-center ${
        season === "founding" ? "pt-16" : "pt-6"
      } ${overlap ? "pb-36" : compact ? "pb-16" : logo ? "pb-28" : "pb-24"}`}
      style={{ background: theme.heroBg, color: theme.heroText }}
    >
      <SeasonDecor season={season} />

      {action && (
        <div
          className={`relative z-10 mb-4 flex justify-center sm:absolute sm:left-4 sm:mb-0 ${
            season === "founding" ? "sm:top-14" : "sm:top-4"
          }`}
        >
          {action}
        </div>
      )}

      {logo && (
        <Image
          src="/logo.png"
          alt="خل نلعب"
          width={280}
          height={200}
          priority
          className="relative mx-auto h-auto w-[170px] [filter:drop-shadow(3px_0_0_#241339)_drop-shadow(-3px_0_0_#241339)_drop-shadow(0_3px_0_#241339)_drop-shadow(0_-3px_0_#241339)_drop-shadow(0_6px_0_#241339)] sm:w-[200px]"
        />
      )}

      {theme.badge && (
        <p
          className="relative mx-auto mt-4 w-fit rounded-lg px-3 py-1 text-sm font-black"
          style={{ background: theme.badgeBg, color: theme.badgeText }}
        >
          {theme.badge}
        </p>
      )}

      <div className="relative">{children}</div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 flex items-end"
      >
        {PIXELS.map((height, index) => (
          <div
            key={index}
            className="flex-1 bg-[#130e28]"
            style={{
              height: compact
                ? `${10 + height * 10}px`
                : `${16 + height * 20}px`,
            }}
          />
        ))}
      </div>
    </section>
  );
}

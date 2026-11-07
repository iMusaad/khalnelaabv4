import Image from "next/image";
import type { ReactNode } from "react";

const PIXELS = [
  1, 2, 1, 0, 1, 2, 3, 2, 1, 1, 0, 1, 2, 1, 0, 0, 1, 2, 2, 1, 0, 1, 3, 2, 1, 0,
  1, 1, 2, 1,
];

export default function PixelHero({
  children,
  action,
  overlap = true,
}: {
  children: ReactNode;
  action?: ReactNode;
  overlap?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-[#ffb21e] px-4 pt-6 text-center text-[#241339] ${
        overlap ? "pb-36" : "pb-28"
      }`}
    >
      {action && (
        <div className="mb-4 flex justify-center sm:absolute sm:left-4 sm:top-4 sm:mb-0">
          {action}
        </div>
      )}

      <Image
        src="/logo.png"
        alt="خل نلعب"
        width={280}
        height={200}
        priority
        className="mx-auto h-auto w-[150px] drop-shadow-[0_5px_0_#241339] sm:w-[180px]"
      />

      {children}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 flex items-end"
      >
        {PIXELS.map((height, index) => (
          <div
            key={index}
            className="flex-1 bg-[#130e28]"
            style={{ height: `${16 + height * 20}px` }}
          />
        ))}
      </div>
    </section>
  );
}

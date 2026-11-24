"use client";

import { useEffect, useState } from "react";

export default function ElapsedTimer({
  className = "text-sm",
}: {
  className?: string;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const color =
    seconds >= 30
      ? "text-red-300"
      : seconds >= 15
        ? "text-yellow-300"
        : "text-white/70";

  return (
    <span className={`font-black tabular-nums ${color} ${className}`}>
      {seconds} ثانية
    </span>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

export default function HomeLogoLink({
  onClick,
}: {
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href="/"
      prefetch
      onClick={onClick}
      aria-label="الرجوع للرئيسية"
      className="group fixed right-3 top-2 z-[60] flex flex-col items-center rounded-xl outline-none transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/70 sm:right-4 sm:top-3"
    >
      <Image
        src="/logo.png"
        alt=""
        width={280}
        height={200}
        priority
        className="h-auto w-[60px] [filter:drop-shadow(2px_0_0_#241339)_drop-shadow(-2px_0_0_#241339)_drop-shadow(0_2px_0_#241339)_drop-shadow(0_-2px_0_#241339)_drop-shadow(0_4px_0_#241339)] sm:w-[76px]"
      />

      <span className="-mt-1 text-xs font-black text-white [text-shadow:0_2px_0_#241339,1px_0_0_#241339,-1px_0_0_#241339,0_-1px_0_#241339] group-hover:underline sm:text-sm">
        الرئيسية
      </span>
    </Link>
  );
}

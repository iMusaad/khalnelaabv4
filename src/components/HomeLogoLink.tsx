import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import HomeIcon from "@/components/HomeIcon";

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
      className="fixed right-3 top-3 z-[60] flex items-center gap-2 rounded-2xl bg-[#241339] py-1.5 pl-3 pr-1.5 text-white shadow-[0_4px_0_#0e0a1f] outline-none transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/70 sm:right-4 sm:top-4"
    >
      <Image
        src="/logo.png"
        alt=""
        width={280}
        height={200}
        priority
        className="h-auto w-[40px] sm:w-[46px]"
      />

      <span className="flex items-center gap-1 text-sm font-black">
        <HomeIcon />
        الرئيسية
      </span>
    </Link>
  );
}

import Link from "next/link";
import { SITE } from "@/data/site";

const LINKS = [
  { href: "/buy", label: "الأسعار" },
  { href: "/terms", label: "الشروط والاسترجاع" },
  { href: "/privacy", label: "الخصوصية" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/unlock", label: "عندي كود" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 pb-4 pt-4 text-center">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-white/55">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <a
        href={SITE.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white/55 transition-colors hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
        </svg>
        <bdi dir="ltr">@khalnelab</bdi>
      </a>

      <p className="mt-2 text-xs font-bold text-white/35">
        © {new Date().getFullYear()} خل نلعب
        {SITE.freelanceNumber && (
          <>
            {" "}
            · وثيقة عمل حر رقم <bdi>{SITE.freelanceNumber}</bdi>
          </>
        )}
      </p>
    </footer>
  );
}

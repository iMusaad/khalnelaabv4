import Image from "next/image";
import { notFound } from "next/navigation";

import { CLUBS, CLUBS_FACTS_AS_OF } from "@/data/clubs";

function titlesLabel(count: number) {
  if (count === 0) return "ما فاز فيه";
  if (count === 1) return "مرة وحدة";
  if (count === 2) return "مرتين";
  if (count <= 10) return `${count} مرات`;

  return `${count} مرة`;
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const club = CLUBS.find((item) => item.id === id);

  if (!club) {
    notFound();
  }

  const factRows = [
    { label: "الدولة", value: club.country },
    { label: "المدينة", value: club.city },
    { label: "الدوري", value: club.league },
    { label: "سنة التأسيس", value: String(club.founded) },
    { label: "الألوان", value: club.colors },
    { label: "بطولات الدوري", value: titlesLabel(club.leagueTitles) },
    { label: "البطولات القارية", value: club.continental },
    { label: "أشهر لاعب لعب معهم", value: club.famousPlayer },
  ];

  return (
    <main
      className="
        flex
        min-h-[100dvh]
        items-center
        justify-center
        px-5
        py-8
        text-white
      "
      dir="rtl"
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          text-center
          shadow-2xl
        "
      >
        <p className="text-sm font-black text-cyan-300/70">خل نلعب</p>

        <h1 className="mt-2 text-2xl font-black">وش ناديك؟ ⚽</h1>

        <p className="mt-2 text-sm font-bold text-white/55">
          هذا النادي اللي لازم الفريق الثاني يخمنه
        </p>

        <div
          className="
            mx-auto
            mt-6
            overflow-hidden
            rounded-2xl
            bg-white
            p-4
          "
        >
          <Image
            src={club.crest}
            alt="شعار النادي"
            width={512}
            height={512}
            priority
            sizes="(max-width: 480px) 90vw, 400px"
            className="
              aspect-square
              max-h-[220px]
              w-full
              object-contain
            "
          />
        </div>

        <div className="mt-5 text-right">
          <h2 className="text-center text-2xl font-black text-white">
            {club.nameAr}
          </h2>

          <p className="mt-1 text-center text-xs font-bold text-white/45">
            معلومات تساعدك تجاوب على أسئلتهم
          </p>

          <dl className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20">
            {factRows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 px-4 py-2.5"
              >
                <dt className="shrink-0 text-sm font-bold text-cyan-200/80">
                  {row.label}
                </dt>
                <dd className="text-left text-sm font-black text-white">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-2 text-center text-[11px] font-bold text-white/35">
            الأرقام حتى {CLUBS_FACTS_AS_OF}
          </p>
        </div>

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-yellow-300/15
            bg-yellow-300/[0.06]
            px-4
            py-3
          "
        >
          <p className="text-sm font-bold text-yellow-50/80">
            لا توريه الفريق الثاني 🤫
          </p>
        </div>
      </div>
    </main>
  );
}

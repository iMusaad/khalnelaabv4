import Image from "next/image";
import { notFound } from "next/navigation";

import { COUNTRIES } from "@/data/countries";
import { COUNTRY_FACTS } from "@/data/countryFacts";

export default async function CountryFlagPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const country = COUNTRIES.find((item) => item.id === id);

  if (!country) {
    notFound();
  }

  const facts = COUNTRY_FACTS[country.id];

  const factRows = facts
    ? [
        { label: "العاصمة", value: facts.capital },
        { label: "القارة", value: facts.continent },
        { label: "اللغة", value: facts.language },
        { label: "عدد السكان", value: facts.population },
        ...(facts.religion
          ? [{ label: "الديانة", value: facts.religion }]
          : []),
      ]
    : [];

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
          bg-[#1b1535]
          p-6
          text-center
          shadow-[0_8px_0_#0e0a1f]
        "
      >
        <p className="text-sm font-black text-white/45">خل نلعب</p>

        <h1 className="mt-2 text-2xl font-black">خمن العلم</h1>

        <p className="mt-2 text-sm font-bold text-white/55">
          هذا العلم اللي لازم الفريق الثاني يخمنه
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
            src={country.flag}
            alt="العلم"
            width={640}
            height={427}
            priority
            sizes="(max-width: 480px) 90vw, 400px"
            className="
              aspect-[4/3]
              w-full
              object-contain
            "
          />
        </div>

        {facts && (
          <div className="mt-5 text-right">
            <h2 className="text-center text-2xl font-black text-white">
              {country.nameAr}
            </h2>

            <p className="mt-1 text-center text-xs font-bold text-white/45">
              معلومات تساعدك تجاوب على أسئلتهم
            </p>

            <dl className="mt-3 divide-y divide-white/10 rounded-2xl bg-[#15102b]">
              {factRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                >
                  <dt className="shrink-0 text-sm font-bold text-white/55">
                    {row.label}
                  </dt>
                  <dd className="text-left text-sm font-black text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p className="mt-5 text-sm font-black text-[#ffb21e]">
          لا توريه الفريق الثاني
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PolicySection from "@/components/PolicySection";
import { CARS } from "@/data/cars";

export const metadata: Metadata = {
  title: "حقوق الصور | خل نلعب",
};

const LICENSE_URLS: Record<string, string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
  "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

export default function CreditsPage() {
  return (
    <PageShell title="حقوق الصور">
      <div className="space-y-3">
        <PolicySection title="صور «عينك عالموتر»">
          <p>
            صور السيارات من ويكيميديا كومنز، ونشكر أصحابها. غبّشنا فيها الشعارات
            وأسماء الموديلات واللوحات عشان اللعبة تصير أحلى، والصور المعدلة تحت
            نفس رخصة الصورة الأصلية.
          </p>

          <ul className="space-y-2 pt-1" dir="rtl">
            {CARS.map((car) => {
              const licenseUrl = LICENSE_URLS[car.license];

              return (
                <li
                  key={car.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <span className="font-black text-white">
                    {car.brand} {car.model}
                  </span>
                  {" — "}
                  <a
                    href={car.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-white/30 underline-offset-4 hover:text-white"
                  >
                    الصورة الأصلية
                  </a>
                  {" · "}
                  <span dir="ltr">{car.author}</span>
                  {" · "}
                  {licenseUrl ? (
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="underline decoration-white/30 underline-offset-4 hover:text-white"
                    >
                      {car.license}
                    </a>
                  ) : (
                    <span dir="ltr">{car.license}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </PolicySection>
      </div>
    </PageShell>
  );
}

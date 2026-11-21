"use client";

import { useCallback, useEffect, useState } from "react";
import { PLAYABLE_CARDS } from "@/data/quizCards";
import type { StatSummary } from "@/lib/sessionStats";

const TITLES = new Map(PLAYABLE_CARDS.map((card) => [card.key, card.title]));

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#15102b] p-4 text-center">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/55">{label}</p>
    </div>
  );
}

export default function AdminStats({ password }: { password: string }) {
  const [stats, setStats] = useState<StatSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json().catch(() => null)) as {
        stats?: StatSummary;
      } | null;

      if (response.ok && data?.stats) {
        setStats(data.stats);
      } else {
        setError("ما قدرنا نوصل للبيانات، جرّب بعد شوي");
      }
    } catch {
      setError("صار خطأ، جرّب مرة ثانية");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!stats) {
    return (
      <p className="py-8 text-center text-sm font-bold text-white/60">
        {error || "لحظة..."}
      </p>
    );
  }

  const completion = stats.starts
    ? Math.round((stats.finishes / stats.starts) * 100)
    : 0;
  const topCount = Math.max(1, ...stats.games.map((game) => game.count));
  const topDay = Math.max(1, ...stats.days.map((day) => day.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="اليوم" value={stats.today} />
        <Stat label="آخر ٧ أيام" value={stats.week} />
        <Stat label="كل الجلسات" value={stats.starts} />
        <Stat label="كمّلوها للنهاية" value={`${completion}%`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="مشترين" value={stats.paidStarts} />
        <Stat label="تجربة مجانية" value={stats.trialStarts} />
        <Stat label="تحدي الجلسة" value={stats.sessionStarts} />
        <Stat label="لعبة سريعة" value={stats.quickStarts} />
      </div>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">آخر ١٤ يوم</h2>
        <div className="mt-4 flex h-32 items-end gap-1.5" dir="ltr">
          {stats.days.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center justify-end gap-1"
              title={`${day.date}: ${day.count}`}
            >
              <span className="text-[10px] font-bold text-white/50">
                {day.count || ""}
              </span>
              <div
                className="w-full rounded-t-md bg-[#ffc23d]"
                style={{
                  height: Math.round((day.count / topDay) * 88),
                  minHeight: day.count ? 4 : 1,
                }}
              />
              <span className="text-[10px] font-bold text-white/40">
                {day.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">أكثر الألعاب اختيارًا</h2>
        <ul className="mt-4 space-y-2">
          {stats.games.map((game) => (
            <li key={game.key} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm font-bold text-white/80">
                {TITLES.get(game.key) ?? game.key}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#15102b]">
                <div
                  className="h-full rounded-full bg-[#2f9bff]"
                  style={{ width: `${(game.count / topCount) * 100}%` }}
                />
              </div>
              <span className="w-10 text-left text-sm font-black text-white">
                {game.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => void load()}
        disabled={loading}
        className="btn-secondary w-full py-3"
      >
        {loading ? "لحظة..." : "تحديث"}
      </button>
    </div>
  );
}

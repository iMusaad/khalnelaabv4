"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SOURCE_LABELS, sourceLabel } from "@/lib/attribution";
import { riyadhDate } from "@/lib/sessionStats";
import type { MoneySummary } from "@/lib/money";

const inputClass =
  "h-11 w-full rounded-xl bg-[#15102b] px-3 text-base font-bold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-[#ffc23d]";

const PLATFORMS = Object.keys(SOURCE_LABELS).filter(
  (key) => key !== "direct" && key !== "ref",
);

function cost(value: number) {
  return value ? `-${riyal(value)}` : "0";
}

function riyal(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Card({
  label,
  value,
  hint,
  tone = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#15102b] p-4 text-center">
      <p dir="ltr" className={`text-2xl font-black sm:text-3xl ${tone}`}>
        {value}
      </p>
      <p className="mt-1 text-sm font-bold text-white/55">{label}</p>
      {hint && <p className="mt-0.5 text-xs font-bold text-white/35">{hint}</p>}
    </div>
  );
}

function rate(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "-";
}

export default function AdminMoney({ password }: { password: string }) {
  const [money, setMoney] = useState<MoneySummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => riyadhDate());
  const [platform, setPlatform] = useState("tiktok");
  const [campaign, setCampaign] = useState("");
  const [amount, setAmount] = useState("");

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/money", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...payload }),
        });

        const data = (await response.json().catch(() => null)) as {
          money?: MoneySummary;
          error?: string;
        } | null;

        if (response.ok && data?.money) {
          setMoney(data.money);
          setError(data.error ?? "");
          return !data.error;
        }

        setError("ما قدرنا نوصل للبيانات، جرّب بعد شوي");
      } catch {
        setError("صار خطأ، جرّب مرة ثانية");
      } finally {
        setLoading(false);
      }

      return false;
    },
    [password],
  );

  useEffect(() => {
    void send({});
  }, [send]);

  async function handleSpend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = await send({
      action: "addSpend",
      spend: { date, platform, campaign, amount: Number(amount) },
    });

    if (ok) {
      setAmount("");
      setCampaign("");
    }
  }

  if (!money) {
    return (
      <p className="py-8 text-center text-sm font-bold text-white/60">
        {error || "لحظة..."}
      </p>
    );
  }

  const topDay = Math.max(1, ...money.days.map((day) => day.net));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card
          label="اليوم"
          value={`${riyal(money.today.net)}`}
          hint={`${money.today.sales} بيعة`}
        />
        <Card
          label="آخر ٧ أيام"
          value={`${riyal(money.week.net)}`}
          hint={`${money.week.sales} بيعة`}
        />
        <Card
          label="آخر ٣٠ يوم"
          value={`${riyal(money.month.net)}`}
          hint={`${money.month.sales} بيعة`}
        />
      </div>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">من البداية</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Card label="عدد البيعات" value={`${money.sales}`} />
          <Card label="الإجمالي" value={riyal(money.gross)} />
          <Card label="رسوم الدفع" value={cost(money.fees)} />
          <Card label="عمولات المسوّقين" value={cost(money.commissions)} />
          <Card label="صرف الإعلانات" value={cost(money.spend)} />
          <Card
            label="الربح بعد كل شي"
            value={riyal(money.profit)}
            tone={money.profit >= 0 ? "text-[#4ade80]" : "text-[#ff7a7f]"}
          />
        </div>
        <p className="mt-3 text-xs font-bold text-white/40">
          المبالغ بالريال. الصافي = الإجمالي ناقص رسوم الدفع وعمولات المسوّقين.
        </p>
      </section>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">الصافي آخر ٣٠ يوم</h2>
        <div className="mt-4 flex h-32 items-end gap-1" dir="ltr">
          {money.days.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center justify-end"
              title={`${day.date}: ${day.sales} بيعة، ${riyal(day.net)} ريال`}
            >
              <div
                className="w-full rounded-t-sm bg-[#4ade80]"
                style={{
                  height: Math.round((Math.max(0, day.net) / topDay) * 100),
                  minHeight: day.sales ? 4 : 1,
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="mt-1 flex justify-between text-[10px] font-bold text-white/40"
          dir="ltr"
        >
          <span>{money.days[0]?.date.slice(5)}</span>
          <span>{money.days.at(-1)?.date.slice(5)}</span>
        </div>
      </section>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">حسب المصدر</h2>
        <p className="mt-1 text-xs font-bold text-white/40">
          جلسات = لعبوا، شراء = فتحوا صفحة الشراء، دفع = بدأوا الدفع
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="text-xs font-black text-white/50">
              <tr>
                <th className="py-2">المصدر</th>
                <th>جلسات</th>
                <th>شراء</th>
                <th>دفع</th>
                <th>بيعات</th>
                <th>التحويل</th>
                <th>الصافي</th>
                <th>الصرف</th>
                <th>تكلفة العميل</th>
                <th>العائد</th>
              </tr>
            </thead>
            <tbody className="font-bold text-white/85">
              {money.sources.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-4 text-center text-white/40">
                    ما فيه بيانات للحين
                  </td>
                </tr>
              )}
              {money.sources.map((row) => (
                <tr key={row.source} className="border-t border-white/5">
                  <td className="py-2 font-black text-white">
                    {sourceLabel(row.source)}
                  </td>
                  <td>{row.sessions}</td>
                  <td>{row.buyViews}</td>
                  <td>{row.checkouts}</td>
                  <td>{row.sales}</td>
                  <td>{rate(row.sales, row.buyViews)}</td>
                  <td>{riyal(row.net)}</td>
                  <td>{row.spend ? riyal(row.spend) : "-"}</td>
                  <td>
                    {row.spend && row.sales
                      ? riyal(row.spend / row.sales)
                      : "-"}
                  </td>
                  <td
                    className={
                      row.spend
                        ? row.net >= row.spend
                          ? "text-[#4ade80]"
                          : "text-[#ff7a7f]"
                        : ""
                    }
                  >
                    {row.spend ? `${(row.net / row.spend).toFixed(1)}x` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs font-bold text-white/40">
          العائد = الصافي ÷ الصرف. فوق 1x يعني الإعلان جاب أكثر من اللي صرفته.
        </p>
      </section>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">صرف الإعلانات</h2>
        <form onSubmit={handleSpend} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            className={inputClass}
          >
            {PLATFORMS.map((key) => (
              <option key={key} value={key}>
                {sourceLabel(key)}
              </option>
            ))}
          </select>
          <input
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
            placeholder="اسم الحملة (اختياري)"
            className={inputClass}
          />
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="المبلغ بالريال"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-primary py-3 sm:col-span-4"
          >
            أضف الصرف
          </button>
        </form>
        <p className="min-h-[20px] pt-2 text-center text-sm font-bold text-[#ff7a7f]">
          {error}
        </p>
        <ul className="space-y-2">
          {money.spends.map((spend) => (
            <li
              key={spend.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#15102b] px-3 py-2 text-sm font-bold text-white/80"
            >
              <span>
                {spend.date} · {sourceLabel(spend.platform)}
                {spend.campaign ? ` · ${spend.campaign}` : ""}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-black text-white">
                  {riyal(spend.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("تحذف هذا الصرف؟")) {
                      void send({ action: "deleteSpend", id: spend.id });
                    }
                  }}
                  className="text-xs text-white/40 hover:text-[#ff7a7f]"
                >
                  حذف
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]">
        <h2 className="text-lg font-black text-white">آخر البيعات</h2>
        <ul className="mt-4 space-y-2">
          {money.recent.length === 0 && (
            <li className="text-center text-sm font-bold text-white/40">
              ما فيه بيعات للحين
            </li>
          )}
          {money.recent.map((sale) => (
            <li
              key={sale.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#15102b] px-3 py-2 text-sm font-bold text-white/80"
            >
              <span>
                {new Date(sale.at).toLocaleString("ar-SA-u-nu-latn", {
                  timeZone: "Asia/Riyadh",
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                · {sourceLabel(sale.source)}
                {sale.ref ? ` (${sale.ref})` : ""}
                {sale.campaign && !sale.ref ? ` · ${sale.campaign}` : ""}
              </span>
              <span className="font-black text-white">
                {riyal(sale.amount / 100)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => void send({})}
        disabled={loading}
        className="btn-secondary w-full py-3"
      >
        {loading ? "لحظة..." : "تحديث"}
      </button>
    </div>
  );
}

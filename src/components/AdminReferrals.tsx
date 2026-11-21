"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import CopyButton from "@/components/CopyButton";
import type { Referral } from "@/lib/referral";

const inputClass =
  "h-11 w-full rounded-xl bg-[#15102b] px-3 text-base font-bold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-[#ffc23d]";

export default function AdminReferrals({ password }: { password: string }) {
  const [referrals, setReferrals] = useState<Referral[] | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("5");
  const [commission, setCommission] = useState("10");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...payload }),
        });

        const data = (await response.json().catch(() => null)) as {
          referrals?: Referral[];
          error?: string;
        } | null;

        if (response.ok && data?.referrals) {
          setReferrals(data.referrals);
          setError(data.error ?? "");
          return Boolean(!data.error);
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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = await send({
      action: "create",
      code,
      name,
      discount: Number(discount),
      commission: Number(commission),
    });

    if (ok) {
      setCode("");
      setName("");
    }
  }

  const totalDue = (referrals ?? []).reduce(
    (sum, item) => sum + Math.max(0, item.earned - item.paid),
    0,
  );

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-2xl bg-[#221a3f] p-4 shadow-[0_5px_0_#140f29] sm:p-5"
      >
        <p className="text-base font-black text-white">كود مسوّق جديد</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-white/70">
              الكود
            </span>
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase().replace(/\s/g, ""))
              }
              placeholder="SAAD"
              dir="ltr"
              maxLength={16}
              required
              className={`${inputClass} text-center uppercase`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-white/70">
              اسم المسوّق
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثلاً: سعد، حساب سناب"
              maxLength={80}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-white/70">
              خصم المشتري (ريال)
            </span>
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              dir="ltr"
              className={`${inputClass} text-center`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-white/70">
              عمولة المسوّق لكل بيعة (ريال)
            </span>
            <input
              type="number"
              min={0}
              value={commission}
              onChange={(event) => setCommission(event.target.value)}
              dir="ltr"
              className={`${inputClass} text-center`}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !code}
          className="btn-primary w-full py-3"
        >
          سوّ الكود
        </button>
      </form>

      {error && (
        <p className="rounded-2xl bg-[#221a3f] p-4 text-center text-sm font-bold text-[#ff7a7f]">
          {error}
        </p>
      )}

      {referrals && referrals.length > 0 && (
        <>
          <p className="text-center text-sm font-black text-white/70">
            مستحق لكل المسوّقين: {totalDue} ريال
          </p>

          <ul className="space-y-2">
            {referrals.map((item) => {
              const due = Math.max(0, item.earned - item.paid);
              const link = `${origin}/?ref=${item.code}`;

              return (
                <li
                  key={item.code}
                  className="space-y-2 rounded-2xl bg-[#221a3f] p-4 text-right"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-black text-white">
                      <span dir="ltr" className="text-[#ffc23d]">
                        {item.code}
                      </span>
                      {item.name && (
                        <span className="ms-2 text-sm text-white/60">
                          {item.name}
                        </span>
                      )}
                    </p>

                    <p className="text-xs font-bold text-white/50">
                      خصم {item.discount} · عمولة {item.commission} ريال
                    </p>
                  </div>

                  <p className="text-sm font-bold text-white/80">
                    {item.sales} بيعة · المكتسب {item.earned} · المدفوع{" "}
                    {item.paid} ·{" "}
                    <span className={due > 0 ? "text-[#3ddc84]" : ""}>
                      المستحق {due} ريال
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton text={link} label="انسخ رابط المسوّق" />

                    {due > 0 && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          if (
                            window.confirm(
                              `تأكيد إنك حوّلت ${due} ريال لـ ${item.code}؟`,
                            )
                          ) {
                            void send({ action: "paid", code: item.code });
                          }
                        }}
                        className="btn-secondary px-3 py-2 text-sm"
                      >
                        سجّل إني دفعت له
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        if (window.confirm(`حذف الكود ${item.code}؟`)) {
                          void send({ action: "delete", code: item.code });
                        }
                      }}
                      className="ms-auto text-sm font-black text-[#ff7a7f] underline"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

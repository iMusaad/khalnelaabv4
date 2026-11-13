"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import CopyButton from "@/components/CopyButton";
import { formatGiftCode, giftStatus, type GiftCode } from "@/lib/giftStore";

const DURATIONS = [
  { days: 0, label: "بدون انتهاء" },
  { days: 7, label: "أسبوع" },
  { days: 30, label: "شهر" },
  { days: 365, label: "سنة" },
];

const USES = [
  { uses: 1, label: "شخص واحد" },
  { uses: 5, label: "5 أشخاص" },
  { uses: 0, label: "بدون حد" },
];

const STATUS = {
  active: { label: "شغال", className: "text-[#5ee08f]" },
  used: { label: "انستخدم", className: "text-white/45" },
  expired: { label: "منتهي", className: "text-[#ff7a7f]" },
};

const dateFormat = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });

function OptionGroup<T extends number>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-black text-white/70">
        {legend}
      </legend>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-2 text-sm font-black transition-colors ${
              value === option.value
                ? "bg-[#ffc23d] text-[#241339]"
                : "bg-[#15102b] text-white/65 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function AdminGifts({ password }: { password: string }) {
  const [gifts, setGifts] = useState<GiftCode[] | null>(null);
  const [created, setCreated] = useState<GiftCode | null>(null);
  const [days, setDays] = useState(0);
  const [uses, setUses] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...payload }),
        });

        const data = (await response.json().catch(() => null)) as {
          gifts?: GiftCode[];
          created?: GiftCode | null;
        } | null;

        if (response.ok && data?.gifts) {
          setGifts(data.gifts);

          if (data.created) {
            setCreated(data.created);
          }
        } else {
          setError(
            "أكواد الهدايا غير مفعلة، تأكد إن GIFT_SECRET موجود في Cloudflare",
          );
        }
      } catch {
        setError("صار خطأ، جرّب مرة ثانية");
      }

      setLoading(false);
    },
    [password],
  );

  useEffect(() => {
    void send({});
  }, [send]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreated(null);
    void send({
      action: "create",
      days: days || null,
      maxUses: uses || null,
      note,
    }).then(() => setNote(""));
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-2xl bg-[#221a3f] p-4 shadow-[0_5px_0_#140f29] sm:p-5"
      >
        <OptionGroup
          legend="مدة الكود"
          options={DURATIONS.map((item) => ({
            value: item.days,
            label: item.label,
          }))}
          value={days}
          onChange={setDays}
        />

        <OptionGroup
          legend="كم واحد يقدر يستخدمه"
          options={USES.map((item) => ({
            value: item.uses,
            label: item.label,
          }))}
          value={uses}
          onChange={setUses}
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-black text-white/70">
            لمين؟ (اختياري)
          </span>
          <input
            value={note}
            maxLength={80}
            onChange={(event) => setNote(event.target.value)}
            placeholder="مثلاً: مسابقة انستقرام"
            className="h-11 w-full rounded-xl bg-[#15102b] px-3 text-base font-bold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-[#ffc23d]"
          />
        </label>

        <button
          type="submit"
          disabled={loading || gifts === null}
          className="btn-primary w-full py-3"
        >
          سوّ كود هدية
        </button>

        {created && (
          <div className="space-y-2 rounded-xl bg-[#15102b] p-4 text-center">
            <p
              dir="ltr"
              className="select-all text-3xl font-black tracking-[0.15em] text-[#ffc23d]"
            >
              {formatGiftCode(created.code)}
            </p>
            <CopyButton text={formatGiftCode(created.code)} />
            <p className="text-xs font-bold text-white/50">
              يفعّله من صفحة «عندي كود»
            </p>
          </div>
        )}
      </form>

      {error && (
        <p className="rounded-2xl bg-[#221a3f] p-4 text-center text-sm font-bold text-[#ff7a7f]">
          {error}
        </p>
      )}

      {gifts && gifts.length > 0 && (
        <ul className="space-y-2">
          {gifts.map((gift) => {
            const status = STATUS[giftStatus(gift)];

            return (
              <li
                key={gift.code}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[#221a3f] px-4 py-3"
              >
                <span
                  dir="ltr"
                  className="select-all font-black tracking-wider text-white"
                >
                  {formatGiftCode(gift.code)}
                </span>

                <span className={`text-sm font-black ${status.className}`}>
                  {status.label}
                </span>

                <span className="text-sm font-bold text-white/55">
                  انستخدم {gift.uses}
                  {gift.maxUses ? ` من ${gift.maxUses}` : ""}
                </span>

                <span className="text-sm font-bold text-white/55">
                  {gift.expiresAt
                    ? `ينتهي ${dateFormat.format(new Date(gift.expiresAt))}`
                    : "بدون انتهاء"}
                </span>

                {gift.note && (
                  <span className="text-sm font-bold text-white/75">
                    {gift.note}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void send({ action: "delete", code: gift.code })
                  }
                  disabled={loading}
                  className="ms-auto rounded-lg px-3 py-1 text-sm font-black text-[#ff7a7f] hover:bg-white/5"
                >
                  حذف
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import type { ContactMessage } from "@/lib/messageStore";

const dateFormat = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminMessages() {
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(deleteId?: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, deleteId }),
      });

      const data = (await response.json().catch(() => null)) as {
        messages?: ContactMessage[];
      } | null;

      if (response.ok && data?.messages) {
        setMessages(data.messages);
      } else if (response.status === 401) {
        setError("كلمة المرور غلط");
      } else {
        setError("الرسائل غير مفعلة، تأكد من إعدادات Cloudflare");
      }
    } catch {
      setError("صار خطأ، جرّب مرة ثانية");
    }

    setLoading(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load();
  }

  if (!messages) {
    return (
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-sm space-y-3 rounded-3xl bg-[#221a3f] p-5 shadow-[0_6px_0_#140f29]"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-black text-white/70">
            كلمة المرور
          </span>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-12 w-full rounded-xl bg-[#15102b] px-4 text-base font-bold text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#ffc23d]"
          />
        </label>

        <button
          type="submit"
          disabled={!password || loading}
          className="btn-primary w-full py-3"
        >
          {loading ? "لحظة..." : "دخول"}
        </button>

        <p className="min-h-[20px] text-center text-sm font-bold text-[#ff7a7f]">
          {error}
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white/60">
          {messages.length} رسالة
        </p>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="btn-secondary px-4 py-2 text-sm"
        >
          تحديث
        </button>
      </div>

      {messages.length === 0 && (
        <p className="rounded-2xl bg-[#221a3f] p-6 text-center font-bold text-white/60">
          ما فيه رسائل للحين
        </p>
      )}

      {messages.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl bg-[#221a3f] p-4 shadow-[0_5px_0_#140f29]"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-lg font-black">{item.name}</p>
              <p className="text-xs font-bold text-white/45">
                {dateFormat.format(new Date(item.createdAt))}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load(item.id)}
              disabled={loading}
              className="rounded-lg px-3 py-1.5 text-sm font-black text-[#ff7a7f] hover:bg-white/5"
            >
              حذف
            </button>
          </div>

          {(item.email || item.phone) && (
            <p
              className="mt-2 flex flex-wrap gap-x-4 text-sm font-bold text-white/70"
              dir="ltr"
            >
              {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
              {item.phone && (
                <a href={`tel:${item.phone.replace(/\s/g, "")}`}>
                  {item.phone}
                </a>
              )}
            </p>
          )}

          <p className="mt-3 whitespace-pre-wrap text-base font-bold leading-7 text-white/85">
            {item.message}
          </p>
        </article>
      ))}
    </div>
  );
}

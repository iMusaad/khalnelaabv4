"use client";

import { useEffect, useState, type FormEvent } from "react";
import AdminGifts from "@/components/AdminGifts";
import AdminMessages from "@/components/AdminMessages";
import AdminUpcoming from "@/components/AdminUpcoming";

const STORAGE_KEY = "khal-admin";

const TABS = [
  { id: "messages", label: "الرسائل" },
  { id: "gifts", label: "أكواد الهدايا" },
  { id: "upcoming", label: "ألعاب ما نزلت" },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function checkPassword(password: string) {
  const response = await fetch("/api/admin/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  return response.status;
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<TabId>("messages");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let saved = "";

    try {
      saved = sessionStorage.getItem(STORAGE_KEY) ?? "";
    } catch {}

    if (!saved) {
      return;
    }

    void checkPassword(saved)
      .then((status) => {
        if (status === 200) {
          setPassword(saved);
          setAuthed(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const status = await checkPassword(password);

      if (status === 200) {
        setAuthed(true);

        try {
          sessionStorage.setItem(STORAGE_KEY, password);
        } catch {}
      } else if (status === 401) {
        setError("كلمة المرور غلط");
      } else {
        setError("لوحة التحكم غير مفعلة، حط ADMIN_PASSWORD في Cloudflare");
      }
    } catch {
      setError("صار خطأ، جرّب مرة ثانية");
    }

    setLoading(false);
  }

  function logout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}

    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          className="flex flex-1 gap-1 rounded-xl bg-[#15102b] p-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-lg px-2 py-2 text-sm font-black transition-colors sm:text-base ${
                tab === item.id
                  ? "bg-[#ffc23d] text-[#241339]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-lg px-3 py-2 text-sm font-black text-white/50 hover:text-white"
        >
          خروج
        </button>
      </div>

      {tab === "messages" && <AdminMessages password={password} />}
      {tab === "gifts" && <AdminGifts password={password} />}
      {tab === "upcoming" && <AdminUpcoming />}
    </div>
  );
}

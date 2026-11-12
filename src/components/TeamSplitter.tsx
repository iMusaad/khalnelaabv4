"use client";

import { useEffect, useState, type FormEvent } from "react";
import { OverlayShell } from "@/components/match/Overlays";

const STORAGE_KEY = "khal-players";

const MAX_PLAYERS = 24;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }

  return copy;
}

export default function TeamSplitter({
  team1,
  team2,
}: {
  team1: string;
  team2: string;
}) {
  const [open, setOpen] = useState(false);

  const [names, setNames] = useState<string[]>([]);

  const [draft, setDraft] = useState("");

  const [result, setResult] = useState<[string[], string[]] | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

      if (Array.isArray(saved)) {
        setNames(
          saved
            .filter((name) => typeof name === "string")
            .slice(0, MAX_PLAYERS),
        );
      }
    } catch {}
  }, []);

  function save(next: string[]) {
    setNames(next);
    setResult(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function addName(event: FormEvent) {
    event.preventDefault();

    const name = draft.trim().replace(/\s+/g, " ");

    if (!name || names.includes(name) || names.length >= MAX_PLAYERS) {
      setDraft("");
      return;
    }

    save([...names, name]);
    setDraft("");
  }

  function split() {
    const mixed = shuffle(names);

    setResult([
      mixed.filter((_, index) => index % 2 === 0),
      mixed.filter((_, index) => index % 2 === 1),
    ]);
  }

  const teams = [
    { name: team1 || "فريق 1", bg: "#ff5a5f", edge: "#c2343a" },
    { name: team2 || "فريق 2", bg: "#2f9bff", edge: "#1662b8" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#241339] px-3 py-1 text-sm font-black text-white shadow-[0_3px_0_#140a24] transition-transform active:translate-y-0.5"
      >
        قسّموا الفرق
      </button>

      {open && (
        <OverlayShell size="sm">
          <h2 className="text-2xl font-black text-white">قسّموا الفرق</h2>

          <p className="mt-1 text-sm font-bold text-white/55">
            اكتبوا أسماء اللاعبين ونقسمكم بالعدل
          </p>

          <form onSubmit={addName} className="mt-4 flex gap-2">
            <input
              value={draft}
              maxLength={20}
              autoComplete="off"
              enterKeyHint="enter"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="اسم اللاعب"
              aria-label="اسم اللاعب"
              className="h-11 min-w-0 flex-1 rounded-xl bg-[#130e28] px-3 text-right text-base font-bold text-white outline-none placeholder:text-white/35 focus:ring-2 focus:ring-white/50"
            />

            <button
              type="submit"
              disabled={!draft.trim() || names.length >= MAX_PLAYERS}
              className="btn-secondary h-11 px-4 text-sm disabled:opacity-50"
            >
              أضف
            </button>
          </form>

          {names.length > 0 && !result && (
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
              {names.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => save(names.filter((item) => item !== name))}
                    aria-label={`شيل ${name}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#130e28] px-2.5 py-1 text-sm font-bold text-white/90 transition-colors hover:text-white"
                  >
                    {name}
                    <span aria-hidden="true" className="text-white/40">
                      ✕
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {result && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {teams.map((team, index) => (
                <div
                  key={team.name}
                  className="rounded-2xl p-3 text-white"
                  style={{
                    background: team.bg,
                    boxShadow: `0 5px 0 ${team.edge}`,
                  }}
                >
                  <p className="truncate text-base font-black">{team.name}</p>

                  <ul className="mt-2 space-y-1">
                    {result[index].map((name) => (
                      <li key={name} className="truncate text-sm font-bold">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={split}
              disabled={names.length < 2}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {result ? "قسّموا من جديد" : "قسّمونا"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setResult(null);
              }}
              className="btn-secondary text-sm"
            >
              {result ? "تمام" : "إغلاق"}
            </button>
          </div>
        </OverlayShell>
      )}
    </>
  );
}

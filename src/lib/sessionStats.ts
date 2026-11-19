import { PLAYABLE_CARDS } from "@/data/quizCards";
import type { KvStore } from "@/lib/messageStore";

export const STAT_PREFIX = "stat:";

const STAT_TTL_SECONDS = 400 * 24 * 60 * 60;

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export const STAT_GAME_KEYS: string[] = PLAYABLE_CARDS.map((card) => card.key);

export type StatEvent = {
  type: "start" | "finish";
  sessionId: string;
  mode: "session" | "quick";
  trial: boolean;
  games: string[];
};

export type StatSummary = {
  starts: number;
  finishes: number;
  today: number;
  week: number;
  trialStarts: number;
  paidStarts: number;
  sessionStarts: number;
  quickStarts: number;
  games: { key: string; count: number }[];
  days: { date: string; count: number }[];
};

export function riyadhDate(now = Date.now()) {
  return new Date(now + RIYADH_OFFSET_MS).toISOString().slice(0, 10);
}

export function parseStatEvent(value: unknown): StatEvent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;

  const type =
    body.type === "start" || body.type === "finish" ? body.type : null;
  const mode =
    body.mode === "session" || body.mode === "quick" ? body.mode : null;
  const sessionId =
    typeof body.sessionId === "string" &&
    /^[a-z0-9]{8,16}$/.test(body.sessionId)
      ? body.sessionId
      : null;

  if (!type || !mode || !sessionId || !Array.isArray(body.games)) {
    return null;
  }

  const games = body.games.filter(
    (game): game is string =>
      typeof game === "string" && STAT_GAME_KEYS.includes(game),
  );

  if (games.length === 0 || games.length > STAT_GAME_KEYS.length) {
    return null;
  }

  return {
    type,
    sessionId,
    mode,
    trial: body.trial === true,
    games: [...new Set(games)],
  };
}

export function statKey(event: StatEvent, now = Date.now(), source = "direct") {
  return [
    "stat",
    riyadhDate(now),
    event.type === "start" ? "s" : "f",
    event.mode === "session" ? "m" : "q",
    event.trial ? "t" : "p",
    event.games.join("."),
    event.sessionId,
    source,
  ].join(":");
}

export async function recordStat(
  store: KvStore,
  event: StatEvent,
  source = "direct",
) {
  await store.put(statKey(event, Date.now(), source), "1", {
    expirationTtl: STAT_TTL_SECONDS,
  });
}

export function summarizeStatKeys(
  keys: string[],
  now = Date.now(),
): StatSummary {
  const today = riyadhDate(now);
  const weekStart = riyadhDate(now - 6 * 24 * 60 * 60 * 1000);
  const gameCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();
  const summary: StatSummary = {
    starts: 0,
    finishes: 0,
    today: 0,
    week: 0,
    trialStarts: 0,
    paidStarts: 0,
    sessionStarts: 0,
    quickStarts: 0,
    games: [],
    days: [],
  };

  for (const key of keys) {
    const [prefix, date, type, mode, tier, games] = key.split(":");

    if (prefix !== "stat" || !date || !games) {
      continue;
    }

    if (type === "f") {
      summary.finishes += 1;
      continue;
    }

    if (type !== "s") {
      continue;
    }

    summary.starts += 1;
    dayCounts.set(date, (dayCounts.get(date) ?? 0) + 1);

    if (date === today) {
      summary.today += 1;
    }

    if (date >= weekStart) {
      summary.week += 1;
    }

    if (tier === "t") {
      summary.trialStarts += 1;
    } else {
      summary.paidStarts += 1;
    }

    if (mode === "m") {
      summary.sessionStarts += 1;
    } else {
      summary.quickStarts += 1;
    }

    for (const game of games.split(".")) {
      gameCounts.set(game, (gameCounts.get(game) ?? 0) + 1);
    }
  }

  summary.games = STAT_GAME_KEYS.map((key) => ({
    key,
    count: gameCounts.get(key) ?? 0,
  })).sort((a, b) => b.count - a.count);

  summary.days = Array.from({ length: 14 }, (_, offset) => {
    const date = riyadhDate(now - (13 - offset) * 24 * 60 * 60 * 1000);

    return { date, count: dayCounts.get(date) ?? 0 };
  });

  return summary;
}

export async function loadStatSummary(store: KvStore) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await store.list({ prefix: STAT_PREFIX, cursor });
    keys.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return summarizeStatKeys(keys);
}

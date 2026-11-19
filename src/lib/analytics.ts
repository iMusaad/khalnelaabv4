import type { Round } from "@/lib/matchQueue";

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    (window as GtagWindow).gtag?.("event", name, params);
  } catch {}
}

export function newStatSessionId() {
  return Math.random().toString(36).slice(2, 12).padEnd(10, "0");
}

export function roundCardKeys(rounds: Round[]) {
  return [
    ...new Set(
      rounds.map((round) =>
        round.game === "quiz" && round.category
          ? `quiz-${round.category}`
          : round.game,
      ),
    ),
  ];
}

export function reportSession(
  type: "start" | "finish",
  data: {
    sessionId: string;
    mode: "session" | "quick";
    trial: boolean;
    rounds: Round[];
  },
) {
  const games = roundCardKeys(data.rounds);

  try {
    void fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        sessionId: data.sessionId,
        mode: data.mode,
        trial: data.trial,
        games,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}

  trackEvent(type === "start" ? "match_start" : "match_finish", {
    match_mode: data.mode,
    trial: data.trial,
    games_count: games.length,
    games: games.join(","),
  });
}

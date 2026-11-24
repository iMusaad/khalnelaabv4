import type { Round } from "@/lib/matchQueue";

import { SITE } from "@/data/site";
import { analyticsAllowed } from "@/lib/consent";

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  knGaReady?: boolean;
};

export function gaEnabled() {
  return /^G-[A-Z0-9]+$/.test(SITE.gaMeasurementId);
}

const PRIVATE_PARAMS = ["code", "id", "email", "token", "status", "message"];

export function safePageLocation(href: string) {
  try {
    const url = new URL(href);

    for (const key of PRIVATE_PARAMS) {
      url.searchParams.delete(key);
    }

    return url.toString();
  } catch {
    return href.split("?")[0];
  }
}

export function syncPageLocation() {
  const gtag = ensureGtag();

  gtag?.("set", { page_location: safePageLocation(window.location.href) });
}

export function ensureGtag() {
  if (typeof window === "undefined" || !gaEnabled()) {
    return null;
  }

  if (!analyticsAllowed()) {
    return null;
  }

  const target = window as GtagWindow;

  if (!target.gtag) {
    target.dataLayer = target.dataLayer ?? [];
    target.gtag = function gtag() {
      target.dataLayer?.push(arguments);
    };
  }

  if (!target.knGaReady) {
    target.knGaReady = true;
    target.gtag("js", new Date());
    target.gtag("set", {
      page_location: safePageLocation(window.location.href),
    });
    target.gtag("config", SITE.gaMeasurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }

  return target.gtag;
}

export function setAnalyticsDisabled(disabled: boolean) {
  if (typeof window === "undefined" || !gaEnabled()) {
    return;
  }

  (window as unknown as Record<string, boolean>)[
    `ga-disable-${SITE.gaMeasurementId}`
  ] = disabled;
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    ensureGtag()?.("event", name, params);
  } catch {}
}

export function cardKeyFor(round: Round) {
  return round.game === "quiz" && round.category
    ? `quiz-${round.category}`
    : round.game;
}

export function newStatSessionId() {
  return Math.random().toString(36).slice(2, 12).padEnd(10, "0");
}

export function roundCardKeys(rounds: Round[]) {
  return [...new Set(rounds.map(cardKeyFor))];
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

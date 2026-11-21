import { describe, expect, it } from "vitest";
import {
  parseStatEvent,
  riyadhDate,
  statKey,
  summarizeStatKeys,
} from "@/lib/sessionStats";

const NOW = Date.UTC(2026, 10, 19, 22, 0);

describe("session stats", () => {
  it("uses the Riyadh date", () => {
    expect(riyadhDate(NOW)).toBe("2026-11-20");
  });

  it("rejects bad events and unknown games", () => {
    expect(parseStatEvent(null)).toBeNull();
    expect(
      parseStatEvent({
        type: "start",
        sessionId: "abc",
        mode: "session",
        games: ["geo"],
      }),
    ).toBeNull();
    expect(
      parseStatEvent({
        type: "start",
        sessionId: "abcdefgh12",
        mode: "session",
        games: ["nope"],
      }),
    ).toBeNull();
  });

  it("builds keys and summarizes them", () => {
    const start = parseStatEvent({
      type: "start",
      sessionId: "abcdefgh12",
      mode: "session",
      trial: false,
      games: ["geo", "quiz-saudi", "geo", "bad"],
    });

    expect(start?.games).toEqual(["geo", "quiz-saudi"]);

    const finish = { ...start!, type: "finish" as const };
    const quick = parseStatEvent({
      type: "start",
      sessionId: "zzzzzzzz99",
      mode: "quick",
      trial: true,
      games: ["logo"],
    })!;

    const keys = [
      statKey(start!, NOW),
      statKey(finish, NOW),
      statKey(quick, NOW - 10 * 24 * 60 * 60 * 1000),
    ];

    expect(keys[0]).toBe(
      "stat:2026-11-20:s:m:p:geo.quiz-saudi:abcdefgh12:direct",
    );

    const summary = summarizeStatKeys(keys, NOW);

    expect(summary.starts).toBe(2);
    expect(summary.finishes).toBe(1);
    expect(summary.today).toBe(1);
    expect(summary.week).toBe(1);
    expect(summary.trialStarts).toBe(1);
    expect(summary.quickStarts).toBe(1);
    expect(summary.games.find((game) => game.key === "geo")?.count).toBe(1);
    expect(summary.days).toHaveLength(14);
    expect(summary.days.at(-1)).toEqual({ date: "2026-11-20", count: 1 });
  });
});

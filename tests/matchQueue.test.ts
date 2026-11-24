import { describe, expect, it } from "vitest";
import {
  buildRoundQueue,
  getRoundCount,
  isGameType,
  isQuizCategory,
} from "@/lib/matchQueue";

describe("buildRoundQueue", () => {
  it("makes one quiz round per selected category", () => {
    const queue = buildRoundQueue(["quiz"], {}, ["saudi", "football"]);

    expect(queue).toHaveLength(2);
    expect(queue.map((round) => round.category).sort()).toEqual([
      "football",
      "saudi",
    ]);
  });

  it("skips the quiz when no category is selected", () => {
    expect(buildRoundQueue(["quiz"], {}, [])).toEqual([]);
  });

  it("uses each game's fixed round count and ignores stored choices", () => {
    const queue = buildRoundQueue(["word", "wheel"], { word: 6, wheel: 3 }, []);

    expect(queue.filter((round) => round.game === "word")).toHaveLength(2);
    expect(queue.filter((round) => round.game === "wheel")).toHaveLength(1);
  });
});

describe("getRoundCount", () => {
  it("gives each game its fixed round count", () => {
    expect(getRoundCount("word")).toBe(2);
    expect(getRoundCount("scramble")).toBe(2);
    expect(getRoundCount("geo")).toBe(1);
  });
});

describe("URL validation", () => {
  it("accepts only known games and quiz categories", () => {
    expect(isGameType("country")).toBe(true);
    expect(isGameType("chess")).toBe(false);
    expect(isGameType(null)).toBe(false);
    expect(isQuizCategory("saudi")).toBe(true);
    expect(isQuizCategory("tash")).toBe(false);
    expect(isQuizCategory("toString")).toBe(false);
  });
});

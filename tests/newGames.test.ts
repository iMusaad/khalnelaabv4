import { describe, expect, it } from "vitest";
import { newCardKeys } from "@/data/newGames";

describe("newCardKeys", () => {
  const cards = [
    { key: "letters", until: "2027-03-10" },
    { key: "quiz-english", until: "2027-01-01" },
  ];

  it("keeps cards until their end date in Riyadh time", () => {
    const keys = newCardKeys(cards, Date.parse("2026-12-31T23:59:00+03:00"));

    expect([...keys].sort()).toEqual(["letters", "quiz-english"]);
  });

  it("drops cards once the end date arrives", () => {
    const keys = newCardKeys(cards, Date.parse("2027-01-01T00:00:00+03:00"));

    expect([...keys]).toEqual(["letters"]);
  });
});

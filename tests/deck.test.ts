import { describe, expect, it } from "vitest";
import { createDeck } from "@/lib/deck";

const items = Array.from({ length: 10 }, (_, i) => i);

describe("createDeck", () => {
  it("does not repeat items until the deck runs out", () => {
    const deck = createDeck(items);
    const drawn = [...deck.draw(4), ...deck.draw(4), ...deck.draw(2)];

    expect(new Set(drawn).size).toBe(10);
  });

  it("never returns duplicates within one draw across a refill", () => {
    const deck = createDeck(items);

    for (let i = 0; i < 200; i += 1) {
      const hand = deck.draw(3);
      expect(new Set(hand).size).toBe(3);
    }
  });

  it("handles empty decks and invalid counts", () => {
    expect(createDeck([]).draw(3)).toEqual([]);
    expect(createDeck(items).draw(0)).toEqual([]);
    expect(createDeck(items).draw(-2)).toEqual([]);
    expect(createDeck(items).draw(Number.NaN)).toEqual([]);
    expect(createDeck(items).draw(50)).toHaveLength(10);
  });
});

function memoryStorage() {
  const data = new Map<string, string>();

  return {
    read: (key: string) => data.get(key) ?? null,
    write: (key: string, value: string) => void data.set(key, value),
  };
}

describe("createDeck with a remembered history", () => {
  it("does not repeat items across page loads until everything was seen", () => {
    const storage = memoryStorage();
    const first = createDeck(items, "test", storage).draw(6);
    const second = createDeck(items, "test", storage).draw(4);

    expect(new Set([...first, ...second]).size).toBe(10);
  });

  it("starts over once everything was seen, without repeating within a draw", () => {
    const storage = memoryStorage();

    createDeck(items, "test", storage).draw(8);

    const hand = createDeck(items, "test", storage).draw(5);

    expect(new Set(hand).size).toBe(5);
  });

  it("serves newly added items first", () => {
    const storage = memoryStorage();

    createDeck(items, "test", storage).draw(10);

    const grown = [...items, 10, 11];
    const hand = createDeck(grown, "test", storage).draw(2);

    expect(hand.sort()).toEqual([10, 11]);
  });

  it("keeps separate histories per name", () => {
    const storage = memoryStorage();
    const a = createDeck(items, "a", storage).draw(10);
    const b = createDeck(items, "b", storage).draw(10);

    expect(a).toHaveLength(10);
    expect(b).toHaveLength(10);
  });
});

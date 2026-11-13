import { describe, expect, it } from "vitest";
import {
  createGift,
  formatGiftCode,
  giftStatus,
  normalizeGiftCode,
  redeemGift,
} from "@/lib/giftStore";
import type { KvStore } from "@/lib/messageStore";

function memoryStore(): KvStore {
  const data = new Map<string, string>();

  return {
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value) {
      data.set(key, value);
    },
    async delete(key) {
      data.delete(key);
    },
    async list({ prefix }) {
      return {
        keys: [...data.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((name) => ({ name })),
        list_complete: true,
      };
    },
  };
}

const DAY = 24 * 60 * 60 * 1000;

describe("gift codes", () => {
  it("makes short codes people can type", async () => {
    const gift = await createGift(memoryStore(), {
      days: null,
      maxUses: 1,
      note: "",
    });

    expect(formatGiftCode(gift.code)).toMatch(/^[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    expect(
      normalizeGiftCode(` ${formatGiftCode(gift.code).toLowerCase()} `),
    ).toBe(gift.code);
  });

  it("stops working after its uses run out", async () => {
    const store = memoryStore();
    const gift = await createGift(store, { days: null, maxUses: 1, note: "" });

    expect(await redeemGift(store, gift.code)).not.toBeNull();
    expect(await redeemGift(store, gift.code)).toBeNull();
  });

  it("stops working after it expires", async () => {
    const store = memoryStore();
    const now = Date.now();
    const gift = await createGift(store, {
      days: 7,
      maxUses: null,
      note: "",
      now,
    });

    expect(giftStatus(gift, now + 6 * DAY)).toBe("active");
    expect(await redeemGift(store, gift.code, now + 8 * DAY)).toBeNull();
  });

  it("rejects codes that were never made", async () => {
    expect(await redeemGift(memoryStore(), "ABCD2345")).toBeNull();
    expect(normalizeGiftCode("KN-1234")).toBeNull();
  });
});

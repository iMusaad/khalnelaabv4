import { describe, expect, it } from "vitest";
import {
  ensureShortCode,
  normalizeShortCode,
  paymentForShortCode,
  shortCodeForLicense,
} from "@/lib/shortCode";
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
    async list() {
      return { keys: [], list_complete: true };
    },
  };
}

describe("short purchase codes", () => {
  it("creates one short code per license and maps it back to the payment", async () => {
    const store = memoryStore();

    const code = await ensureShortCode(store, "pay_aaaaaaaa", "lic1");

    expect(code).toMatch(/^KN-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    expect(await ensureShortCode(store, "pay_aaaaaaaa", "lic1")).toBe(code);
    expect(await shortCodeForLicense(store, "lic1")).toBe(code);
    expect(await paymentForShortCode(store, code)).toBe("pay_aaaaaaaa");
  });

  it("accepts the code with or without the prefix, dashes and case", async () => {
    const store = memoryStore();
    const code = await ensureShortCode(store, "pay_bbbbbbbb", "lic2");
    const raw = code.slice(3).replace("-", "");

    expect(await paymentForShortCode(store, raw.toLowerCase())).toBe(
      "pay_bbbbbbbb",
    );
    expect(normalizeShortCode(` ${code} `)).toBe(raw);
  });

  it("rejects malformed codes", () => {
    expect(normalizeShortCode("KN-06HH-2EGM-AH31")).toBeNull();
    expect(normalizeShortCode("ABCD")).toBeNull();
    expect(normalizeShortCode("ABCD-EFG1")).toBeNull();
  });
});

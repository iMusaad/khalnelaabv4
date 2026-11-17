import { describe, expect, it } from "vitest";
import {
  hashEmail,
  linkPaymentToEmail,
  paymentsForEmail,
  unlinkEmail,
} from "@/lib/emailIndex";
import type { KvStore } from "@/lib/messageStore";

function memoryStore() {
  const data = new Map<string, string>();

  const store: KvStore = {
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

  return { store, data };
}

const SECRET = "test-secret";

describe("email to payment index", () => {
  it("finds payments by email, ignoring case and spaces", async () => {
    const { store } = memoryStore();

    await linkPaymentToEmail(
      store,
      "Ahmad@Example.com",
      "pay_aaaaaaaa",
      SECRET,
    );

    expect(
      await paymentsForEmail(store, "  ahmad@example.COM ", SECRET),
    ).toEqual(["pay_aaaaaaaa"]);
  });

  it("never stores the email itself", async () => {
    const { store, data } = memoryStore();

    await linkPaymentToEmail(
      store,
      "ahmad@example.com",
      "pay_aaaaaaaa",
      SECRET,
    );

    const dump = JSON.stringify([...data.entries()]);

    expect(dump).not.toContain("ahmad");
    expect(dump).not.toContain("example.com");
  });

  it("keeps the newest payment first without duplicates", async () => {
    const { store } = memoryStore();

    await linkPaymentToEmail(store, "a@b.co", "pay_11111111", SECRET);
    await linkPaymentToEmail(store, "a@b.co", "pay_22222222", SECRET);
    await linkPaymentToEmail(store, "a@b.co", "pay_22222222", SECRET);

    expect(await paymentsForEmail(store, "a@b.co", SECRET)).toEqual([
      "pay_22222222",
      "pay_11111111",
    ]);
  });

  it("depends on the secret and can be deleted", async () => {
    const { store } = memoryStore();

    expect(await hashEmail("a@b.co", SECRET)).not.toBe(
      await hashEmail("a@b.co", "other"),
    );

    await linkPaymentToEmail(store, "a@b.co", "pay_11111111", SECRET);
    await unlinkEmail(store, "a@b.co", SECRET);

    expect(await paymentsForEmail(store, "a@b.co", SECRET)).toEqual([]);
  });
});

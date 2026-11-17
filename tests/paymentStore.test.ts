import { afterEach, describe, expect, it, vi } from "vitest";
import type { KvStore } from "@/lib/messageStore";
import {
  getStoredPayment,
  savePayment,
  webhookSecretMatches,
} from "@/lib/paymentStore";

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

const payment = {
  id: "760878ec-d1d3-5f72-9056-191683f55872",
  status: "paid",
  amount: 4900,
  currency: "SAR",
  metadata: { email: "someone@example.com" },
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("webhook payments", () => {
  it("stores a paid payment without the email", async () => {
    const store = memoryStore();

    await savePayment(store, payment);

    const stored = await getStoredPayment(store, payment.id);

    expect(stored).toEqual({
      id: payment.id,
      status: "paid",
      amount: 4900,
      currency: "SAR",
    });
    expect(JSON.stringify(stored)).not.toContain("example.com");
  });

  it("ignores unsafe payment ids", async () => {
    const store = memoryStore();

    await savePayment(store, { ...payment, id: "../../x" });

    expect(await getStoredPayment(store, "../../x")).toBeNull();
  });

  it("only accepts the configured webhook secret", () => {
    expect(webhookSecretMatches("anything")).toBe(false);

    vi.stubEnv("MOYASAR_WEBHOOK_SECRET", "correct-secret");

    expect(webhookSecretMatches("correct-secret")).toBe(true);
    expect(webhookSecretMatches("wrong-secret!!")).toBe(false);
    expect(webhookSecretMatches(undefined)).toBe(false);
  });
});

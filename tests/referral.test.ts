import { describe, expect, it } from "vitest";
import type { KvStore } from "@/lib/messageStore";
import { isPaidPurchaseWithReferral, type MoyasarPayment } from "@/lib/payment";
import { getCurrentPrice, toHalalas } from "@/lib/pricing";
import {
  createReferral,
  getReferral,
  listReferrals,
  markReferralPaid,
  normalizeRefCode,
  recordReferralSale,
} from "@/lib/referral";

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

const price = getCurrentPrice();

function payment(amount: number, ref?: string): MoyasarPayment {
  const metadata: Record<string, string> = ref ? { ref } : {};

  return {
    id: "pay_aaaaaaaa",
    status: "paid",
    amount,
    currency: "SAR",
    metadata,
  };
}

describe("referral codes", () => {
  it("normalizes codes and rejects bad ones", () => {
    expect(normalizeRefCode(" saad-1 ")).toBe("SAAD1");
    expect(normalizeRefCode("ab")).toBeNull();
    expect(normalizeRefCode("سعد")).toBeNull();
  });

  it("creates a code once and keeps the discount below the price", async () => {
    const store = memoryStore();

    const created = await createReferral(store, {
      code: "saad",
      name: "سعد",
      discount: 999,
      commission: 10,
    });

    expect(created?.discount).toBe(price - 1);
    expect(
      await createReferral(store, {
        code: "SAAD",
        name: "",
        discount: 5,
        commission: 10,
      }),
    ).toBeNull();
    expect(await listReferrals(store)).toHaveLength(1);
  });

  it("counts each payment once and tracks what is owed", async () => {
    const store = memoryStore();

    await createReferral(store, {
      code: "SAAD",
      name: "",
      discount: 5,
      commission: 10,
    });

    expect(await recordReferralSale(store, "pay_1", "saad")).toBe(true);
    expect(await recordReferralSale(store, "pay_1", "saad")).toBe(false);
    expect(await recordReferralSale(store, "pay_2", "SAAD")).toBe(true);
    expect(await recordReferralSale(store, "pay_3", "NOPE")).toBe(false);

    const before = await getReferral(store, "SAAD");
    expect(before?.sales).toBe(2);
    expect(before?.earned).toBe(20);

    await markReferralPaid(store, "SAAD");

    expect((await getReferral(store, "SAAD"))?.paid).toBe(20);
  });
});

describe("payment check with a referral discount", () => {
  it("accepts the full price without a code", async () => {
    expect(
      await isPaidPurchaseWithReferral(payment(toHalalas(price)), null),
    ).toBe(true);
  });

  it("accepts the discounted price only with a real code", async () => {
    const store = memoryStore();

    await createReferral(store, {
      code: "SAAD",
      name: "",
      discount: 5,
      commission: 10,
    });

    const discounted = toHalalas(price - 5);

    expect(
      await isPaidPurchaseWithReferral(payment(discounted, "SAAD"), store),
    ).toBe(true);
    expect(
      await isPaidPurchaseWithReferral(payment(discounted, "OTHER"), store),
    ).toBe(false);
    expect(await isPaidPurchaseWithReferral(payment(discounted), store)).toBe(
      false,
    );
    expect(
      await isPaidPurchaseWithReferral(
        payment(toHalalas(price - 10), "SAAD"),
        store,
      ),
    ).toBe(false);
  });
});

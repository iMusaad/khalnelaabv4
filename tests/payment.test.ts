import { describe, expect, it } from "vitest";
import { isPaidPurchase, isValidPaymentId } from "@/lib/payment";
import { safeNextPath } from "@/lib/licenseCookie";
import { PRICING, getCurrentPrice, toHalalas } from "@/lib/pricing";

const payment = {
  id: "pay_abcdefgh",
  status: "paid",
  amount: toHalalas(getCurrentPrice()),
  currency: "SAR",
};

describe("isPaidPurchase", () => {
  it("accepts a paid payment at the sale or base price", () => {
    expect(isPaidPurchase(payment)).toBe(true);
    expect(
      isPaidPurchase({ ...payment, amount: toHalalas(PRICING.basePrice) }),
    ).toBe(true);
  });

  it("rejects unpaid, wrong amount or wrong currency", () => {
    expect(isPaidPurchase({ ...payment, status: "failed" })).toBe(false);
    expect(isPaidPurchase({ ...payment, status: "initiated" })).toBe(false);
    expect(isPaidPurchase({ ...payment, amount: 100 })).toBe(false);
    expect(isPaidPurchase({ ...payment, currency: "USD" })).toBe(false);
  });
});

describe("isValidPaymentId", () => {
  it("only allows safe payment ids", () => {
    expect(isValidPaymentId("3f2c1a9e-1111-4c4c-9e9e-123456789abc")).toBe(true);
    expect(isValidPaymentId("../../admin")).toBe(false);
    expect(isValidPaymentId("short")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("returns to the game when coming from it", () => {
    expect(safeNextPath("/match?game=word")).toBe("/match?game=word");
  });

  it("falls back to the home page otherwise", () => {
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("//evil.com/match")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
  });
});

describe("launch sale", () => {
  it("ends on 1 January Riyadh time", () => {
    expect(getCurrentPrice(Date.parse("2026-12-31T23:59:00+03:00"))).toBe(
      PRICING.salePrice,
    );
    expect(getCurrentPrice(Date.parse("2027-01-01T00:00:00+03:00"))).toBe(
      PRICING.basePrice,
    );
  });
});

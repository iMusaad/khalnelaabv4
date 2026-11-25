import { describe, expect, it } from "vitest";
import { detectSource, parseSource } from "@/lib/attribution";
import {
  estimateFee,
  parseSpend,
  summarizeMoney,
  type Sale,
} from "@/lib/money";

const NOW = Date.UTC(2026, 11, 20, 12, 0);

describe("attribution", () => {
  it("reads utm, click ids, referral codes and referrers", () => {
    expect(
      detectSource(
        "?utm_source=TikTok&utm_campaign=Launch 1",
        "",
        "khalnelab.com",
      ),
    ).toEqual({ source: "tiktok", campaign: "launch-1" });
    expect(detectSource("?ttclid=abc", "", "khalnelab.com")?.source).toBe(
      "tiktok",
    );
    expect(detectSource("?ref=sa-ad", "", "khalnelab.com")).toEqual({
      source: "ref",
      campaign: "saad",
    });
    expect(
      detectSource("", "https://www.instagram.com/", "khalnelab.com")?.source,
    ).toBe("instagram");
    expect(detectSource("", "https://khalnelab.com/buy", "khalnelab.com")).toBe(
      null,
    );
    expect(detectSource("", "", "khalnelab.com")).toBe(null);
  });

  it("parses stored sources", () => {
    expect(parseSource("tiktok.launch")).toEqual({
      source: "tiktok",
      campaign: "launch",
    });
    expect(parseSource("")).toEqual({ source: "direct", campaign: "" });
  });
});

describe("money", () => {
  it("validates spend", () => {
    expect(
      parseSpend({ date: "2026-12-20", platform: "tiktok", amount: "150.5" }),
    ).toEqual({
      date: "2026-12-20",
      platform: "tiktok",
      campaign: "",
      amount: 150.5,
    });
    expect(parseSpend({ date: "bad", platform: "tiktok", amount: 5 })).toBe(
      null,
    );
    expect(parseSpend({ date: "2026-12-20", platform: "", amount: 5 })).toBe(
      null,
    );
  });

  it("summarizes sales, spend and funnel by source", () => {
    const sales: Sale[] = [
      {
        id: "a",
        at: new Date(NOW).toISOString(),
        amount: 4900,
        fee: estimateFee(4900),
        feeEstimated: true,
        commission: 0,
        ref: "",
        source: "tiktok",
        campaign: "launch",
      },
      {
        id: "b",
        at: new Date(NOW - 10 * 86400000).toISOString(),
        amount: 3900,
        fee: 200,
        feeEstimated: false,
        commission: 1000,
        ref: "SAAD",
        source: "ref",
        campaign: "saad",
      },
    ];

    const summary = summarizeMoney(
      {
        sales,
        spends: [
          {
            id: "2026-12-20:x",
            date: "2026-12-20",
            platform: "tiktok",
            campaign: "",
            amount: 100,
          },
        ],
        eventKeys: [
          "ev:2026-12-20:buy_view:tiktok:aa",
          "ev:2026-12-20:buy_view:tiktok:bb",
          "ev:2026-12-20:checkout:tiktok:cc",
        ],
        statKeys: ["stat:2026-12-20:s:m:t:geo:abcdefgh12:tiktok"],
      },
      NOW,
    );

    expect(summary.sales).toBe(2);
    expect(summary.gross).toBe(88);
    expect(summary.commissions).toBe(10);
    expect(summary.today.sales).toBe(1);
    expect(summary.week.sales).toBe(1);
    expect(summary.month.sales).toBe(2);
    expect(summary.spend).toBe(100);

    const tiktok = summary.sources.find((row) => row.source === "tiktok")!;

    expect(tiktok).toMatchObject({
      sessions: 1,
      buyViews: 2,
      checkouts: 1,
      sales: 1,
      spend: 100,
    });
    expect(tiktok.net).toBeCloseTo(49 - estimateFee(4900) / 100);
    expect(summary.days).toHaveLength(30);
  });
});

describe("expenses", () => {
  it("parses valid expenses and rejects bad ones", async () => {
    const { parseExpense } = await import("@/lib/money");

    expect(
      parseExpense({ date: "2026-11-25", category: "ai", amount: "765" }),
    ).toEqual({ date: "2026-11-25", category: "ai", note: "", amount: 765 });
    expect(
      parseExpense({ date: "2026-11-25", category: "food", amount: 10 }),
    ).toBeNull();
    expect(
      parseExpense({ date: "bad", category: "ai", amount: 10 }),
    ).toBeNull();
  });

  it("subtracts expenses from profit", async () => {
    const { summarizeMoney } = await import("@/lib/money");
    const summary = summarizeMoney({
      sales: [],
      spends: [],
      expenses: [
        { id: "a", date: "2026-11-25", category: "ai", note: "", amount: 765 },
      ],
      eventKeys: [],
      statKeys: [],
    });

    expect(summary.expenses).toBe(765);
    expect(summary.profit).toBe(-765);
  });
});

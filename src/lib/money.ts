import type { KvStore } from "@/lib/messageStore";
import type { MoyasarPayment } from "@/lib/payment";
import { parseSource } from "@/lib/attribution";
import { getReferral } from "@/lib/referral";
import { STAT_PREFIX, riyadhDate } from "@/lib/sessionStats";

const SALE_PREFIX = "sale:";
const EVENT_PREFIX = "ev:";
const SPEND_PREFIX = "spend:";
const EVENT_TTL_SECONDS = 400 * 24 * 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export const FUNNEL_EVENTS = ["buy_view", "checkout"] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export type Sale = {
  id: string;
  at: string;
  amount: number;
  fee: number;
  feeEstimated: boolean;
  commission: number;
  ref: string;
  source: string;
  campaign: string;
};

export type Spend = {
  id: string;
  date: string;
  platform: string;
  campaign: string;
  amount: number;
};

export type SourceRow = {
  source: string;
  sessions: number;
  buyViews: number;
  checkouts: number;
  sales: number;
  gross: number;
  net: number;
  spend: number;
};

export type MoneySummary = {
  sales: number;
  gross: number;
  fees: number;
  commissions: number;
  net: number;
  spend: number;
  profit: number;
  today: { sales: number; net: number };
  week: { sales: number; net: number };
  month: { sales: number; net: number };
  days: { date: string; sales: number; net: number }[];
  sources: SourceRow[];
  recent: Sale[];
  spends: Spend[];
};

export function estimateFee(amountHalalas: number) {
  return Math.round(amountHalalas * 0.0275 + 100);
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function recordSale(store: KvStore, payment: MoyasarPayment) {
  const key = `${SALE_PREFIX}${payment.id}`;

  if (await store.get(key)) {
    return false;
  }

  const metadata = payment.metadata ?? {};
  const referral = metadata.ref ? await getReferral(store, metadata.ref) : null;
  const fee =
    typeof payment.fee === "number" && payment.fee >= 0 ? payment.fee : null;
  const source = referral
    ? { source: "ref", campaign: referral.code.toLowerCase() }
    : parseSource(metadata.src);

  const sale: Sale = {
    id: payment.id,
    at: new Date().toISOString(),
    amount: payment.amount,
    fee: fee ?? estimateFee(payment.amount),
    feeEstimated: fee === null,
    commission: referral ? referral.commission * 100 : 0,
    ref: referral?.code ?? "",
    source: source.source,
    campaign: source.campaign,
  };

  await store.put(key, JSON.stringify(sale));

  return true;
}

export function funnelKey(
  event: FunnelEvent,
  source: string,
  now = Date.now(),
) {
  return `${EVENT_PREFIX}${riyadhDate(now)}:${event}:${parseSource(source).source}:${randomId()}`;
}

export async function recordFunnelEvent(
  store: KvStore,
  event: FunnelEvent,
  source: string,
) {
  await store.put(funnelKey(event, source), "1", {
    expirationTtl: EVENT_TTL_SECONDS,
  });
}

export function parseSpend(input: unknown): Omit<Spend, "id"> | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const body = input as Record<string, unknown>;
  const date = typeof body.date === "string" ? body.date : "";
  const amount = Number(body.amount);
  const platform = parseSource(
    typeof body.platform === "string" ? body.platform : "",
  ).source;
  const campaign =
    typeof body.campaign === "string" ? body.campaign.trim().slice(0, 60) : "";

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1_000_000 ||
    platform === "direct"
  ) {
    return null;
  }

  return { date, platform, campaign, amount: Math.round(amount * 100) / 100 };
}

export async function addSpend(store: KvStore, spend: Omit<Spend, "id">) {
  const id = `${spend.date}:${randomId()}`;

  await store.put(`${SPEND_PREFIX}${id}`, JSON.stringify({ ...spend, id }));
}

export async function deleteSpend(store: KvStore, id: unknown) {
  if (typeof id === "string" && /^\d{4}-\d{2}-\d{2}:[a-z0-9]+$/.test(id)) {
    await store.delete(`${SPEND_PREFIX}${id}`);
  }
}

async function listKeys(store: KvStore, prefix: string) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await store.list({ prefix, cursor });
    keys.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return keys;
}

async function readAll<T>(store: KvStore, keys: string[]) {
  const values = await Promise.all(keys.map((key) => store.get(key)));

  return values.flatMap((value) => {
    try {
      return value ? [JSON.parse(value) as T] : [];
    } catch {
      return [];
    }
  });
}

function netOf(sale: Sale) {
  return (sale.amount - sale.fee - sale.commission) / 100;
}

function toRiyals(halalas: number) {
  return Math.round(halalas) / 100;
}

export function summarizeMoney(
  input: {
    sales: Sale[];
    spends: Spend[];
    eventKeys: string[];
    statKeys: string[];
  },
  now = Date.now(),
): MoneySummary {
  const today = riyadhDate(now);
  const weekStart = riyadhDate(now - 6 * DAY_MS);
  const monthStart = riyadhDate(now - 29 * DAY_MS);
  const rows = new Map<string, SourceRow>();

  function row(source: string) {
    let value = rows.get(source);

    if (!value) {
      value = {
        source,
        sessions: 0,
        buyViews: 0,
        checkouts: 0,
        sales: 0,
        gross: 0,
        net: 0,
        spend: 0,
      };
      rows.set(source, value);
    }

    return value;
  }

  const sales = [...input.sales].sort((a, b) => b.at.localeCompare(a.at));
  const dayMap = new Map<string, { sales: number; net: number }>();
  const summary: MoneySummary = {
    sales: sales.length,
    gross: 0,
    fees: 0,
    commissions: 0,
    net: 0,
    spend: 0,
    profit: 0,
    today: { sales: 0, net: 0 },
    week: { sales: 0, net: 0 },
    month: { sales: 0, net: 0 },
    days: [],
    sources: [],
    recent: sales.slice(0, 20),
    spends: [...input.spends].sort((a, b) => b.date.localeCompare(a.date)),
  };

  for (const sale of sales) {
    const date = riyadhDate(Date.parse(sale.at));
    const net = netOf(sale);

    summary.gross += sale.amount;
    summary.fees += sale.fee;
    summary.commissions += sale.commission;
    summary.net += net;

    for (const [range, start] of [
      [summary.today, today],
      [summary.week, weekStart],
      [summary.month, monthStart],
    ] as const) {
      if (date >= start) {
        range.sales += 1;
        range.net += net;
      }
    }

    const day = dayMap.get(date) ?? { sales: 0, net: 0 };
    day.sales += 1;
    day.net += net;
    dayMap.set(date, day);

    const source = row(sale.source || "direct");
    source.sales += 1;
    source.gross += sale.amount / 100;
    source.net += net;
  }

  for (const spend of input.spends) {
    summary.spend += spend.amount;
    row(spend.platform).spend += spend.amount;
  }

  for (const key of input.eventKeys) {
    const [, , event, source] = key.split(":");

    if (event === "buy_view") {
      row(source || "direct").buyViews += 1;
    } else if (event === "checkout") {
      row(source || "direct").checkouts += 1;
    }
  }

  for (const key of input.statKeys) {
    const parts = key.split(":");

    if (parts[2] === "s") {
      row(parts[7] || "direct").sessions += 1;
    }
  }

  summary.gross = toRiyals(summary.gross);
  summary.fees = toRiyals(summary.fees);
  summary.commissions = toRiyals(summary.commissions);
  summary.net = Math.round(summary.net * 100) / 100;
  summary.spend = Math.round(summary.spend * 100) / 100;
  summary.profit = Math.round((summary.net - summary.spend) * 100) / 100;

  summary.days = Array.from({ length: 30 }, (_, offset) => {
    const date = riyadhDate(now - (29 - offset) * DAY_MS);
    const day = dayMap.get(date);

    return {
      date,
      sales: day?.sales ?? 0,
      net: Math.round((day?.net ?? 0) * 100) / 100,
    };
  });

  summary.sources = [...rows.values()]
    .map((value) => ({
      ...value,
      gross: Math.round(value.gross * 100) / 100,
      net: Math.round(value.net * 100) / 100,
      spend: Math.round(value.spend * 100) / 100,
    }))
    .sort((a, b) => b.net - a.net || b.sessions - a.sessions);

  return summary;
}

export async function loadMoneySummary(store: KvStore) {
  const [saleKeys, spendKeys, eventKeys, statKeys] = await Promise.all([
    listKeys(store, SALE_PREFIX),
    listKeys(store, SPEND_PREFIX),
    listKeys(store, EVENT_PREFIX),
    listKeys(store, STAT_PREFIX),
  ]);

  const [sales, spends] = await Promise.all([
    readAll<Sale>(store, saleKeys),
    readAll<Spend>(store, spendKeys),
  ]);

  return summarizeMoney({ sales, spends, eventKeys, statKeys });
}

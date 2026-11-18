import type { KvStore } from "@/lib/messageStore";
import { PRICING, getCurrentPrice, toHalalas } from "@/lib/pricing";

const PREFIX = "ref:";
const SALE_PREFIX = "refsale:";

export const REF_COOKIE = "kn_ref";

export type Referral = {
  code: string;
  name: string;
  discount: number;
  commission: number;
  createdAt: string;
  sales: number;
  earned: number;
  paid: number;
};

export function normalizeRefCode(input: unknown) {
  if (typeof input !== "string") {
    return null;
  }

  const code = input.toUpperCase().replace(/[\s-]/g, "");

  return /^[A-Z0-9]{3,16}$/.test(code) ? code : null;
}

export function maxDiscount() {
  return Math.max(0, getCurrentPrice() - 1);
}

export async function getReferral(store: KvStore, input: unknown) {
  const code = normalizeRefCode(input);

  if (!code) {
    return null;
  }

  const raw = await store.get(`${PREFIX}${code}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Referral;
  } catch {
    return null;
  }
}

async function saveReferral(store: KvStore, referral: Referral) {
  await store.put(`${PREFIX}${referral.code}`, JSON.stringify(referral));
}

export async function createReferral(
  store: KvStore,
  {
    code,
    name,
    discount,
    commission,
    now = Date.now(),
  }: {
    code: string;
    name: string;
    discount: number;
    commission: number;
    now?: number;
  },
) {
  const clean = normalizeRefCode(code);

  if (!clean || (await getReferral(store, clean))) {
    return null;
  }

  const referral: Referral = {
    code: clean,
    name: name.trim().slice(0, 80),
    discount: Math.min(Math.max(0, Math.floor(discount)), maxDiscount()),
    commission: Math.min(
      Math.max(0, Math.floor(commission)),
      PRICING.basePrice,
    ),
    createdAt: new Date(now).toISOString(),
    sales: 0,
    earned: 0,
    paid: 0,
  };

  await saveReferral(store, referral);

  return referral;
}

export async function listReferrals(store: KvStore) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await store.list({ prefix: PREFIX, cursor });

    keys.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && keys.length < 500);

  const values = await Promise.all(keys.map((key) => store.get(key)));

  return values
    .map((value) => {
      try {
        return value ? (JSON.parse(value) as Referral) : null;
      } catch {
        return null;
      }
    })
    .filter((item): item is Referral => item !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteReferral(store: KvStore, code: string) {
  const clean = normalizeRefCode(code);

  if (clean) {
    await store.delete(`${PREFIX}${clean}`);
  }
}

export async function markReferralPaid(store: KvStore, code: string) {
  const referral = await getReferral(store, code);

  if (!referral) {
    return null;
  }

  referral.paid = referral.earned;
  await saveReferral(store, referral);

  return referral;
}

export async function recordReferralSale(
  store: KvStore,
  paymentId: string,
  code: unknown,
) {
  const referral = await getReferral(store, code);

  if (!referral || (await store.get(`${SALE_PREFIX}${paymentId}`))) {
    return false;
  }

  await store.put(
    `${SALE_PREFIX}${paymentId}`,
    JSON.stringify({
      code: referral.code,
      commission: referral.commission,
      at: new Date().toISOString(),
    }),
  );

  referral.sales += 1;
  referral.earned += referral.commission;
  await saveReferral(store, referral);

  return true;
}

export function lowestAmountFor(referral: Referral) {
  return toHalalas(Math.max(1, getCurrentPrice() - referral.discount));
}

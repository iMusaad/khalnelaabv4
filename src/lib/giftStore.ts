import type { KvStore } from "@/lib/messageStore";

const PREFIX = "gift:";
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

export type GiftCode = {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  note: string;
};

export function formatGiftCode(raw: string) {
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export function normalizeGiftCode(input: string) {
  const raw = input.toUpperCase().replace(/[\s-]/g, "");

  return raw.length === CODE_LENGTH &&
    [...raw].every((char) => ALPHABET.includes(char))
    ? raw
    : null;
}

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));

  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export async function createGift(
  store: KvStore,
  {
    days,
    maxUses,
    note,
    now = Date.now(),
  }: {
    days: number | null;
    maxUses: number | null;
    note: string;
    now?: number;
  },
) {
  let raw = randomCode();

  while (await store.get(`${PREFIX}${raw}`)) {
    raw = randomCode();
  }

  const gift: GiftCode = {
    code: raw,
    createdAt: new Date(now).toISOString(),
    expiresAt: days ? new Date(now + days * DAY_MS).toISOString() : null,
    maxUses,
    uses: 0,
    note,
  };

  await store.put(`${PREFIX}${raw}`, JSON.stringify(gift));

  return gift;
}

export async function listGifts(store: KvStore) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await store.list({ prefix: PREFIX, cursor });
    keys.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && keys.length < 500);

  const values = await Promise.all(
    keys.slice(0, 300).map((key) => store.get(key)),
  );

  return values
    .map((value) => {
      try {
        return value ? (JSON.parse(value) as GiftCode) : null;
      } catch {
        return null;
      }
    })
    .filter((gift): gift is GiftCode => gift !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteGift(store: KvStore, raw: string) {
  await store.delete(`${PREFIX}${raw}`);
}

export function giftStatus(gift: GiftCode, now = Date.now()) {
  if (gift.expiresAt && Date.parse(gift.expiresAt) < now) {
    return "expired" as const;
  }

  if (gift.maxUses !== null && gift.uses >= gift.maxUses) {
    return "used" as const;
  }

  return "active" as const;
}

export async function redeemGift(
  store: KvStore,
  raw: string,
  now = Date.now(),
) {
  const value = await store.get(`${PREFIX}${raw}`);

  if (!value) {
    return null;
  }

  let gift: GiftCode;

  try {
    gift = JSON.parse(value) as GiftCode;
  } catch {
    return null;
  }

  if (giftStatus(gift, now) !== "active") {
    return null;
  }

  gift.uses += 1;
  await store.put(`${PREFIX}${raw}`, JSON.stringify(gift));

  return gift;
}

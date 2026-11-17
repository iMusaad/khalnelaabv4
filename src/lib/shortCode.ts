import type { KvStore } from "@/lib/messageStore";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 8;
const CODE_PREFIX = "sc:";
const LICENSE_PREFIX = "scl:";

export function normalizeShortCode(input: string) {
  let raw = input.toUpperCase().replace(/[\s-]/g, "");

  if (raw.length === LENGTH + 2 && raw.startsWith("KN")) {
    raw = raw.slice(2);
  }

  return raw.length === LENGTH &&
    [...raw].every((char) => ALPHABET.includes(char))
    ? raw
    : null;
}

export function formatShortCode(raw: string) {
  return `KN-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));

  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export async function shortCodeForLicense(store: KvStore, licenseId: string) {
  const raw = await store.get(`${LICENSE_PREFIX}${licenseId}`);

  return raw ? formatShortCode(raw) : null;
}

export async function ensureShortCode(
  store: KvStore,
  paymentId: string,
  licenseId: string,
) {
  const existing = await shortCodeForLicense(store, licenseId);

  if (existing) {
    return existing;
  }

  let raw = randomCode();

  while (
    (await store.get(`${CODE_PREFIX}${raw}`)) ||
    (await store.get(`gift:${raw}`))
  ) {
    raw = randomCode();
  }

  await store.put(`${CODE_PREFIX}${raw}`, paymentId);
  await store.put(`${LICENSE_PREFIX}${licenseId}`, raw);

  return formatShortCode(raw);
}

export async function paymentForShortCode(store: KvStore, input: string) {
  const raw = normalizeShortCode(input);

  return raw ? store.get(`${CODE_PREFIX}${raw}`) : null;
}

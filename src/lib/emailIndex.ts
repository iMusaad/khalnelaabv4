import type { KvStore } from "@/lib/messageStore";

const PREFIX = "em:";
const MAX_PAYMENTS = 10;

const encoder = new TextEncoder();

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashEmail(email: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`email:${normalizeEmail(email)}`),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function paymentsForEmail(
  store: KvStore,
  email: string,
  secret: string,
): Promise<string[]> {
  const value = await store.get(`${PREFIX}${await hashEmail(email, secret)}`);

  if (!value) {
    return [];
  }

  try {
    const ids = JSON.parse(value);

    return Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export async function linkPaymentToEmail(
  store: KvStore,
  email: string,
  paymentId: string,
  secret: string,
) {
  const ids = await paymentsForEmail(store, email, secret);

  if (ids.includes(paymentId)) {
    return;
  }

  await store.put(
    `${PREFIX}${await hashEmail(email, secret)}`,
    JSON.stringify([paymentId, ...ids].slice(0, MAX_PAYMENTS)),
  );
}

export async function unlinkEmail(
  store: KvStore,
  email: string,
  secret: string,
) {
  await store.delete(`${PREFIX}${await hashEmail(email, secret)}`);
}

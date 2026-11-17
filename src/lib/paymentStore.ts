import type { KvStore } from "@/lib/messageStore";
import { isValidPaymentId, type MoyasarPayment } from "@/lib/payment";

const PREFIX = "pay:";

export async function savePayment(store: KvStore, payment: MoyasarPayment) {
  if (!isValidPaymentId(payment.id)) {
    return;
  }

  await store.put(
    `${PREFIX}${payment.id}`,
    JSON.stringify({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    }),
  );
}

export async function getStoredPayment(
  store: KvStore,
  id: string,
): Promise<MoyasarPayment | null> {
  if (!isValidPaymentId(id)) {
    return null;
  }

  const value = await store.get(`${PREFIX}${id}`);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as MoyasarPayment;
  } catch {
    return null;
  }
}

export function webhookSecretMatches(input: unknown) {
  const expected = process.env.MOYASAR_WEBHOOK_SECRET;

  if (
    !expected ||
    typeof input !== "string" ||
    input.length !== expected.length
  ) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ input.charCodeAt(i);
  }

  return diff === 0;
}

import type { KvStore } from "@/lib/messageStore";
import { PRICING, isAcceptedAmount, toHalalas } from "@/lib/pricing";
import { getReferral, lowestAmountFor } from "@/lib/referral";

export type MoyasarPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string> | null;
};

export function isPaidPurchase(payment: MoyasarPayment) {
  return (
    payment.status === "paid" &&
    payment.currency === PRICING.currency &&
    isAcceptedAmount(payment.amount)
  );
}

export async function isPaidPurchaseWithReferral(
  payment: MoyasarPayment,
  store: KvStore | null,
) {
  if (isPaidPurchase(payment)) {
    return true;
  }

  const ref = payment.metadata?.ref;

  if (
    payment.status !== "paid" ||
    payment.currency !== PRICING.currency ||
    !ref ||
    !store
  ) {
    return false;
  }

  const referral = await getReferral(store, ref);

  return Boolean(
    referral &&
    payment.amount >= lowestAmountFor(referral) &&
    payment.amount <= toHalalas(PRICING.basePrice),
  );
}

export function isValidPaymentId(id: string) {
  return /^[A-Za-z0-9_-]{8,64}$/.test(id);
}

export async function fetchMoyasarPayment(
  id: string,
): Promise<MoyasarPayment | null> {
  const secretKey = process.env.MOYASAR_SECRET_KEY;

  if (!secretKey || !isValidPaymentId(id)) {
    return null;
  }

  const base = process.env.MOYASAR_API_BASE || "https://api.moyasar.com/v1";

  try {
    const response = await fetch(`${base}/payments/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Basic ${btoa(`${secretKey}:`)}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MoyasarPayment;
  } catch {
    return null;
  }
}

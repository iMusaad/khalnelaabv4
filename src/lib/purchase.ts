import { getMessageStore } from "@/lib/messageStore";
import { createLicenseCode, derivePurchaseId, toHex } from "@/lib/license";
import {
  fetchMoyasarPayment,
  isPaidPurchaseWithReferral,
  type MoyasarPayment,
} from "@/lib/payment";
import { recordSale } from "@/lib/money";
import { getStoredPayment } from "@/lib/paymentStore";
import { recordReferralSale } from "@/lib/referral";
import { ensureShortCode } from "@/lib/shortCode";

export async function findPaidPayment(
  id: string,
): Promise<MoyasarPayment | null> {
  const store = await getMessageStore();

  if (store) {
    const stored = await getStoredPayment(store, id);

    if (stored && (await isPaidPurchaseWithReferral(stored, store))) {
      return stored;
    }
  }

  const fetched = await fetchMoyasarPayment(id);

  if (!fetched || !(await isPaidPurchaseWithReferral(fetched, store))) {
    return null;
  }

  if (store && fetched.metadata?.ref) {
    await recordReferralSale(store, fetched.id, fetched.metadata.ref);
  }

  if (store) {
    await recordSale(store, fetched).catch(() => {});
  }

  return fetched;
}

export async function licenseForPayment(paymentId: string) {
  const secret = process.env.LICENSE_SECRET;

  if (!secret) {
    return null;
  }

  return createLicenseCode({
    type: "purchase",
    id: await derivePurchaseId(secret, paymentId),
    secret,
  });
}

export async function licenseIdForPayment(paymentId: string) {
  const secret = process.env.LICENSE_SECRET;

  return secret ? toHex(await derivePurchaseId(secret, paymentId)) : null;
}

export async function displayCodeForPayment(paymentId: string) {
  const store = await getMessageStore();
  const licenseId = await licenseIdForPayment(paymentId);

  if (store && licenseId) {
    return ensureShortCode(store, paymentId, licenseId);
  }

  return licenseForPayment(paymentId);
}

export function canConfirmPayments() {
  return Boolean(
    process.env.MOYASAR_SECRET_KEY || process.env.MOYASAR_WEBHOOK_SECRET,
  );
}

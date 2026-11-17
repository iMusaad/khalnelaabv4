import { getMessageStore } from "@/lib/messageStore";
import { createLicenseCode, derivePurchaseId } from "@/lib/license";
import {
  fetchMoyasarPayment,
  isPaidPurchase,
  type MoyasarPayment,
} from "@/lib/payment";
import { getStoredPayment } from "@/lib/paymentStore";

export async function findPaidPayment(
  id: string,
): Promise<MoyasarPayment | null> {
  const store = await getMessageStore();

  if (store) {
    const stored = await getStoredPayment(store, id);

    if (stored && isPaidPurchase(stored)) {
      return stored;
    }
  }

  const fetched = await fetchMoyasarPayment(id);

  return fetched && isPaidPurchase(fetched) ? fetched : null;
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

export function canConfirmPayments() {
  return Boolean(
    process.env.MOYASAR_SECRET_KEY || process.env.MOYASAR_WEBHOOK_SECRET,
  );
}

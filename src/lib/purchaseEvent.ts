export const PURCHASE_COOKIE = "kn_purchase";

export function parsePurchaseCookie(value: string) {
  const match = /^([A-Za-z0-9_-]{8,64})\.(\d{1,7})$/.exec(value);

  return match ? { id: match[1], amount: Number(match[2]) } : null;
}

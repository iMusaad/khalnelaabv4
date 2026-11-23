export const PRICING = {
  currency: "SAR",
  basePrice: 59,
  salePrice: 49,
  saleEndsAt: Date.parse("2027-01-01T00:00:00+03:00"),
};

export function isOnSale(now = Date.now()) {
  return now < PRICING.saleEndsAt;
}

export function getCurrentPrice(now = Date.now()) {
  return isOnSale(now) ? PRICING.salePrice : PRICING.basePrice;
}

export function toHalalas(riyals: number) {
  return Math.round(riyals * 100);
}

export function isAcceptedAmount(halalas: number) {
  return [PRICING.salePrice, PRICING.basePrice]
    .map(toHalalas)
    .includes(halalas);
}

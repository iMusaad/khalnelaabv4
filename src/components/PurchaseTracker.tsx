"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { PURCHASE_COOKIE, parsePurchaseCookie } from "@/lib/purchaseEvent";
import { readCookie } from "@/lib/track";

const SENT_KEY = "kn_purchase_sent";

export default function PurchaseTracker() {
  useEffect(() => {
    const purchase = parsePurchaseCookie(readCookie(PURCHASE_COOKIE));

    document.cookie = `${PURCHASE_COOKIE}=; path=/; max-age=0`;

    if (!purchase) {
      return;
    }

    try {
      if (window.localStorage.getItem(SENT_KEY) === purchase.id) {
        return;
      }

      window.localStorage.setItem(SENT_KEY, purchase.id);
    } catch {}

    trackEvent("purchase", {
      transaction_id: purchase.id,
      value: purchase.amount / 100,
      currency: "SAR",
      items: [
        {
          item_id: "full-game",
          item_name: "خل نلعب",
          price: purchase.amount / 100,
          quantity: 1,
        },
      ],
    });
  }, []);

  return null;
}

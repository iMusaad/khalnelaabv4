import { NextResponse, type NextRequest } from "next/server";
import { claimDevice, setDeviceCookie } from "@/lib/devices";
import { normalizeGiftCode, redeemGift } from "@/lib/giftStore";
import {
  createLicenseCode,
  getLicenseSecrets,
  randomId,
  verifyLicenseCode,
} from "@/lib/license";
import { LICENSE_COOKIE, LICENSE_COOKIE_OPTIONS } from "@/lib/licenseCookie";
import { getMessageStore } from "@/lib/messageStore";
import { licenseForPayment } from "@/lib/purchase";
import { normalizeShortCode, paymentForShortCode } from "@/lib/shortCode";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

async function redeemShortGift(input: string) {
  const raw = normalizeGiftCode(input);
  const secret = process.env.GIFT_SECRET;

  if (!raw || !secret) {
    return null;
  }

  const store = await getMessageStore();

  if (!store) {
    return null;
  }

  const gift = await redeemGift(store, raw);

  if (!gift) {
    return null;
  }

  const expiresAt = gift.expiresAt ? new Date(gift.expiresAt) : null;

  const code = await createLicenseCode({
    type: "gift",
    id: randomId(),
    secret,
    validDays: expiresAt
      ? Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS))
      : undefined,
  });

  return { code, expiresAt };
}

async function purchaseCodeFromShort(input: string) {
  if (!normalizeShortCode(input)) {
    return null;
  }

  const store = await getMessageStore();
  const paymentId = store ? await paymentForShortCode(store, input) : null;

  return paymentId ? licenseForPayment(paymentId) : null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;

  const input = typeof body?.code === "string" ? body.code.slice(0, 80) : "";

  let code = input.trim().toUpperCase();
  let expiresAt: Date | null = null;
  let deviceId: string | null = null;

  const purchaseCode = await purchaseCodeFromShort(input);
  const gift = purchaseCode ? null : await redeemShortGift(input);

  if (gift) {
    code = gift.code;
    expiresAt = gift.expiresAt;
  } else {
    const check = await verifyLicenseCode(
      purchaseCode ?? input,
      getLicenseSecrets(),
    );

    if (!check.valid) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (purchaseCode) {
      code = purchaseCode;
    }

    expiresAt = check.expiresAt;

    if (check.type === "purchase") {
      const device = await claimDevice(request, check.id);

      if (!device.allowed) {
        return NextResponse.json(
          { ok: false, reason: "devices" },
          { status: 403 },
        );
      }

      deviceId = device.deviceId;
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(LICENSE_COOKIE, code, {
    ...LICENSE_COOKIE_OPTIONS,
    ...(expiresAt
      ? {
          maxAge: Math.max(
            60,
            Math.floor((expiresAt.getTime() - Date.now()) / 1000),
          ),
        }
      : {}),
  });

  if (deviceId) {
    setDeviceCookie(response, deviceId);
  }

  return response;
}

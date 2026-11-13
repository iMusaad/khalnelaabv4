import { NextResponse, type NextRequest } from "next/server";
import { normalizeGiftCode, redeemGift } from "@/lib/giftStore";
import {
  createLicenseCode,
  getLicenseSecrets,
  randomId,
  verifyLicenseCode,
} from "@/lib/license";
import { LICENSE_COOKIE, LICENSE_COOKIE_OPTIONS } from "@/lib/licenseCookie";
import { getMessageStore } from "@/lib/messageStore";

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

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;

  const input = typeof body?.code === "string" ? body.code.slice(0, 80) : "";

  let code = input.trim().toUpperCase();
  let expiresAt: Date | null = null;

  const gift = await redeemShortGift(input);

  if (gift) {
    code = gift.code;
    expiresAt = gift.expiresAt;
  } else {
    const check = await verifyLicenseCode(input, getLicenseSecrets());

    if (!check.valid) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    expiresAt = check.expiresAt;
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

  return response;
}

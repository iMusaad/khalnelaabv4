import { NextResponse, type NextRequest } from "next/server";
import { isEmailEnabled, isValidEmail, sendLicenseEmail } from "@/lib/email";
import { linkPaymentToEmail, normalizeEmail } from "@/lib/emailIndex";
import { getLicenseSecrets, verifyLicenseCode } from "@/lib/license";
import { LICENSE_COOKIE } from "@/lib/licenseCookie";
import { getMessageStore } from "@/lib/messageStore";
import { isValidPaymentId } from "@/lib/payment";
import { displayCodeForPayment, licenseIdForPayment } from "@/lib/purchase";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

const SENT_PREFIX = "emsent:";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    paymentId?: unknown;
    email?: unknown;
  } | null;

  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
  const email =
    typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const secret = process.env.LICENSE_SECRET;
  const store = await getMessageStore();

  if (!isEmailEnabled() || !secret || !store) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  if (!isValidPaymentId(paymentId) || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  }

  const check = await verifyLicenseCode(
    request.cookies.get(LICENSE_COOKIE)?.value ?? "",
    getLicenseSecrets(),
  );

  if (
    !check.valid ||
    check.type !== "purchase" ||
    check.id !== (await licenseIdForPayment(paymentId))
  ) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const sentKey = `${SENT_PREFIX}${paymentId}`;

  if (await store.get(sentKey)) {
    return NextResponse.json({ ok: false, error: "sent" }, { status: 409 });
  }

  const code = await displayCodeForPayment(paymentId);

  if (!code) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  await linkPaymentToEmail(store, email, paymentId, secret);

  const sent = await sendLicenseEmail({
    to: email,
    code,
    origin: getSiteOrigin(request.nextUrl.origin),
  });

  if (sent) {
    await store.put(sentKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
  }

  return NextResponse.json({ ok: sent });
}

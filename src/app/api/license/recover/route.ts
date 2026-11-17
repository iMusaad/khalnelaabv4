import { NextResponse, type NextRequest } from "next/server";
import { isEmailEnabled, isValidEmail, sendLicenseEmail } from "@/lib/email";
import { paymentsForEmail } from "@/lib/emailIndex";
import { getMessageStore, isRateLimited } from "@/lib/messageStore";
import { licenseForPayment } from "@/lib/purchase";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const store = await getMessageStore();
  const secret = process.env.LICENSE_SECRET;

  if (!store || !secret || !isEmailEnabled()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (await isRateLimited(store, `recover:${ip}`)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const [paymentId] = await paymentsForEmail(store, email, secret);
  const code = paymentId ? await licenseForPayment(paymentId) : null;

  if (code) {
    await sendLicenseEmail({
      to: email,
      code,
      origin: getSiteOrigin(request.nextUrl.origin),
    });
  }

  return NextResponse.json({ ok: true });
}

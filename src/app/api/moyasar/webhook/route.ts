import { NextResponse, type NextRequest } from "next/server";
import { isValidEmail, sendLicenseEmail } from "@/lib/email";
import { linkPaymentToEmail } from "@/lib/emailIndex";
import { getMessageStore, isRateLimited } from "@/lib/messageStore";
import { isPaidPurchase, type MoyasarPayment } from "@/lib/payment";
import { savePayment, webhookSecretMatches } from "@/lib/paymentStore";
import { displayCodeForPayment } from "@/lib/purchase";
import { notifyOwner } from "@/lib/telegram";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const raw = (await request.text().catch(() => "")).slice(0, 4000);

  let body: {
    type?: unknown;
    secret_token?: unknown;
    data?: MoyasarPayment;
  } | null = null;

  try {
    body = JSON.parse(raw);
  } catch {}

  const isPaymentEvent =
    body?.type === "payment_paid" && typeof body.data?.id === "string";

  const isVerification = body?.type === "webhook_verification";

  if (!isPaymentEvent && !isVerification) {
    return NextResponse.json({ ok: true });
  }

  if (isVerification) {
    const store = await getMessageStore();

    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

    const safeBody = JSON.stringify(
      { ...body, secret_token: undefined },
      null,
      1,
    );

    if (store && !(await isRateLimited(store, `hook:${ip}`))) {
      await store.put(
        "hook:last",
        JSON.stringify({
          at: new Date().toISOString(),
          body: safeBody.slice(0, 2000),
        }),
        { expirationTtl: 60 * 60 * 24 * 7 },
      );
      await notifyOwner(store, `إشعار من ميسر:\n\n${safeBody.slice(0, 1500)}`);
    }

    return NextResponse.json({ ok: true });
  }

  if (!webhookSecretMatches(body?.secret_token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = body?.data;

  if (!payment || !isPaidPurchase(payment)) {
    return NextResponse.json({ ok: true });
  }

  const store = await getMessageStore();

  if (!store) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  await savePayment(store, payment);

  const email = payment.metadata?.email;
  const licenseSecret = process.env.LICENSE_SECRET;

  if (email && isValidEmail(email) && licenseSecret) {
    await linkPaymentToEmail(store, email, payment.id, licenseSecret);
  }
  const code = await displayCodeForPayment(payment.id);

  if (email && code) {
    await sendLicenseEmail({
      to: email,
      code,
      origin: getSiteOrigin(request.nextUrl.origin),
    });
  }

  return NextResponse.json({ ok: true });
}

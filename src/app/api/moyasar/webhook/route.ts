import { NextResponse, type NextRequest } from "next/server";
import { sendLicenseEmail } from "@/lib/email";
import { getMessageStore } from "@/lib/messageStore";
import { isPaidPurchase, type MoyasarPayment } from "@/lib/payment";
import { savePayment, webhookSecretMatches } from "@/lib/paymentStore";
import { licenseForPayment } from "@/lib/purchase";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    type?: unknown;
    secret_token?: unknown;
    data?: MoyasarPayment;
  } | null;

  if (!webhookSecretMatches(body?.secret_token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const payment = body?.data;

  if (body?.type !== "payment_paid" || !payment || !isPaidPurchase(payment)) {
    return NextResponse.json({ ok: true });
  }

  const store = await getMessageStore();

  if (!store) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  await savePayment(store, payment);

  const email = payment.metadata?.email;
  const code = email ? await licenseForPayment(payment.id) : null;

  if (email && code) {
    await sendLicenseEmail({
      to: email,
      code,
      origin: getSiteOrigin(request.nextUrl.origin),
    });
  }

  return NextResponse.json({ ok: true });
}

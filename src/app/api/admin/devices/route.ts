import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import { resetDevices } from "@/lib/devices";
import { paymentsForEmail } from "@/lib/emailIndex";
import { getLicenseSecrets, verifyLicenseCode } from "@/lib/license";
import { getMessageStore, type KvStore } from "@/lib/messageStore";
import { licenseIdForPayment } from "@/lib/purchase";
import { paymentForShortCode } from "@/lib/shortCode";

export const dynamic = "force-dynamic";

async function licenseIdsFor(store: KvStore, input: string) {
  const secret = process.env.LICENSE_SECRET;

  if (input.includes("@")) {
    if (!secret) {
      return [];
    }

    const payments = await paymentsForEmail(store, input, secret);
    const ids = await Promise.all(payments.map(licenseIdForPayment));

    return ids.filter((id): id is string => Boolean(id));
  }

  const shortPayment = await paymentForShortCode(store, input);

  if (shortPayment) {
    const id = await licenseIdForPayment(shortPayment);

    return id ? [id] : [];
  }

  const check = await verifyLicenseCode(input, getLicenseSecrets());

  return check.valid && check.type === "purchase" ? [check.id] : [];
}

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    query?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password, request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const query =
    typeof body?.query === "string" ? body.query.trim().slice(0, 200) : "";
  const ids = query ? await licenseIdsFor(store, query) : [];

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, found: false });
  }

  let cleared = 0;

  for (const id of ids) {
    cleared += await resetDevices(store, id);
  }

  return NextResponse.json({ ok: true, found: true, cleared });
}

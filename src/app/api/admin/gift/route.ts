import { NextResponse, type NextRequest } from "next/server";
import { adminPasswordMatches } from "@/lib/adminAuth";
import { createLicenseCode, randomId } from "@/lib/license";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const giftSecret = process.env.GIFT_SECRET;

  if (!adminPassword || !giftSecret) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    days?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const days = Number(body?.days);
  const validDays =
    Number.isInteger(days) && days > 0 && days <= 3650 ? days : undefined;

  const code = await createLicenseCode({
    type: "gift",
    id: randomId(),
    secret: giftSecret,
    validDays,
  });

  return NextResponse.json({ ok: true, code, validDays: validDays ?? null });
}

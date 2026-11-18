import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import { getMessageStore } from "@/lib/messageStore";
import {
  createReferral,
  deleteReferral,
  listReferrals,
  markReferralPaid,
} from "@/lib/referral";

export const dynamic = "force-dynamic";

function wholeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    action?: unknown;
    code?: unknown;
    name?: unknown;
    discount?: unknown;
    commission?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password, request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const code = typeof body?.code === "string" ? body.code : "";
  let error = "";

  if (body?.action === "create") {
    const created = await createReferral(store, {
      code,
      name: typeof body.name === "string" ? body.name : "",
      discount: wholeNumber(body.discount),
      commission: wholeNumber(body.commission),
    });

    if (!created) {
      error = "الكود غير صالح أو مستخدم";
    }
  }

  if (body?.action === "paid") {
    await markReferralPaid(store, code);
  }

  if (body?.action === "delete") {
    await deleteReferral(store, code);
  }

  return NextResponse.json({
    ok: true,
    error,
    referrals: await listReferrals(store),
  });
}

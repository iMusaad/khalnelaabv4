import { NextResponse, type NextRequest } from "next/server";
import { getMessageStore, isRateLimited } from "@/lib/messageStore";
import { REF_COOKIE, getReferral } from "@/lib/referral";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (await isRateLimited(store, `refcheck:${ip}`)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;

  const referral = await getReferral(store, body?.code);

  if (!referral) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    code: referral.code,
    discount: referral.discount,
  });

  response.cookies.set(REF_COOKIE, referral.code, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

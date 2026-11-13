import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import { getMessageStore } from "@/lib/messageStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    messages: Boolean(await getMessageStore()),
    gifts: Boolean(process.env.GIFT_SECRET) && Boolean(await getMessageStore()),
  });
}

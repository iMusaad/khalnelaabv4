import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import { getMessageStore } from "@/lib/messageStore";
import { loadStatSummary } from "@/lib/sessionStats";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password, request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, stats: await loadStatSummary(store) });
}

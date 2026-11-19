import { NextResponse, type NextRequest } from "next/server";
import { getMessageStore } from "@/lib/messageStore";
import { parseStatEvent, recordStat } from "@/lib/sessionStats";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const event = parseStatEvent(await request.json().catch(() => null));

  if (!event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store = await getMessageStore();

  if (store) {
    await recordStat(store, event).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { SOURCE_COOKIE } from "@/lib/attribution";
import { getMessageStore } from "@/lib/messageStore";
import {
  FUNNEL_EVENTS,
  recordFunnelEvent,
  type FunnelEvent,
} from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    event?: unknown;
  } | null;

  const event = FUNNEL_EVENTS.find((item) => item === body?.event) as
    FunnelEvent | undefined;

  if (!event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const store = await getMessageStore();

  if (store) {
    await recordFunnelEvent(
      store,
      event,
      request.cookies.get(SOURCE_COOKIE)?.value ?? "",
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import {
  getMessageStore,
  isRateLimited,
  newMessageId,
  saveMessage,
} from "@/lib/messageStore";
import { notifyNewMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (clean(body?.website, 100)) {
    return NextResponse.json({ ok: true });
  }

  const game = clean(body?.game, 60);
  const item = clean(body?.item, 400);
  const message = clean(body?.message, 1000);

  if (!game || !message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (await isRateLimited(store, `report:${ip}`)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const saved = {
    id: newMessageId(),
    createdAt: new Date().toISOString(),
    name: `بلاغ: ${game}`,
    email: "",
    phone: "",
    message: item ? `${message}\n\nالمحتوى: ${item}` : message,
  };

  await saveMessage(store, saved);
  await notifyNewMessage(store, saved);

  return NextResponse.json({ ok: true });
}

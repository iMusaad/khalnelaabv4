import { NextResponse, type NextRequest } from "next/server";
import {
  getMessageStore,
  isRateLimited,
  newMessageId,
  saveMessage,
} from "@/lib/messageStore";

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

  const name = clean(body?.name, 80);
  const message = clean(body?.message, 3000);

  if (!name || !message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (await isRateLimited(store, ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  await saveMessage(store, {
    id: newMessageId(),
    createdAt: new Date().toISOString(),
    name,
    email: clean(body?.email, 120),
    phone: clean(body?.phone, 40),
    message,
  });

  return NextResponse.json({ ok: true });
}

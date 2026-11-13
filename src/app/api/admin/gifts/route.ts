import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import {
  createGift,
  deleteGift,
  listGifts,
  normalizeGiftCode,
} from "@/lib/giftStore";
import { getMessageStore } from "@/lib/messageStore";

export const dynamic = "force-dynamic";

function wholeNumber(value: unknown, max: number) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 && number <= max
    ? number
    : null;
}

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured() || !process.env.GIFT_SECRET) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    action?: unknown;
    days?: unknown;
    maxUses?: unknown;
    note?: unknown;
    code?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let created = null;

  if (body?.action === "create") {
    created = await createGift(store, {
      days: wholeNumber(body.days, 3650),
      maxUses: wholeNumber(body.maxUses, 10000),
      note: typeof body.note === "string" ? body.note.trim().slice(0, 80) : "",
    });
  }

  if (body?.action === "delete" && typeof body.code === "string") {
    const raw = normalizeGiftCode(body.code);

    if (raw) {
      await deleteGift(store, raw);
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    gifts: await listGifts(store),
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import {
  deleteMessage,
  getMessageStore,
  listMessages,
} from "@/lib/messageStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    deleteId?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (
    typeof body?.deleteId === "string" &&
    /^[\w-]{1,40}$/.test(body.deleteId)
  ) {
    await deleteMessage(store, body.deleteId);
  }

  return NextResponse.json({ ok: true, messages: await listMessages(store) });
}

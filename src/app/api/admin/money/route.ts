import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, adminPasswordMatches } from "@/lib/adminAuth";
import { getMessageStore } from "@/lib/messageStore";
import {
  addExpense,
  addSpend,
  deleteExpense,
  deleteSpend,
  loadMoneySummary,
  parseExpense,
  parseSpend,
} from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const store = await getMessageStore();

  if (!store || !adminConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
    action?: unknown;
    spend?: unknown;
    expense?: unknown;
    id?: unknown;
  } | null;

  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await adminPasswordMatches(password, request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let error = "";

  if (body?.action === "addSpend") {
    const spend = parseSpend(body.spend);

    if (spend) {
      await addSpend(store, spend);
    } else {
      error = "تأكد من التاريخ والمبلغ والمنصة";
    }
  }

  if (body?.action === "deleteSpend") {
    await deleteSpend(store, body.id);
  }

  if (body?.action === "addExpense") {
    const expense = parseExpense(body.expense);

    if (expense) {
      await addExpense(store, expense);
    } else {
      error = "تأكد من التاريخ والمبلغ والنوع";
    }
  }

  if (body?.action === "deleteExpense") {
    await deleteExpense(store, body.id);
  }

  return NextResponse.json({
    ok: true,
    error,
    money: await loadMoneySummary(store),
  });
}

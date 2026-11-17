import { NextResponse, type NextRequest } from "next/server";
import { claimDevice, setDeviceCookie } from "@/lib/devices";
import { LICENSE_COOKIE, LICENSE_COOKIE_OPTIONS } from "@/lib/licenseCookie";
import { isValidPaymentId } from "@/lib/payment";
import {
  displayCodeForPayment,
  findPaidPayment,
  licenseForPayment,
  licenseIdForPayment,
} from "@/lib/purchase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
  } | null;

  const id = typeof body?.id === "string" ? body.id.trim() : "";

  if (!isValidPaymentId(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payment = await findPaidPayment(id);

  if (!payment) {
    return NextResponse.json({ ok: false, pending: true }, { status: 202 });
  }

  const code = await licenseForPayment(payment.id);
  const licenseId = await licenseIdForPayment(payment.id);

  if (!code || !licenseId) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const device = await claimDevice(request, licenseId);

  if (device.allowed) {
    await displayCodeForPayment(payment.id);
  }

  if (!device.allowed) {
    return NextResponse.json({ ok: false, reason: "devices" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(LICENSE_COOKIE, code, LICENSE_COOKIE_OPTIONS);
  setDeviceCookie(response, device.deviceId);

  return response;
}

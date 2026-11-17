import { NextResponse, type NextRequest } from "next/server";
import { claimDevice, setDeviceCookie } from "@/lib/devices";
import { sendLicenseEmail } from "@/lib/email";
import { LICENSE_COOKIE, LICENSE_COOKIE_OPTIONS } from "@/lib/licenseCookie";
import { isValidPaymentId } from "@/lib/payment";
import {
  canConfirmPayments,
  findPaidPayment,
  licenseForPayment,
  licenseIdForPayment,
} from "@/lib/purchase";
import { getSiteOrigin } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.nextUrl.origin), 303);
}

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("id") ?? "";
  const status = request.nextUrl.searchParams.get("status");
  const from = request.nextUrl.searchParams.get("from");
  const restore = from === "restore";
  const failedPath = restore ? "/unlock?error=payment" : "/buy?error=payment";

  if (!process.env.LICENSE_SECRET || !canConfirmPayments()) {
    return redirectTo(request, "/buy?error=config");
  }

  if (!isValidPaymentId(paymentId) || (status && status !== "paid")) {
    return redirectTo(request, failedPath);
  }

  const payment = await findPaidPayment(paymentId);

  if (!payment) {
    const params = new URLSearchParams({ id: paymentId });

    if (restore) {
      params.set("from", "restore");
    }

    return redirectTo(request, `/buy/pending?${params}`);
  }

  const code = await licenseForPayment(payment.id);
  const licenseId = await licenseIdForPayment(payment.id);

  if (!code || !licenseId) {
    return redirectTo(request, "/buy?error=config");
  }

  const device = await claimDevice(request, licenseId);

  if (!device.allowed) {
    return redirectTo(request, "/unlock?error=devices");
  }

  const email = payment.metadata?.email;

  if (email && !restore && !process.env.MOYASAR_WEBHOOK_SECRET) {
    await sendLicenseEmail({
      to: email,
      code,
      origin: getSiteOrigin(request.nextUrl.origin),
    });
  }

  const response = redirectTo(request, "/buy/success");
  response.cookies.set(LICENSE_COOKIE, code, LICENSE_COOKIE_OPTIONS);
  setDeviceCookie(response, device.deviceId);

  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { getLicenseSecrets, verifyLicenseCode } from "@/lib/license";
import { LICENSE_COOKIE, isPaywallEnabled } from "@/lib/licenseCookie";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isPaywallEnabled()) {
    return NextResponse.json({ paid: true });
  }

  const code = request.cookies.get(LICENSE_COOKIE)?.value;
  const check = code
    ? await verifyLicenseCode(code, getLicenseSecrets())
    : { valid: false };

  return NextResponse.json({ paid: check.valid });
}

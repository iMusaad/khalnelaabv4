import { NextResponse, type NextRequest } from "next/server";
import { getLicenseSecrets, verifyLicenseCode } from "@/lib/license";
import { LICENSE_COOKIE, isPaywallEnabled } from "@/lib/licenseCookie";
import { isFreeGame } from "@/lib/trial";

export async function middleware(request: NextRequest) {
  if (!isPaywallEnabled()) {
    return NextResponse.next();
  }

  const code = request.cookies.get(LICENSE_COOKIE)?.value;

  if (code) {
    const check = await verifyLicenseCode(code, getLicenseSecrets());

    if (check.valid) {
      return NextResponse.next();
    }
  }

  const params = request.nextUrl.searchParams;
  const game = params.get("game");

  if (!game || isFreeGame(game, params.get("category"))) {
    return NextResponse.next();
  }

  const url = new URL("/buy", request.url);
  url.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/match", "/play"],
};

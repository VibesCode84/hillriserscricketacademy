import { NextResponse, type NextRequest } from "next/server";

/** HTTP Basic auth for the admin area. Set ADMIN_PASSWORD to enable access. */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME ?? "admin";
  if (!password) {
    return new NextResponse("Admin area disabled. Set ADMIN_PASSWORD to enable it.", { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const i = decoded.indexOf(":");
    if (i > -1 && timingSafeEqual(decoded.slice(0, i), username) && timingSafeEqual(decoded.slice(i + 1), password)) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Hillrisers admin", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

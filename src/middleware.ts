import { NextResponse, type NextRequest } from "next/server";

// Kept as "middleware" (Edge) rather than Next.js 16's "proxy": OpenNext on Cloudflare
// supports Edge middleware; Node.js proxy support there is still experimental.

const HUB_HOSTS = ["hillrisers.co.uk", "www.hillrisers.co.uk"];
const CRICKET_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cricket.hillrisers.co.uk").replace(/\/$/, "");

/**
 * - hillrisers.co.uk: "/" shows the HillRisers landing page; any other page
 *   is sent to the same path on the cricket academy site.
 * - Admin area: HTTP Basic auth (set ADMIN_PASSWORD to enable it).
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (HUB_HOSTS.includes(host)) {
    if (host.startsWith("www.")) return NextResponse.redirect(`https://hillrisers.co.uk${pathname}${search}`, 308);
    if (pathname === "/") return NextResponse.rewrite(new URL("/hillrisers", req.url));
    return NextResponse.redirect(`${CRICKET_URL}${pathname}${search}`, 308);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return adminAuth(req);
  return NextResponse.next();
}

function adminAuth(req: NextRequest) {
  // Trimmed: a pasted secret often picks up a trailing space or newline
  const password = process.env.ADMIN_PASSWORD?.trim();
  const username = (process.env.ADMIN_USERNAME?.trim() || "admin").toLowerCase();
  if (!password) {
    return new NextResponse("Admin area disabled. Set ADMIN_PASSWORD to enable it.", { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    // Browsers send UTF-8, so passwords with symbols such as £ decode correctly
    let decoded = "";
    try {
      decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
    } catch {
      decoded = "";
    }
    const i = decoded.indexOf(":");
    if (i > -1 && timingSafeEqual(decoded.slice(0, i).trim().toLowerCase(), username) && timingSafeEqual(decoded.slice(i + 1).trim(), password)) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="HillRisers admin", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Everything except build assets and images (those load the same on every address)
export const config = { matcher: ["/((?!_next/|images/|brand/|icon.svg|favicon.ico).*)"] };

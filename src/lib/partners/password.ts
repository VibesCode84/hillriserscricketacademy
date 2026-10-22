/**
 * Partner passwords: PBKDF2-SHA256 via Web Crypto (works on Cloudflare Workers and Node).
 * Stored as "pbkdf2$<iterations>$<salt>$<hash>" (base64url).
 */
const ITERATIONS = 100_000; // Cloudflare Workers' PBKDF2 maximum
export const MIN_PASSWORD_LENGTH = 8;

const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, "base64url"));

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt, ITERATIONS))}`;
}

export async function verifyPassword(password: string, stored: string | undefined) {
  const [scheme, iter, salt, hash] = (stored ?? "").split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const got = await derive(password, unb64(salt), Number(iter));
  const want = unb64(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
  return diff === 0;
}

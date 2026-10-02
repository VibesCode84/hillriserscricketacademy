import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors } from "./validation";

export function badRequest(message: string, errors?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, errors }, { status: 400 });
}

export async function parseJson<T extends z.ZodTypeAny>(req: Request, schema: T) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: badRequest("Invalid request") } as const;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: badRequest("Please check the highlighted fields", fieldErrors(parsed.error)) } as const;
  return { data: parsed.data as z.infer<T> } as const;
}

export function baseUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

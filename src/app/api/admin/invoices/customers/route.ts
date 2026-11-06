import { NextResponse } from "next/server";
import { parseJson } from "@/lib/http";
import { customerSchema } from "@/lib/validation";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/** Admin (behind the admin password, see middleware): add or update a customer */
export async function POST(req: Request) {
  const parsed = await parseJson(req, customerSchema);
  if ("error" in parsed) return parsed.error;
  const customer = await getPartnerStore().saveCustomer(parsed.data);
  return NextResponse.json({ ok: true, customer });
}

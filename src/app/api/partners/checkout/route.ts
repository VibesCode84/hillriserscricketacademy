import { NextResponse } from "next/server";
import { getBlock } from "@/data/partners";
import { isTestPartner } from "@/lib/partners/test-access";
import { parseJson } from "@/lib/http";
import { partnerCheckoutSchema } from "@/lib/validation";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";
import { sendRequestReceived } from "@/lib/partners/notify";

export const dynamic = "force-dynamic";

/** A booking request for the chosen nets (and bowling machine): HillRisers then approves it and sends the invoice */
export async function POST(req: Request) {
  const partner = await currentPartner();
  if (!partner) return NextResponse.json({ ok: false, message: "Please sign in again" }, { status: 401 });
  const parsed = await parseJson(req, partnerCheckoutSchema);
  if ("error" in parsed) return parsed.error;
  const { blockId, items, machineCoach, terms } = parsed.data;
  if (getBlock(blockId)?.test && !isTestPartner(partner.email)) return NextResponse.json({ ok: false, message: "That block isn't available." }, { status: 400 });
  const held = await getPartnerStore().reserve({ partnerId: partner.id, blockId, items, machineCoach, terms });
  if (!held.ok) return NextResponse.json({ ok: false, message: held.message, taken: held.keys }, { status: held.reason === "taken" ? 409 : 400 });
  await sendRequestReceived(held.booking);
  return NextResponse.json({ ok: true, url: `/partners/account?requested=${held.booking.id}` });
}

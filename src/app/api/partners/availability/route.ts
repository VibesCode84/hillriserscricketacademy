import { NextResponse } from "next/server";
import { getBlock, machineKey, slotKey } from "@/data/partners";
import { currentPartner } from "@/lib/partners/session";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

type NetState = "free" | "requested" | "booked";

/**
 * Live availability for a block, polled by the portal grid: each net is free (green), requested (amber:
 * a booking request or unpaid invoice) or booked (red: paid, documents in). `mine` marks the signed-in
 * partner's own nets. No personal data.
 */
export async function GET(req: Request) {
  const blockId = new URL(req.url).searchParams.get("block") ?? "";
  const block = getBlock(blockId);
  if (!block) return NextResponse.json({ ok: false }, { status: 404 });
  const partner = await currentPartner();
  const states = await getPartnerStore().netStates(blockId);
  const nets: Record<string, NetState> = {};
  const machines: Record<string, boolean> = {};
  const mine: string[] = [];
  for (const s of block.slots) {
    for (const n of s.nets) {
      const key = slotKey(blockId, s, n);
      const st = states.get(key);
      nets[key] = st?.state ?? "free";
      if (st && partner && st.partnerId === partner.id) mine.push(key);
    }
    machines[machineKey(blockId, s)] = states.has(machineKey(blockId, s));
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString(), nets, machines, mine }, { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { getBlock, machineKey, slotKey } from "@/data/partners";
import { getPartnerStore } from "@/lib/partners/store";

export const dynamic = "force-dynamic";

/**
 * Live availability for a block: which nets and which bowling-machine slots
 * are taken. Polled by the portal grid every few seconds. No personal data.
 */
export async function GET(req: Request) {
  const blockId = new URL(req.url).searchParams.get("block") ?? "";
  const block = getBlock(blockId);
  if (!block) return NextResponse.json({ ok: false }, { status: 404 });
  const taken = await getPartnerStore().taken(blockId);
  const nets: Record<string, boolean> = {};
  const machines: Record<string, boolean> = {};
  for (const s of block.slots) {
    for (const n of s.nets) nets[slotKey(blockId, s, n)] = taken.has(slotKey(blockId, s, n));
    machines[machineKey(blockId, s)] = taken.has(machineKey(blockId, s));
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString(), nets, machines }, { headers: { "Cache-Control": "no-store" } });
}

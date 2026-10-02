import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking";
import { sendTrialRequestConfirmation } from "@/lib/email";
import { baseUrl, parseJson } from "@/lib/http";
import { depositFor } from "@/data/academies";
import { continueWithoutDeposit, startDepositCheckout } from "@/lib/booking/deposit";
import { ageFromDob, recommend } from "@/lib/recommend";
import { trialRequestSchema } from "@/lib/validation";

/**
 * Trial request — used while the weekly programme (which academy runs on which
 * day) is being finalised. Saves the full player profile, and optionally starts
 * Checkout for a refundable holding deposit that secures the place.
 */
export async function POST(req: Request) {
  const parsed = await parseJson(req, trialRequestSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const rec = recommend({ age: ageFromDob(d.dateOfBirth), gender: d.gender, experience: d.experience, interest: d.interest });
  const store = getStore();
  const { parent, player } = await store.createProfile({
    parent: { name: d.parentName, email: d.email, mobile: d.mobile },
    player: {
      name: d.playerName,
      dateOfBirth: d.dateOfBirth,
      gender: d.gender,
      experience: d.experience,
      interest: d.interest,
      clubOrSchool: d.clubOrSchool || undefined,
      playingProfile: d.playingProfile || undefined,
      recommendedPathway: rec.pathway,
      heardAbout: d.heardAbout || undefined,
      emergencyContactName: d.emergencyContactName,
      emergencyContactPhone: d.emergencyContactPhone,
      medicalNotes: d.medicalNotes || undefined,
      photoConsent: d.photoConsent,
    },
  });
  const request = await store.createTrialRequest({
    parentId: parent.id,
    playerId: player.id,
    academy: d.academy,
    preferredDays: d.preferredDays,
    depositPence: d.withDeposit ? depositFor(d.academy) : undefined,
  });

  if (d.withDeposit) {
    try {
      const checkout = await startDepositCheckout(request, baseUrl(req));
      if (checkout) return NextResponse.json({ ok: true, id: request.id, checkoutUrl: checkout.url });
    } catch (err) {
      console.error("[hillrisers] deposit checkout failed", err);
    }
    // Payment unavailable: keep the request without a deposit
    await continueWithoutDeposit(request);
    return NextResponse.json({ ok: true, id: request.id, depositUnavailable: true });
  }

  try {
    await sendTrialRequestConfirmation({ parent, player, academyKey: d.academy, preferredDays: d.preferredDays });
  } catch (err) {
    console.error("[hillrisers] trial request email failed", err);
  }
  return NextResponse.json({ ok: true, id: request.id });
}

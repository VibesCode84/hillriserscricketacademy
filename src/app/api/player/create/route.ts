import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking";
import { parseJson } from "@/lib/http";
import { ageFromDob, recommend } from "@/lib/recommend";
import { profileSchema } from "@/lib/validation";

/** Step 1 — store the player profile. No payment yet. */
export async function POST(req: Request) {
  const parsed = await parseJson(req, profileSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const age = ageFromDob(d.dateOfBirth);
  const rec = recommend({ age, gender: d.gender, experience: d.experience, interest: d.interest });

  const { parent, player } = await getStore().createProfile({
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

  return NextResponse.json({
    ok: true,
    parentId: parent.id,
    playerId: player.id,
    age,
    pathway: rec.pathway,
    summary: rec.summary,
    recommendedSessionIds: rec.recommendations.map((r) => r.session.id),
  });
}

import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(20)
  .regex(/^[+\d][\d\s()-]+$/, "Please enter a valid phone number");

const dob = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a date of birth")
  .refine((v) => {
    const d = new Date(v);
    const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return !Number.isNaN(d.getTime()) && years >= 3 && years <= 18;
  }, "Please check the date of birth");

export const experienceSchema = z.enum(["new", "some", "regular", "performance"]);
export const interestSchema = z.enum(["batting", "seam", "spin", "all-round", "not-sure"]);
export const genderSchema = z.enum(["boy", "girl", "unspecified"]);

export const profileSchema = z.object({
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: phone,
  playerName: z.string().trim().min(2, "Please enter your child's name").max(100),
  dateOfBirth: dob,
  gender: genderSchema,
  experience: experienceSchema,
  interest: interestSchema,
  clubOrSchool: z.string().trim().max(120).optional(),
  playingProfile: z.string().trim().max(1000).optional(),
  heardAbout: z.string().trim().max(200).optional(),
  emergencyContactName: z.string().trim().min(2, "Please enter an emergency contact").max(100),
  emergencyContactPhone: phone,
  medicalNotes: z.string().trim().max(2000).optional(),
  photoConsent: z.boolean().default(false),
  safeguardingConsent: z.literal(true, {
    errorMap: () => ({ message: "Please confirm you have read the safeguarding and welfare information" }),
  }),
  termsConsent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms and conditions" }),
  }),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const trialRequestSchema = profileSchema.extend({
  academy: z.enum(["batting", "seam-bowling", "spin-bowling", "power", "performance", "girls", "little-cricketers"]),
  preferredDays: z.array(z.enum(["Wednesday", "Saturday", "Sunday"])).max(3).default([]),
  /** Pay a refundable holding deposit to secure the place */
  withDeposit: z.boolean().default(false),
});

export const createBookingSchema = z.object({
  playerId: z.string().uuid(),
  parentId: z.string().uuid(),
  sessionId: z.string().min(1),
  isTrial: z.boolean().default(true),
});

export const waitlistSchema = z.object({
  sessionId: z.string().min(1),
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  playerName: z.string().trim().min(2, "Please enter your child's name").max(100),
  dateOfBirth: dob,
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: phone,
});

export const campInterestSchema = z.object({
  camps: z.array(z.string().min(1).max(60)).min(1, "Please choose at least one camp").max(10),
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: z.string().trim().max(20).optional(),
  childName: z.string().trim().min(2, "Please enter your child's name").max(100),
  childAge: z.coerce.number({ invalid_type_error: "Please enter your child's age" }).int().min(4, "Camps are for ages 4–14").max(14, "Camps are for ages 4–14"),
  interest: interestSchema,
  notes: z.string().trim().max(1000).optional(),
  contactConsent: z.literal(true, { errorMap: () => ({ message: "Please confirm we can email you about camps" }) }),
  // Honeypot
  company: z.string().max(0).optional(),
});

export const enquirySchema = z.object({
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: z.string().trim().max(20).optional(),
  childAge: z.coerce.number().int().min(3).max(18).optional(),
  message: z.string().trim().min(2, "Please tell us a little about your child").max(3000),
  source: z.string().max(60).default("website"),
  // Honeypot — bots fill this in
  company: z.string().max(0).optional(),
});

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    out[key] ??= issue.message;
  }
  return out;
}

import { z } from "zod";
import { coachRoles, interestOptions, valuesOf } from "./interest-options";

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
  childAge: z.coerce.number({ invalid_type_error: "Please enter your child's age" }).int().min(4, "Camps are for ages 4–15").max(15, "Camps are for ages 4–15"),
  interest: interestSchema,
  notes: z.string().trim().max(1000).optional(),
  contactConsent: z.literal(true, { errorMap: () => ({ message: "Please confirm we can email you about camps" }) }),
  // Honeypot
  company: z.string().max(0).optional(),
});

const multi = (options: readonly string[]) => z.array(z.enum(options as unknown as [string, ...string[]])).max(options.length).default([]);
const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

const childSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your child's first name").max(60),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a date of birth")
    .refine((v) => {
      const years = (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 3600 * 1000);
      return years >= 3 && years <= 17;
    }, "Please check the date of birth"),
  school: optionalText(120),
  club: optionalText(120),
  girlsOnly: z.enum(valuesOf("girlsOnly"), { errorMap: () => ({ message: "Please choose an option" }) }),
  level: z.enum(valuesOf("level"), { errorMap: () => ({ message: "Please choose a level" }) }),
  mainRole: z.enum(valuesOf("mainRole"), { errorMap: () => ({ message: "Please choose a role" }) }),
  wants: multi(interestOptions.wants),
  formats: multi(interestOptions.formats),
  sessionLengths: multi(interestOptions.sessionLengths),
  availability: multi(interestOptions.availability),
  availabilityNotes: optionalText(500),
  frequency: z.enum(valuesOf("frequency"), { errorMap: () => ({ message: "Please choose an option" }) }),
  otherInterests: multi(interestOptions.otherInterests),
  paymentPreference: z.enum(valuesOf("paymentPreference"), { errorMap: () => ({ message: "Please choose an option" }) }),
});

export const interestRegistrationSchema = z.object({
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: phone,
  postcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/, "Please enter a valid UK postcode"),
  heardAbout: z.enum(interestOptions.heardAbout as unknown as [string, ...string[]]).optional(),
  children: z.array(childSchema).min(1, "Please add at least one child").max(8),
  contactConsent: z.literal(true, { errorMap: () => ({ message: "Please confirm we can contact you about HillRisers sessions" }) }),
  marketingConsent: z.boolean().default(false),
  // Honeypot
  company: z.string().max(0).optional(),
});
export type InterestRegistrationInput = z.infer<typeof interestRegistrationSchema>;

export const coachInterestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone,
  roles: z.array(z.enum(coachRoles as unknown as [string, ...string[]])).min(1, "Please choose at least one role"),
  specialism: optionalText(200),
  qualifications: z.string().trim().min(2, "Please tell us your coaching qualifications").max(500),
  playingBackground: optionalText(1000),
  coachingExperience: z.string().trim().min(10, "Please tell us about your coaching experience").max(2000),
  coachingPhilosophy: z.string().trim().min(10, "Please tell us about your coaching philosophy").max(2000),
  strengths: z.string().trim().min(5, "Please tell us your strengths as a coach").max(2000),
  weaknesses: z.string().trim().min(5, "Please tell us what you're working on as a coach").max(2000),
  availability: z.string().trim().min(2, "Please tell us when you're available").max(500),
  summerAvailability: optionalText(500),
  dbsStatus: z.string().trim().min(2, "Please tell us your DBS status").max(200),
  safeguardingStatus: z.string().trim().min(2, "Please tell us your safeguarding training status").max(200),
  firstAid: z.boolean().default(false),
  message: optionalText(2000),
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

/**
 * Coach recruitment lives on a private, unguessable URL that is never linked
 * from the parent-facing site: /team/<key>. Set COACH_PAGE_KEY in Vercel to
 * change the key (old links then stop working).
 */
export const COACH_PAGE_KEY = process.env.COACH_PAGE_KEY || "join-3uixtrgp";
export const RECRUITMENT_PREFIX = "/team/";
export const coachPagePath = `${RECRUITMENT_PREFIX}${COACH_PAGE_KEY}`;

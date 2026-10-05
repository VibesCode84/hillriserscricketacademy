/**
 * Coaching team. Leave empty until each coach has signed — the Coaches page
 * then shows "Coaching team announced soon". To add a coach, append an entry;
 * describe credentials factually (e.g. "ECB Level 2, former county player").
 */
export type Coach = {
  id: string;
  name: string;
  role: string;
  /** e.g. "ECB Level 2 · Enhanced DBS" */
  qualifications: string;
  /** e.g. "Former Middlesex age-group player" */
  background: string;
  /** A sentence in the coach's own words (optional) */
  philosophy?: string;
  image?: { src: string; alt: string };
};

export const coaches: Coach[] = [];

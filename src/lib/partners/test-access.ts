/**
 * Accounts that can see the £1 Stripe test booking: PARTNER_TEST_EMAILS on the Worker
 * (comma-separated), or office@hillrisers.co.uk when it isn't set.
 */
export function isTestPartner(email: string) {
  const list = (process.env.PARTNER_TEST_EMAILS || "office@hillrisers.co.uk").split(",").map((e) => e.trim().toLowerCase());
  return list.includes(email.trim().toLowerCase());
}

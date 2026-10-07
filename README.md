# HillRisers Cricket Academy

The website for HillRisers Cricket Academy: specialist junior cricket coaching (ages 4–15) at John Lyon School, Harrow on the Hill.

**Current phase: register-your-interest launch.** The site doesn't offer fixed sessions. Parents tell us their children's availability, level and wants through an extensive interest form, and the timetable is built from those answers. The only fixed times are **Little Cricketers, Sundays: three 40-minute sessions, 9:00–9:40am, 9:40–10:20am and 10:20–11:00am (ages 4–6)**.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS 4, and deployed on Vercel.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # form validation, storage, price guide, capacity
npm run lint
npm run typecheck
npm run build
```

## Editing content

| File | What it controls |
| --- | --- |
| `src/data/programmes.ts` | Programmes, ages and prices: group programmes £30/hr standard (`STANDARD_HOURLY_PENCE`) with a 2026/27 offer of £25/hr (`OFFER_HOURLY_PENCE`, `OFFER_LABEL`); Little Cricketers £18/session; registration fee (£30 incl. shirt); group sizes; specialist skills |
| `src/data/launch.ts` | Key dates (registrations open/close, priority booking, trial week, decision deadline) and booking rules (48-hour priority, 24-hour trial cancellation) |
| `src/data/coaches.ts` | Coaching team. **Leave empty until each coach has signed**, and the site shows "Coaching team announced soon". Add an entry per coach with factual credentials. |
| `src/data/site.ts` | Contact email, phone and welfare email (all unset; anything unset is hidden rather than shown as a placeholder), venue, navigation, canonical URL |
| `src/data/faqs.ts` | FAQ page |
| `src/data/camps.ts` | Holiday camps (details TBC; register-interest only) |
| `src/lib/interest-options.ts` | Every option on the interest form and the coach form, shared by the form, server validation, emails, admin and CSV |
| `src/data/sessions.ts` | Bookable sessions for the booking engine. Currently only Little Cricketers. Add sessions here when the timetable is published. |

**Copy rules:**
- **Public site:** a confident, big-sell tone is fine ("the very best coaches from the area"). Never invent facts: no fake testimonials, player numbers or results, and no coach names until they've signed.
- **Coach recruitment** (`/team/<key>`, default `/team/join-3uixtrgp`; set `COACH_PAGE_KEY` to change it): a **private, standalone page** with no links to or from the parent-facing site and hidden from search engines. Any other `/team/*` address (and the old `/coach-with-us`) is a 404. Share the link directly with coaches; it's also shown in `/admin/bookings`. It sells the opportunity: market-leading pay, longer blocks, freedom to coach, a founding team.
- No fixed times anywhere except Little Cricketers.

## Register-your-interest form (`/register`)

- **What it collects:** one parent or guardian with one or more children. Each child has level, main role, wants, preferred format and session length, availability, frequency, other interests and payment preference. Contact consent is required, news and offers are optional, and there's no medical information.
- **How it's handled:** a serverless function (`POST /api/register-interest`) validates submissions server-side with zod and stores them in Postgres (`interest_registrations`, one row per family with a `jsonb` list of children). No secrets reach the browser.
- **Confirmation:** an on-screen thank-you, plus a confirmation email explaining priority booking and next steps.
- **Analysis:** `/admin/bookings` shows demand by availability, age band, level, format, session length and girls-only interest. **Export registrations** downloads a CSV with **one row per child**, with yes/no columns for each availability, format and session-length option, ready for a spreadsheet pivot.

The private **coach recruitment** form (`/team/<key>`, `POST /api/coach-interest`) works the same way, with its own admin list and CSV export.

## Setting up storage and email on Vercel

Without a database, submissions go to temporary storage and **are lost**. The admin page shows a red warning until one is connected.

1. **Database.** In the Vercel project, go to **Storage → Create Database → Neon (Postgres)** and connect it. This sets `DATABASE_URL` automatically. A Supabase connection string also works. Tables are created on first use (`db/schema.sql`). Redeploy afterwards.
2. **Admin.** Set `ADMIN_PASSWORD`, then go to `/admin/bookings` (username `admin`).
3. **Email (optional but recommended).** Set `RESEND_API_KEY`, `EMAIL_FROM` (a sender on a domain verified in Resend) and `ACADEMY_NOTIFY_EMAIL` (where new registrations and coach applications are sent). Without these, emails are logged instead of sent.
4. **Site URL.** Canonical URLs use `NEXT_PUBLIC_SITE_URL`, then Vercel's production URL, then `https://hillriserscricketacademytest.vercel.app`.

## Booking engine (switched off until trial booking opens)

The site still contains a session booking engine for the next phase, trial booking in late October:
- capacity-checked places held while a parent pays
- Stripe Checkout
- webhook confirmation
- refunds
- a waiting list
- manual bookings in the admin dashboard

`/book` currently redirects to `/register`. To open trial booking:
1. Add the published sessions to `src/data/sessions.ts`.
2. Set the Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
3. Build the trial-booking page on top of `/api/player/create`, `/api/booking/create` and `/api/stripe/create-checkout-session`.

The deposit equals one session fee, per `/terms`.

## Still needed from the owner

- [ ] A contact email and phone number (set in `src/data/site.ts`). These are currently hidden.
- [ ] A welfare/safeguarding contact (`site.welfareEmail`).
- [ ] A contact email for coach applications, if you want one alongside the form.
- [ ] Coaches' names and credentials once signed (`src/data/coaches.ts`).
- [ ] Confirmed wording for the Terms & Conditions, which are marked "Draft – to be reviewed".
- [ ] Real photography. Image slots show labelled placeholders; pass `src` to `<Photo>` to replace them.
- [ ] A database and email set up on Vercel (see above) before registrations open on 8 October.

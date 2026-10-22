# HillRisers Cricket Academy

The website for HillRisers Cricket Academy: specialist junior cricket coaching (ages 4–15) at John Lyon School, Harrow on the Hill.

**Current phase: register your interest — programmes coming soon.** HillRisers isn't running its own sessions yet; the nets at John Lyon are booked by delivery partners in 1-hour blocks (see the partner portal below). The public site takes registrations of interest (availability, level, wants) to shape HillRisers' own programmes, with no fixed times, trial dates or payment deadlines until the timetable is set (`src/data/launch.ts`).

Built with Next.js 16 (App Router), TypeScript and Tailwind CSS 4, and deployed on Cloudflare Workers (via [OpenNext](https://opennext.js.org/cloudflare)) at **https://cricket.hillrisers.co.uk**.

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
| `src/data/programmes.ts` | Programmes, ages and prices: group programmes £30/hr standard (`STANDARD_HOURLY_PENCE`) with a 2026/27 offer of £25/hr (`OFFER_HOURLY_PENCE`, `OFFER_LABEL`); Early Risers £15/session; registration fee (£30 incl. shirt); group sizes; specialist skills |
| `src/data/launch.ts` | "What happens next" steps and booking rules (48-hour priority booking, 24-hour trial cancellation) |
| `src/data/coaches.ts` | Coaching team. **Leave empty until each coach has signed**, and the site shows "Coaching team announced soon". Add an entry per coach with factual credentials. |
| `src/data/site.ts` | Contact email, phone and welfare email (all unset; anything unset is hidden rather than shown as a placeholder), venue, navigation, canonical URL |
| `src/data/faqs.ts` | FAQ page |
| `src/data/camps.ts` | Holiday camps (details TBC; register-interest only) |
| `src/lib/interest-options.ts` | Every option on the interest form and the coach form, shared by the form, server validation, emails, admin and CSV |
| `src/data/sessions.ts` | Bookable sessions for the booking engine. Currently only Early Risers. Add sessions here when the timetable is published. |

**Copy rules:**
- **Public site:** a confident, big-sell tone is fine ("the very best coaches from the area"). Never invent facts: no fake testimonials, player numbers or results, and no coach names until they've signed.
- **Coach recruitment** (`/team/<key>`, default `/team/join-3uixtrgp`; set `COACH_PAGE_KEY` to change it): a **private, standalone page** with no links to or from the parent-facing site and hidden from search engines. Any other `/team/*` address (and the old `/coach-with-us`) is a 404. Share the link directly with coaches; it's also shown in `/admin/bookings`. It sells the opportunity: market-leading pay, longer blocks, freedom to coach, a founding team.
- No fixed times anywhere except Early Risers.

## Register-your-interest form (`/register`)

- **What it collects:** one parent or guardian with one or more children. Each child has level, main role, wants, preferred format and session length, availability, frequency, other interests and payment preference. Contact consent is required, news and offers are optional, and there's no medical information.
- **How it's handled:** a serverless function (`POST /api/register-interest`) validates submissions server-side with zod and stores them in Postgres (`interest_registrations`, one row per family with a `jsonb` list of children). No secrets reach the browser.
- **Confirmation:** an on-screen thank-you, plus a confirmation email explaining priority booking and next steps.
- **Analysis:** `/admin/bookings` shows demand by availability, age band, level, format, session length and girls-only interest. **Export registrations** downloads a CSV with **one row per child**, with yes/no columns for each availability, format and session-length option, ready for a spreadsheet pivot.

The private **coach recruitment** form (`/team/<key>`, `POST /api/coach-interest`) works the same way, with its own admin list and CSV export.

## Two sites, one app

- **cricket.hillrisers.co.uk** is the cricket academy (`src/app/(cricket)`).
- **hillrisers.co.uk** is the HillRisers landing page (`src/app/(hub)/hillrisers`), with buttons for cricket, hockey and netball and a short About us. Its content is in `src/data/hub.ts`; give hockey or netball an `href` when their sites are ready.
- `src/middleware.ts` chooses by address: on hillrisers.co.uk, `/` shows the landing page and any other path is redirected to the same path on the cricket site; `www.` addresses redirect to the bare domain.

## Deployment (Cloudflare)

Cloudflare Workers Builds deploys every push to the connected branch. Its settings: build command `npm run build`, deploy command `npx wrangler deploy`.

If pushes stop deploying, check the **Cloudflare Workers and Pages** GitHub app (GitHub → Settings → Applications → Configure) still has access to this repository; it is shared with other projects, and only repositories selected there can build.

- `npm run build` runs `next build`, and on Cloudflare (where `WORKERS_CI` is set) also `opennextjs-cloudflare build --skipNextBuild`, which turns the build into a Worker in `.open-next/`. Elsewhere (local, Vercel) it is a plain `next build`.
- `wrangler.jsonc` configures the Worker. Its `name` and the `WORKER_SELF_REFERENCE` service must both be `hillriserscricketacademy` (the Worker's name in Cloudflare).
- `npm run preview` builds and runs the Worker locally; `npm run deploy` builds and deploys from your machine.

### Storage and email

Submissions are stored, in order of preference, in Postgres (`DATABASE_URL`), in a **Cloudflare D1** database bound as `DB`, or in a local JSON file (development only; on a server it is temporary and **is lost**). The admin page shows a red warning when no database is connected.

1. **Database.** `wrangler.jsonc` binds a D1 database named `hillrisers` as `DB`; Wrangler creates it on the first deploy. Tables are created on first use. Check **Workers & Pages → hillriserscricketacademy → Bindings** shows `DB`. If the deploy log says D1 provisioning was skipped, create the database under **Storage & databases → D1** (name `hillrisers`), add its `database_id` to `wrangler.jsonc` and push.
2. **Admin.** In **Workers & Pages → hillriserscricketacademy → Settings → Variables and secrets**, add `ADMIN_PASSWORD` (as a secret), then go to `/admin/bookings` (username `admin`). `keep_vars` in `wrangler.jsonc` keeps dashboard variables on each deploy.
3. **Email (optional but recommended).** Add `RESEND_API_KEY` (secret), `EMAIL_FROM` (a sender on a domain verified in Resend, e.g. `hello@hillrisers.co.uk`) and `ACADEMY_NOTIFY_EMAIL` (where new registrations and coach applications are sent). Without these, emails are logged instead of sent.
4. **Site URL.** Canonical URLs and email links use `NEXT_PUBLIC_SITE_URL` if set, otherwise `https://cricket.hillrisers.co.uk`.

## Delivery partner portal (`/partners`)

Coaches and delivery partners register, upload documents and book nets by the block, paying by Stripe. It isn't linked from the parent-facing site; share **cricket.hillrisers.co.uk/partners** with partners.

- **What's released and prices:** `src/data/partners.ts` — blocks, days, times, nets and weeks; £17 per net per hour; bowling machine +£10 per hour (one machine, so one net per time slot). Edit this file to release the next block.
- **Live availability:** the grid refreshes every 8 seconds. Nets are held for 30 minutes while a partner pays; an expired or cancelled payment frees them. Two partners can never book the same net (or the machine) — the hold is atomic.
- **Documents:** qualifications, DBS, safeguarding, first aid and insurance (PDF, photo or Word, up to 10 MB). Stored in the D1 database. Partners can book straight away; review documents at `/admin/partners` (approve / reject with a note).
- **Sign-in:** each partner has a private portal link (shown in the portal, and emailed once email is set up). "Email me a new link" issues a fresh one.
- **Rules partners must accept:** partner terms (`src/data/partner-terms.ts`, draft), no filming or video, and for the bowling machine their own balls and a named Level 2 coach operating it.
- **Payments:** set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on the Worker, and point a Stripe webhook at `/api/stripe/webhook` with `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`. Without Stripe, partners see "Online payment isn't switched on yet" (locally, a test checkout is used instead).
- **Admin:** `/admin/partners` — live net grid with who has booked what, partners, documents and bookings, and a CSV download.

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
- [ ] More photography. Three photos are in `public/images` (listed in `src/data/photos.ts`); other slots show labelled placeholders until `src` is passed to `<Photo>`.
- [ ] Admin password and email set up on Cloudflare, and the D1 database confirmed (see above), before registrations open.

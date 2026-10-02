# Hillrisers Cricket Academy

The website and booking system for Hillrisers Cricket Academy: specialist junior cricket coaching for ages 4–14 at John Lyon School, Harrow.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS 4. It is ready to deploy on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
```

You don't need any keys in development:

- **Payments.** With no `STRIPE_SECRET_KEY`, booking uses a built-in *development checkout* (`/book/dev-checkout`) that simulates Stripe, so you can test the whole journey.
- **Storage.** With no `DATABASE_URL`, bookings are saved to `.data/store.json`.
- **Email.** With no `RESEND_API_KEY`, confirmation emails are printed to the server console.
- **Admin.** Set `ADMIN_PASSWORD` to open `/admin/bookings`. It uses HTTP Basic auth, and the username defaults to `admin`.

```bash
npm test          # recommendation + capacity/booking engine tests
npm run lint
npm run typecheck
npm run build
```

## Editing content

All content is held in typed data files in `src/data/`:

| File | What it controls |
| --- | --- |
| `sessions.ts` | **The weekly timetable.** Slots currently have only a day and time; which academy runs in each slot is deliberately left unassigned. To open a slot for online booking, set its `discipline` (plus optional `group`, `ageMin`, `ageMax`) and make sure its times are set and `confirmed: true`. Little Cricketers slots should be 60 minutes at `pricePence: 1500`. |
| `academies.ts` | Academy pages: what players learn, who each academy is for, FAQs, SEO copy, and each academy's **session length and fee** (90 min/£25; Little Cricketers 60 min/£15) |
| `coaches.ts` | Coach cards (placeholders; replace with verified details) |
| `testimonials.ts` | Parent quotes (**samples; replace with real, consented quotes**) |
| `term.ts` | **Term dates**, following the [John Lyon School calendar](https://www.johnlyon.org/information/term-dates/): Autumn 2026 (from w/c 1 November to 11 December), Spring 2027 (7 January – 25 March, half term 15–19 February) and Summer 2027 (16 April – 9 July, half term 31 May – 4 June). Session dates, sessions per weekday, term fees (sessions × session fee) and fee due dates (one week before each term) are all calculated from this. The site always shows the upcoming term. Add next year's terms here each summer. |
| `faqs.ts` | FAQ page |
| `site.ts` | Contact details, venue address, welfare contact, standard price and capacity |

**Photography.** Each image slot uses `<Photo src? alt />`. Until a `src` is given, it shows a branded placeholder labelled with the intended shot. Put images in `public/images/` and set `src` (for example, `image: { src: "/images/batting.jpg", alt: "…" }` in `academies.ts`).

## Booking architecture

The parent journey runs: **Player profile → recommended academy → choose session → confirm details → Stripe Checkout → welcome**. Parents check out as guests and don't need an account.

**While the weekly programme is unassigned** (no slot has a `discipline`), the same journey ends in a **trial request** instead. The parent picks the recommended academy and their preferred days, gives full player and welfare details, and chooses either:

- **a refundable holding deposit**, equal to the first session fee (£25, or £15 for Little Cricketers), paid through Stripe Checkout. It secures the place, covers the trial session once a day and time are confirmed, and is refunded in full if no suitable session can be offered; or
- **no deposit**, in which case the request is saved but the place isn't held.

In the admin dashboard you then confirm a day with the family, add the session with "Add manual booking" and click "Mark deposit credited". Deposit refunds are issued in Stripe, and the webhook updates the status automatically.

The academy database is the source of truth for players, sessions, capacity, bookings and attendance. Stripe is a replaceable payment layer (`src/lib/payments`) and is the source of truth only for payment and refunds.

| Route | Purpose |
| --- | --- |
| `POST /api/player/create` | Saves the parent and player profile and returns a pathway recommendation |
| `GET /api/booking/check-capacity` | Live availability |
| `POST /api/booking/create` | Checks capacity and creates a `pending_payment` booking in one atomic step, holding the place |
| `POST /api/stripe/create-checkout-session` | Creates a Stripe Checkout Session (booking metadata, promo codes, Apple/Google Pay) |
| `POST /api/stripe/webhook` | `checkout.session.completed` confirms a booking or deposit and sends the email; `checkout.session.expired` releases the place (or reverts an unpaid deposit); `charge.refunded` records a booking or deposit refund |
| `POST /api/trial-request` | Trial request with preferred days; with `withDeposit` it starts Stripe Checkout for the holding deposit |
| `POST /api/trial-request/deposit` | Retry the deposit payment, or continue without one (from `/book/deposit`) |
| `POST /api/waitlist/join` | Waiting list / register interest (no payment) |
| `POST /api/enquiry` | "I'd rather speak to someone" |

**Capacity protection.** Reserving a place locks the session row (`SELECT … FOR UPDATE` in Postgres, or a serialised queue in the file store), so a group can never exceed its capacity. A test fires 25 simultaneous requests at an 18-place group and checks that exactly 18 succeed.

**How long places are held.** A place is held for 10 minutes while the parent reaches payment. Once a Stripe Checkout page is opened, the hold extends to match that page's expiry, because Stripe's minimum is 30 minutes. This means a late payment can never push a group over capacity.

**Payment confirmation.** Only the webhook confirms a payment. The success page waits until the database shows the booking as confirmed; the browser redirect alone doesn't count.

**Availability labels.** "Places available", "N places left" and "Full · Waiting list" are always calculated from real bookings.

The data model already includes `paymentType` (`single | term | subscription | manual`), so term blocks and memberships can be added later.

## Going live

1. **Database.** Create a Postgres database (Supabase works) and set `DATABASE_URL`. Tables are created automatically on first use (see `db/schema.sql`), and session config from `sessions.ts` is synced into `academy_sessions`.
2. **Stripe.**
   - Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   - Optionally create one product, "Hillrisers Cricket Academy Session", with a £25 price, and set `STRIPE_ACADEMY_PRICE_ID`.
   - Add a webhook endpoint at `https://<domain>/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` and `charge.refunded`, then set `STRIPE_WEBHOOK_SECRET`.
   - Set your logo, navy brand colour and support email under Stripe → Settings → Branding.
3. **Email.** Set `RESEND_API_KEY` and `EMAIL_FROM` (on a verified domain).
4. **Admin and site URL.** Set `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL`.
5. **Before launch.** Replace everything marked `TODO` or *sample*:
   - phone number, emails and welfare officer
   - coach details and qualifications
   - testimonials (sample ones show a red "Sample — replace" badge outside production)
   - refund, safeguarding and venue/parking wording
   - Saturday and Sunday session times (then set `confirmed: true`)
   - the full Terms and Conditions (`/terms`), which should be reviewed by a solicitor, with the academy's legal entity details added

## Admin dashboard (`/admin/bookings`)

The dashboard lets you:

- work the trial requests: preferred days, deposit status, family details, status tracking, "Email family" and "Mark deposit credited"
- see capacity per session (booked, held and waiting)
- filter bookings by session
- view player profiles, including medical notes, emergency contact and photo consent
- see payment status (paid, awaiting payment, refunded, part refunded, cancelled)
- mark attendance
- move a player to another session (capacity-checked)
- cancel a booking
- add a manual booking
- view the waiting list, with a "send booking link" action
- read enquiries
- export bookings and trial requests to CSV

## Not yet built (phases 2–3)

Online payment of **term fees** isn't built yet. Term fees are already calculated per slot (`termFee()` in `src/data/term.ts`) and the data model supports `paymentType: "term"`, so the remaining work is a term checkout once slots are assigned to academies. Single sessions, trials and holding deposits can already be paid online.

Sibling booking in a single checkout, automatic waiting-list invitations, term rebooking, progress reports, a parent portal, camps and 1-to-1 coaching. The data model and payment layer are structured so these can be added without rebuilding.

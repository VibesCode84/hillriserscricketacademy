import { launch } from "./launch";

export type FAQ = { q: string; a: string };
export type FAQGroup = { title: string; items: FAQ[] };

export const faqGroups: FAQGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "When does HillRisers start?",
        a: `HillRisers launches at John Lyon School on ${launch.launchDate}. Trial week is ${launch.trialWeek}, and regular sessions start from ${launch.regularSessionsFrom}.`,
      },
      {
        q: "Why isn't there a timetable yet?",
        a: "We're building it around the families who register. Tell us when your child can attend, how long they'd like sessions to be and what they want from cricket, and we'll plan the timetable around the answers.",
      },
      {
        q: "Is my child good enough?",
        a: "If they enjoy cricket, yes. Players are placed by ability, not just age, and move up when they're ready — from complete beginners to club and representative players.",
      },
      {
        q: "Which group should my child join?",
        a: "You don't need to decide. Tell us about your child on the interest form and we'll suggest the right group.",
      },
      {
        q: "Are girls welcome?",
        a: "Yes. There's a girls-only pathway (Girls Development and Girls Performance), and girls are welcome in every mixed group too.",
      },
    ],
  },
  {
    title: "Booking and prices",
    items: [
      {
        q: "How does booking work?",
        a: `Register your interest. When the timetable is published, registered families get ${launch.priorityBookingHours} hours' priority booking. You then book a trial in trial week (${launch.trialWeek}), paying a deposit equal to one session fee.`,
      },
      {
        q: "What happens after the trial?",
        a: `If your child joins, the deposit is credited to their remaining sessions, and you book autumn and spring terms together — paid in full or monthly. If they don't, the deposit is refunded, provided they attended or you cancelled with at least ${launch.trialCancellationHours} hours' notice.`,
      },
      {
        q: "How much does it cost?",
        a: "Prices are a guide per hour of coaching: Development £24, Performance £30, small groups of three £45 per player, and 1-to-1 from £75. Little Cricketers is £18 per session. New players pay a £30 registration fee, which includes a HillRisers playing shirt.",
      },
      {
        q: "How long are sessions?",
        a: "Sessions may run for 1 hour, 90 minutes or 2 hours, depending on what families tell us. Little Cricketers runs on Sundays, 9:00–9:50am.",
      },
      {
        q: "How big are the groups?",
        a: "Net-based groups have a maximum of six players per net (up to 18 per session), and each net has its own coach. Little Cricketers has a maximum of 24.",
      },
    ],
  },
  {
    title: "Venue and coaches",
    items: [
      {
        q: "Where are sessions held?",
        a: "Indoors in the John Lyon School sports hall, Harrow on the Hill, in autumn and spring, and outdoors in summer.",
      },
      {
        q: "Can seam bowlers bowl off a full run-up indoors?",
        a: "The hall allows an 11-yard run-up. Younger groups bowl from junior pitch lengths, and indoor seam coaching focuses on action, accuracy and variations. Full run-ups return outdoors in summer.",
      },
      {
        q: "Who are the coaches?",
        a: "We're bringing together the very best coaches from the area, and we'll introduce the team soon. Every HillRisers coach holds an ECB coaching qualification, an enhanced cricket DBS check and safeguarding training.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);

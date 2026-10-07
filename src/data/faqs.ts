import { launch } from "./launch";

export type FAQ = { q: string; a: string };
export type FAQGroup = { title: string; items: FAQ[] };

export const faqGroups: FAQGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "When does HillRisers start?",
        a: `HillRisers launches at John Lyon School in the ${launch.launchDate}. Trial week is ${launch.trialWeek}, and regular sessions start from ${launch.regularSessionsFrom}.`,
      },
      {
        q: "Why isn't there a timetable yet?",
        a: "We're building it around the families who register. Tell us when your child can attend, how long they'd like sessions to be and what they want from cricket, and we'll plan the timetable around the answers.",
      },
      {
        q: "Do sessions run in the school holidays?",
        a: "We're planning holiday camps (part-day and full-day), and weekly sessions may carry on in their normal slot too — we'll decide from what families tell us on the interest form. We're closed from 21 December to 3 January. See the 2026/27 calendar for dates.",
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
        a: `Register your interest. When the timetable is published, registered families get ${launch.priorityBookingHours} hours' priority booking. You then book a trial in trial week (${launch.trialWeek}), on the day your child plans to train, paying a deposit equal to one session fee.`,
      },
      {
        q: "What happens after the trial?",
        a: `If your child joins, the deposit is credited to their remaining sessions, and you book autumn and spring terms together — paid in full or monthly. If they don't, the deposit is refunded, provided they attended or you cancelled with at least ${launch.trialCancellationHours} hours' notice.`,
      },
      {
        q: "How much does it cost?",
        a: "Our standard rate for all group programmes — Development, Performance and the girls-only groups — is £30 per hour, and for 2026/27 we're offering it at £25 per hour. Small groups of three are £45 per player per hour, and 1-to-1 coaching is from £75 per hour. Early Risers is £15 per session. New players pay a £30 registration fee, which includes a HillRisers playing shirt.",
      },
      {
        q: "How long are sessions?",
        a: "Sessions may run for 1 hour, 90 minutes or 2 hours, depending on what families tell us. Early Risers runs on Sunday mornings as three 40-minute sessions: 9:00–9:40am, 9:40–10:20am and 10:20–11:00am.",
      },
      {
        q: "How big are the groups?",
        a: "Small. Every programme has a maximum of six players per net, and each net has its own coach. Early Risers is our only larger group, with a maximum of 24.",
      },
    ],
  },
  {
    title: "Venue and coaches",
    items: [
      {
        q: "Where are sessions held?",
        a: "In the John Lyon School sports hall, Harrow on the Hill, with three indoor nets and a bowling machine. Summer arrangements are to be confirmed, and we're expecting outdoor nets.",
      },
      {
        q: "Can seam bowlers bowl off a full run-up indoors?",
        a: "The hall allows an 11-yard run-up. Younger groups bowl from junior pitch lengths, and indoor seam coaching focuses on action, accuracy and variations. Full run-ups return outdoors.",
      },
      {
        q: "Who are the coaches?",
        a: "The very best coaches from the area: strong playing backgrounds, ECB coaching qualifications, specialist expertise and experience coaching juniors at every stage. Every HillRisers coach also holds an enhanced cricket DBS check and safeguarding training.",
      },
      {
        q: "What is your coaching philosophy?",
        a: "We coach every child as an individual, so they understand their own game rather than copying someone else's. Skills are practised and then tested under pressure, groups are small so players get more feedback, enjoyment comes first, and every player leaves knowing what to work on next.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);

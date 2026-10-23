
export type FAQ = { q: string; a: string };
export type FAQGroup = { title: string; items: FAQ[] };

export const faqGroups: FAQGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "When does HillRisers start?",
        a: "Soon. Register your interest and we'll be in touch when programmes are ready.",
      },
      {
        q: "Do sessions run in the school holidays?",
        a: "We're planning part-day and full-day holiday camps. We're closed from 21 December to 3 January — see the 2026/27 calendar.",
      },
      {
        q: "Is my child good enough?",
        a: "If they enjoy cricket, yes. Players are placed by ability, from complete beginners to club and representative players.",
      },
      {
        q: "Which group should my child join?",
        a: "You don't need to decide — we'll suggest the right group.",
      },
      {
        q: "Are girls welcome?",
        a: "Yes — in every group, and in our girls-only groups.",
      },
    ],
  },
  {
    title: "Joining",
    items: [
      {
        q: "How does it work?",
        a: "Register your interest and we'll be in touch when programmes are ready.",
      },
      {
        q: "Can my child try a session first?",
        a: "Yes.",
      },
      {
        q: "How much does it cost?",
        a: "Registering is free. We'll share fees when programmes are ready.",
      },
      {
        q: "How long are sessions?",
        a: "To be confirmed. Early Risers is planned for Sunday mornings.",
      },
      {
        q: "How big are the groups?",
        a: "A maximum of six players per net, each net with its own coach. Early Risers: up to 16.",
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

import { termPaymentDueLabel, termStartLabel } from "./term";

export type FAQ = { q: string; a: string };
export type FAQGroup = { title: string; items: FAQ[] };

// TODO: confirm the refund policy wording with the academy before launch.
export const faqGroups: FAQGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "Is my child good enough?",
        a: "If they enjoy cricket and want to get better, yes. Every academy group works in small stations, so beginners and experienced players each get the right level of challenge.",
      },
      {
        q: "Which session should we choose?",
        a: "You don't need to know. Use Find My Session or tell us a little about your child, and we'll recommend the best starting point. If it's not quite right after the first session, we'll move them.",
      },
      {
        q: "Are beginners welcome?",
        a: "Yes. Little Cricketers and the Girls Academy are built for complete beginners, and our specialist groups welcome players with a little experience.",
      },
      {
        q: "Does my child need to play for a club?",
        a: "No. Many of our players do, and we complement club and school cricket — but club experience isn't required.",
      },
      {
        q: "What happens at the first session?",
        a: "Arrive ten minutes early and a coach will meet you at the entrance. The coaching team will know your child is new, introduce them to the group and keep an eye on them throughout. Within a day or two we'll be in touch to ask how they found it and recommend their pathway.",
      },
    ],
  },
  {
    title: "Sessions and price",
    items: [
      {
        q: "How much does it cost?",
        a: "Specialist academy sessions are £25 for 90 minutes, with a lead coach, an assistant coach and two junior helpers, and a maximum of 18 players. Little Cricketers sessions (ages 4–7) are £15 for 60 minutes.",
      },
      {
        q: "Can I secure a place before the timetable is confirmed?",
        a: "Yes. When you request a trial you can pay a refundable holding deposit equal to the first session fee — £25, or £15 for Little Cricketers. It holds your child's place, covers their trial session once we confirm the day and time, and is refunded in full if we can't offer a session that suits you or you change your mind before it's confirmed.",
      },
      {
        q: "When do sessions start?",
        a: `Sessions start the ${termStartLabel}.`,
      },
      {
        q: "How do payments work?",
        a: `Fees are paid termly, and are due one week before the term's sessions start — for our first term, by ${termPaymentDueLabel}. Start with a single trial session first if you like; there's no term commitment for the trial.`,
      },
      {
        q: "How big are the groups?",
        a: "A maximum of 18 players per academy session, split into small working groups across four coaches.",
      },
      {
        q: "Can girls join the mixed specialist sessions?",
        a: "Yes. Girls are welcome in every specialist academy as well as the dedicated Girls Academy.",
      },
    ],
  },
  {
    title: "Kit and venue",
    items: [
      {
        q: "What does my child need to bring?",
        a: "Comfortable sportswear, indoor trainers, a water bottle and any cricket kit they have. For hard-ball sessions, a helmet, pads and gloves are essential — let us know if you need to borrow academy kit for the trial.",
      },
      {
        q: "Where are sessions held?",
        a: "At John Lyon School, Middle Road, Harrow on the Hill. See the Venue page for parking and arrival details.",
      },
      {
        q: "Can parents stay and watch?",
        a: "Parents are welcome to wait at the venue; the coaching team will explain the waiting arrangements on your first visit.",
      },
    ],
  },
  {
    title: "Safety and welfare",
    items: [
      {
        q: "Are coaches DBS checked?",
        a: "Yes. All coaches and helpers working with players are DBS checked and follow our safeguarding policy. You can contact our welfare officer at any time.",
      },
      {
        q: "What if my child has medical or additional needs?",
        a: "Tell us when booking. We'll make sure the coaching team is aware and will talk to you about anything that helps your child enjoy the session.",
      },
      {
        q: "What is your refund policy?",
        a: "If you cancel more than 48 hours before a session, we'll refund you in full. If we cancel a session, you'll always get a full refund or a free transfer.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);

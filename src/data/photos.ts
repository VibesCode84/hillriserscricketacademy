/** Real photography in /public/images. Pass `src`, `alt` and `position` to <Photo>. */
export const photos = {
  girlBatting: {
    src: "/images/girl-batting.webp",
    alt: "Girl in navy and gold kit playing a defensive shot in an indoor net",
    position: "center 25%",
  },
  keeper: {
    src: "/images/wicket-keeper.webp",
    alt: "Young wicket-keeper crouched behind the stumps, watching the ball",
    position: "center 35%",
  },
  coachAndBatter: {
    src: "/images/coach-and-batter.webp",
    alt: "Coach watching a young batter practise a shot off a cone in an indoor net",
    position: "center 40%",
  },
  sportsHall: {
    src: "/images/sports-hall.webp",
    alt: "The John Lyon School sports hall",
    position: "center 55%",
  },
  sportsHallNets: {
    src: "/images/sports-hall-nets.webp",
    alt: "The sports hall at John Lyon School, with the cricket nets drawn back",
    position: "center 20%",
  },
  school: {
    src: "/images/john-lyon-school.webp",
    alt: "John Lyon School, Harrow on the Hill",
    position: "center 40%",
  },
} as const;

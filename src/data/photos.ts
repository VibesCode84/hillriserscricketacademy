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
} as const;

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type Tone = "dark" | "darker" | "light" | "cream";

const tones: Record<Tone, string> = {
  dark: "bg-navy-900 text-cream",
  darker: "bg-navy-950 text-cream",
  light: "surface-light bg-cream text-navy-950",
  cream: "surface-light bg-cream-200 text-navy-950",
};

export function Section({
  children,
  tone = "darker",
  className = "",
  id,
  tight = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${tight ? "py-16 md:py-20" : "py-20 md:py-28 lg:py-32"} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
  as: H = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Reveal className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <p className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>}
      <H className="mt-5 text-[2.5rem] leading-[1.05] md:text-[3.5rem]">{title}</H>
      {intro && <div className="mt-6 text-lg leading-relaxed opacity-80 md:text-xl">{intro}</div>}
    </Reveal>
  );
}

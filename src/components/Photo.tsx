import Image from "next/image";

/**
 * Photography slot. Pass `src` once real photography is available; until then
 * a tasteful branded placeholder is shown, labelled with the intended shot.
 */
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  tone = "navy",
  showCaption = true,
  position = "center",
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  tone?: "navy" | "deep" | "warm";
  showCaption?: boolean;
  /** CSS object-position for real photos, e.g. "center 25%" to keep faces in frame */
  position?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
      </div>
    );
  }

  const gradients = {
    navy: "from-navy-800 via-navy-900 to-navy-950",
    deep: "from-navy-900 via-navy-950 to-[#040f1f]",
    warm: "from-[#2a3550] via-navy-900 to-navy-950",
  } as const;

  return (
    <div role="img" aria-label={alt} className={`relative overflow-hidden bg-gradient-to-br ${gradients[tone]} ${className}`}>
      <div className="img-zoom absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300" aria-hidden="true">
          <defs>
            <radialGradient id="ph-glow" cx="70%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#d5a93f" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#d5a93f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#ph-glow)" />
          {/* rising hill lines */}
          <path d="M-20 250 C 80 230 160 170 260 150 S 380 120 440 90" stroke="#d5a93f" strokeOpacity="0.35" strokeWidth="1" fill="none" />
          <path d="M-20 275 C 90 260 170 205 270 185 S 390 160 440 135" stroke="#e8cf83" strokeOpacity="0.15" strokeWidth="1" fill="none" />
          {/* ball seam */}
          <circle cx="300" cy="95" r="42" stroke="#f8f6f0" strokeOpacity="0.08" strokeWidth="1" fill="none" />
          <path d="M272 64 C 292 84 292 106 272 126" stroke="#d5a93f" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 4" fill="none" />
          <path d="M328 64 C 308 84 308 106 328 126" stroke="#d5a93f" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 4" fill="none" />
        </svg>
      </div>
      {showCaption && (
        <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[0.7rem] leading-snug text-slate/70">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
            <rect x="2.5" y="5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="10" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 5l1-2h4l1 2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="line-clamp-1">{alt}</span>
        </span>
      )}
    </div>
  );
}

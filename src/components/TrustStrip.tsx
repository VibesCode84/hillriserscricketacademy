const items = ["The area's best coaches", "Max six per net", "Boys and girls aged 4–15", "John Lyon School"];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-cream/80 ${className}`} aria-label="HillRisers at a glance">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-5">
          {i > 0 && <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />}
          {item}
        </li>
      ))}
    </ul>
  );
}

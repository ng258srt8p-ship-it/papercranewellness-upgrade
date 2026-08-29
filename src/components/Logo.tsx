export function CraneMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 880 880"
      className={className}
      role="img"
      aria-label="Paper Crane Wellness origami crane mark"
      fill="currentColor"
    >
      {/* upper sail wing */}
      <path d="M178 25 L537 245 L388 507 Z" />
      {/* rear wing */}
      <path d="M92 207 L258 233 L362 546 Z" />
      {/* body */}
      <path d="M541 262 L607 592 L262 733 Z" />
      {/* tail feather */}
      <path d="M30 605 L313 622 L250 737 Z" />
      {/* neck */}
      <path d="M585 417 L722 302 L611 574 Z" />
      {/* head + beak */}
      <path d="M737 300 L845 421 L690 428 Z" />
    </svg>
  );
}

export function Wordmark({
  className = "",
  markClass = "h-9 w-9",
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <CraneMark className={markClass} />
      <span className="flex flex-col items-center leading-none">
        <span className="display text-[1.06rem] tracking-[-0.01em]">Paper Crane</span>
        <span className="eyebrow eyebrow-bare mt-[5px] text-[0.5625rem] opacity-60">Wellness</span>
      </span>
    </span>
  );
}

/** Decorative folded-paper geometry used in place of stock photography. */
export function PaperFold({ className = "", seed = 0 }: { className?: string; seed?: number }) {
  const sets = [
    ["M0 240 L180 0 L400 120 Z", "M180 0 L400 120 L400 400 Z", "M0 240 L400 400 L120 400 Z"],
    ["M400 0 L400 260 L120 60 Z", "M0 80 L120 60 L400 400 Z", "M0 80 L400 400 L0 400 Z"],
    ["M60 0 L400 180 L200 400 Z", "M60 0 L200 400 L0 300 Z", "M400 180 L400 400 L200 400 Z"],
  ];
  const s = sets[seed % sets.length];
  return (
    <svg viewBox="0 0 400 400" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d={s[0]} fill="currentColor" opacity="0.9" />
      <path d={s[1]} fill="currentColor" opacity="0.55" />
      <path d={s[2]} fill="currentColor" opacity="0.28" />
    </svg>
  );
}

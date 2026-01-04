export default function SectionDivider({ variant = "wave" }) {
  if (variant === "line") {
    return (
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="mx-auto max-w-6xl px-6">
            <div className="h-px bg-white/15" />
          </div>
        </div>
      </div>
    );
  }

  // "wave" dotted bars (like your hero bottom)
  return (
    <div className="relative h-32 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
      >
        {/* baseline */}
        <path d="M0 80 H1200" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" />

        {/* dotted vertical bars */}
        {Array.from({ length: 160 }).map((_, i) => {
          const x = (i / 159) * 1200;
          const y =
            120 +
            Math.sin(i * 0.12) * 18 +
            Math.sin(i * 0.04) * 28; // layered wave feel
          const h = 90 - (y - 120) * 0.2;

          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x}
              y2={y + h}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}

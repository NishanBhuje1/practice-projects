export default function StickySectionHeader({
  title,
  subtitle,
  right,
  size = "md", // "sm" | "md"
}) {
  if (!title && !subtitle && !right) return null;

  const pad = size === "sm" ? "py-2" : "py-4";
  const titleSize = size === "sm" ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl";
  const subSize = size === "sm" ? "text-xs sm:text-sm" : "text-sm sm:text-base";

  return (
    <div
      className="
        sticky top-0 z-30
        backdrop-blur
        dark:bg-bg/70 dark:border-b dark:border-border
        light:bg-light-bg/80 light:border-b light:border-light-border
      "
    >
      <div className={`max-w-6xl mx-auto px-6 ${pad} flex items-center justify-between gap-6`}>
        <div>
          {title && (
            <h1
              className={`
                ${titleSize} font-medium tracking-tight
                dark:text-text-primary
                light:text-light-text-primary
              `}
            >
              {title}
            </h1>
          )}

          {subtitle && (
            <p
              className={`
                mt-1 ${subSize}
                dark:text-text-secondary
                light:text-light-text-secondary
              `}
            >
              {subtitle}
            </p>
          )}
        </div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

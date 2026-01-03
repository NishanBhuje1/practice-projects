export default function StickySectionHeader({ title, subtitle, right }) {
  if (!title && !subtitle && !right) return null;

  return (
    <div
      className="
        sticky top-0 z-30
        backdrop-blur
        dark:bg-bg/70 dark:border-b dark:border-border
        light:bg-light-bg/80 light:border-b light:border-light-border
      "
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div>
          {title && (
            <h1
              className="
                text-2xl sm:text-3xl font-medium tracking-tight
                dark:text-text-primary
                light:text-light-text-primary
              "
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              className="
                mt-1 text-sm sm:text-base
                dark:text-text-secondary
                light:text-light-text-secondary
              "
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

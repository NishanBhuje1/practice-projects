import SectionDivider from "./SectionDivider.jsx";
import StickySectionHeader from "./StickySectionHeader.jsx";

export default function PageSection({
  title,
  subtitle,
  children,
  stickyHeader = true,
  showDividerTop = false,
  headerRight = null,
}) {
  return (
    <div>
      {showDividerTop ? (
        <div className="pt-8">
          <SectionDivider />
        </div>
      ) : null}

      {stickyHeader ? (
        <StickySectionHeader title={title} subtitle={subtitle} right={headerRight} />
      ) : (
        <div className="max-w-6xl mx-auto px-6 pt-20">
          {title ? (
            <h1
              className="
                text-4xl mb-6 font-medium tracking-tight
                dark:text-text-primary
                light:text-light-text-primary
              "
            >
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p
              className="
                max-w-2xl mb-12
                dark:text-text-secondary
                light:text-light-text-secondary
              "
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-20">{children}</div>

      <SectionDivider />
    </div>
  );
}

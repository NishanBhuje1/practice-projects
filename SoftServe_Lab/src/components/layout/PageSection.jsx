import SectionDivider from "./SectionDivider.jsx";
import StickySectionHeader from "./StickySectionHeader.jsx";

export default function PageSection({
  id,
  header,
  divider = "line", // "line" | "wave" | "none"
  className = "",
  contentClassName = "",
  children,
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      {header ? <StickySectionHeader label={header} /> : null}

      <div className={`max-w-6xl mx-auto px-6 ${contentClassName}`}>
        {children}
      </div>

      {divider === "none" ? null : <SectionDivider variant={divider} />}
    </section>
  );
}

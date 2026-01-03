export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-xl border
        dark:border-border dark:bg-surface
        light:border-light-border light:bg-light-surface
        ${className}
      `}
    >
      {children}
    </div>
  );
}

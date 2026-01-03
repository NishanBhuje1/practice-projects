export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition border";

  const styles = {
    primary:
      "dark:bg-accent dark:text-text-invert dark:border-accent dark:hover:bg-bg dark:hover:text-accent " +
      "light:bg-light-accent light:text-light-text-invert light:border-light-accent light:hover:bg-light-bg light:hover:text-light-accent",
    secondary:
      "dark:border-border dark:text-text-primary dark:hover:border-accent " +
      "light:border-light-border light:text-light-text-primary light:hover:border-light-accent",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

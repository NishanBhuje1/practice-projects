export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base = `
    relative inline-flex items-center justify-center
    px-8 py-3 rounded-full text-sm font-semibold
    overflow-hidden cursor-pointer select-none
    transition-transform duration-150
    active:scale-[0.97]
  `;

  const variants = {
    primary: `
      bg-[rgb(var(--surface))]
      text-[rgb(var(--text-primary))]
      shadow-[0_6px_20px_-10px_rgba(0,0,0,0.45)]
      hover:text-[rgb(var(--text-invert))]
    `,
    secondary: `
      bg-transparent
      text-[rgb(var(--text-primary))]
      border border-[rgb(var(--border))]
      hover:border-[rgb(var(--accent))]
    `,
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {/* Animated gradient glow */}
      {variant === "primary" && (
        <span className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <span
            className="
              w-[10rem] h-[10rem] rounded-full blur-2xl opacity-50
              bg-[linear-gradient(90deg,#de004b,#bf46ff,#00d4ff)]
              animate-[spin_3s_linear_infinite]
              transition-all duration-300
              group-hover:w-[8rem] group-hover:h-[8rem]
            "
          />
        </span>
      )}

      {/* Button label */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

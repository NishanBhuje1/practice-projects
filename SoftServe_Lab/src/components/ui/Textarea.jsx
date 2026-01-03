export default function Textarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`
        w-full rounded-xl border px-4 py-3 text-sm transition outline-none
        dark:border-border dark:bg-bg dark:text-text-primary dark:placeholder:text-text-muted dark:focus:border-accent
        light:border-light-border light:bg-light-bg light:text-light-text-primary light:placeholder:text-light-text-muted light:focus:border-light-accent
        ${className}
      `}
    />
  );
}

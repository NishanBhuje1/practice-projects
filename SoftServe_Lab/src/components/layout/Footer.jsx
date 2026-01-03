import SectionDivider from "./SectionDivider.jsx";

export default function Footer() {
  return (
    <footer className="py-10">
      <SectionDivider />
      <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm dark:text-text-muted light:text-light-text-muted">
          © {new Date().getFullYear()} SoftServe Lab. All rights reserved.
        </p>
        <p className="text-sm dark:text-text-muted light:text-light-text-muted">
          Built with Vite + React + Tailwind
        </p>
      </div>
    </footer>
  );
}

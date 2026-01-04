import SectionDivider from "./SectionDivider.jsx";

export default function Footer() {
  return (
    <footer className="mt-24">
      {/* Divider like Wix */}
      <SectionDivider />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <p className="text-sm tracking-wide
            text-text-muted dark:text-text-muted
            light:text-light-text-muted
          ">
            © {new Date().getFullYear()} SoftServe Lab
          </p>

          {/* Right */}
          <p className="text-sm tracking-wide
            text-text-muted dark:text-text-muted
            light:text-light-text-muted
          ">
            Crafted with React · Vite · Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}

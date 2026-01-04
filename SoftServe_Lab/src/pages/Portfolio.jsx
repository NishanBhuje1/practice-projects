import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";

function ProjectCard({ title, url, desc, tech }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card
        className="
          h-full p-6 transition
          bg-white/5 border border-white/10
          hover:border-white/20 hover:bg-white/8
          hover:-translate-y-1
        "
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium text-white/90">
            {title}
          </h3>

          <span className="text-sm text-white/40 group-hover:text-white/70 transition">
            ↗
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-white/60">
          {desc}
        </p>

        {tech && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tech.map((t) => (
              <span
                key={t}
                className="
                  text-xs px-3 py-1 rounded-full
                  bg-white/5 text-white/50
                  ring-1 ring-white/10
                "
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Card>
    </a>
  );
}

export default function Portfolio() {
  return (
    <div className="bg-softserve relative overflow-hidden guide-lines">
      <PageSection
        id="portfolio"
        header="Section: Portfolio"
        divider="line"
        contentClassName="py-16 md:py-20"
      >
        {/* Heading */}
        <div className="max-w-2xl">
          <h2 className="display text-5xl md:text-6xl text-white/80">
            Selected Work
          </h2>
          <p className="mt-6 text-sm leading-7 text-white/60">
            A selection of real-world web applications I’ve designed and built,
            focusing on performance, usability, and scalable architecture.
          </p>
        </div>

        {/* Projects */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <ProjectCard
            title="FixMate Mobile"
            url="https://fixmatemobile.com"
            desc="A service-based business website built for a mobile phone repair company, featuring clear service flows, strong conversion focus, and mobile-first UX."
            tech={[
              "React",
              "Vite",
              "Tailwind CSS",
              "SEO Optimized",
              "Responsive UI",
            ]}
          />

          <ProjectCard
            title="SoftServe Lab"
            url="https://softservelab.vercel.app"
            desc="A SaaS-focused development studio website showcasing modern UI patterns, motion-based navigation, and a premium dark aesthetic inspired by high-end product sites."
            tech={[
              "React",
              "Framer Motion",
              "Tailwind CSS",
              "Component Architecture",
            ]}
          />
        </div>
      </PageSection>
    </div>
  );
}

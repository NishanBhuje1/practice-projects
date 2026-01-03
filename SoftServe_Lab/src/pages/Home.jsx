import PageSection from "../components/layout/PageSection.jsx";

export default function Home() {
  return (
    <>
      <PageSection header="Crafting Innovative Solutions" subtitle="Empowering businesses with modern web applications">
        <div className="heroGlow">
          <h1 className="h1 mb-6">Crafting Innovative Solutions</h1>
          <p className="lead">
            We design and build modern web applications with custom frontend, robust backend systems, and scalable cloud infrastructure.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/book" className="btn">Book a Consultation</a>
            <a href="/contact" className="btn-outline">Contact Us</a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Fast Delivery", "MVP-ready builds in days, not months."],
              ["Modern Stack", "React + scalable APIs + clean deployments."],
              ["Business Focused", "Built around conversions and outcomes."],
            ].map(([t, d]) => (
              <div key={t} className="card">
                <div className="font-semibold">{t}</div>
                <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted))" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection header="Our Expertise" subtitle="Frontend, backend, and cloud setup">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Custom Frontend Development", "Intuitive, user-friendly interfaces that feel premium."],
            ["Robust Backend Systems", "Maintainable systems designed around your business workflows."],
            ["Scalable Cloud Infrastructure", "Modern deployments with performance and growth in mind."],
          ].map(([t, d]) => (
            <div key={t} className="card">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted))" }}>{d}</p>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}

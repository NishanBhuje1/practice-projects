import { Link } from "react-router-dom";
import PageSection from "../components/layout/PageSection.jsx";
import Button from "../components/ui/Button.jsx";

function ExpertiseRow({ title, desc }) {
  return (
    <div className="grid gap-6 md:grid-cols-12 items-end">
      <div className="md:col-span-5">
        <div className="flex items-start gap-4">
          <div className="mt-2 h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10" />
          <h3 className="text-2xl font-light text-white/90 leading-snug">
            {title}
          </h3>
        </div>
      </div>
      <p className="md:col-span-7 text-sm leading-6 text-white/60 max-w-xl md:justify-self-end">
        {desc}
      </p>
      <div className="md:col-span-12 mt-8 h-px bg-white/10" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-softserve relative overflow-hidden guide-lines">
      {/* top dotted strip (smaller) */}
      <div className="dotted-strip h-6 w-full" />

      {/* HERO */}
      <PageSection
        id="welcome"
        header={null}
        divider="wave"
        contentClassName="pt-6 pb-12 md:pt-8 md:pb-14" // <-- controls gap now
      >
        <div className="text-center">
          <p className="text-sm tracking-[0.18em] uppercase text-white/60">
            Empowering Businesses with Modern Web Applications
          </p>

          <h2 className="display text-[52px] sm:text-[72px] md:text-[88px] text-white/80 mt-6">
            Crafting Innovative
            <br />
            Solutions
          </h2>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/contact">
              <Button>Get in Touch</Button>
            </Link>

            <Link to="/book">
              <Button variant="secondary">Book a Call</Button>
            </Link>
          </div>
        </div>
      </PageSection>

      {/* ABOUT */}
      <PageSection
        id="about"
        header="Section: About"
        divider="line"
        className="pt-0"
        contentClassName="py-16 md:py-20"
      >
        <div className="grid gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <h2 className="display text-5xl md:text-6xl text-white/70">
              About SoftServe
              <br />
              Lab
            </h2>

            <p className="mt-8 text-sm leading-7 text-white/60 max-w-sm">
              SoftServe Lab is a SaaS-focused development studio that designs
              and builds modern web applications with custom frontend, backend
              systems, and scalable cloud infrastructure. We focus on
              performance, maintainability, and long-term product growth.
            </p>

            <div className="mt-8">
              <Link to="/portfolio" className="btn-primary">
                Discover More
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 md:justify-self-end">
            <img
              src="https://plus.unsplash.com/premium_photo-1683134157126-2f0cfd8ee388?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="DEV Team Working Together"
              className="w-full max-w-lg rounded-lg shadow-lg"
            />
          </div>
        </div>
      </PageSection>

      {/* EXPERTISE */}
      <PageSection
        id="expertise"
        header="Section: Expertise"
        divider="none"
        className="pt-0"
        contentClassName="py-16 md:py-20"
      >
        <h2 className="display text-5xl md:text-6xl text-white/70">
          Our Expertise
        </h2>

        <div className="mt-14 space-y-14">
          <ExpertiseRow
            title="Custom Frontend Development"
            desc="We specialize in creating intuitive and user-friendly frontend interfaces, providing seamless experiences for your customers and users."
          />
          <ExpertiseRow
            title="Backend Systems & APIs"
            desc="Robust, maintainable backends with clean APIs, authentication, and data models that scale with your product."
          />
          <ExpertiseRow
            title="Deployment & Cloud Infrastructure"
            desc="Reliable deployments, environments, and performance tuning so your app stays fast under real traffic."
          />
        </div>
      </PageSection>

      <div className="h-12" />
    </div>
  );
}

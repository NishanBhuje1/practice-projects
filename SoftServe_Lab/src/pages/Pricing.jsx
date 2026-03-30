import { Link } from "react-router-dom";
import PageSection from "../components/layout/PageSection.jsx";
import Button from "../components/ui/Button.jsx";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs tracking-wide text-[rgb(var(--fg))]/70 bg-[rgb(var(--fg))]/5 ring-1 ring-[rgb(var(--fg))]/10">
      {children}
    </span>
  );
}

function PricingCard({ title, price, tagline, features = [], highlight = false }) {
  return (
    <div
      className={[
        "relative rounded-3xl p-8 md:p-9",
        "bg-[rgb(var(--fg))]/5 ring-1 ring-[rgb(var(--fg))]/10 backdrop-blur",
        "shadow-[0_18px_60px_-40px_rgba(0,0,0,0.75)]",
        highlight ? "ring-[rgb(var(--fg))]/20 bg-[rgb(var(--fg))]/[0.07]" : "",
      ].join(" ")}
    >
      {highlight ? (
        <div className="absolute -top-3 right-6">
          <Pill>Recommended</Pill>
        </div>
      ) : null}

      <h3 className="text-xl font-medium tracking-tight text-[rgb(var(--fg))]/90">{title}</h3>
      <p className="mt-2 text-sm text-[rgb(var(--fg))]/55 leading-6">{tagline}</p>

      <div className="mt-6 flex items-end gap-2">
        <div className="text-4xl font-light text-[rgb(var(--fg))]/90">{price}</div>
        <div className="pb-1 text-sm text-[rgb(var(--fg))]/50">AUD</div>
      </div>

      <div className="mt-6 h-px bg-[rgb(var(--fg))]/10" />

      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex gap-3 text-sm text-[rgb(var(--fg))]/70 leading-6">
            <span className="mt-[6px] h-2 w-2 rounded-full bg-[rgb(var(--fg))]/40" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link to="/contact">
          <Button className="w-full">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}

function InfoBlock({ title, children }) {
  return (
    <div className="rounded-3xl bg-[rgb(var(--fg))]/5 ring-1 ring-[rgb(var(--fg))]/10 backdrop-blur p-8">
      <h3 className="text-lg font-medium text-[rgb(var(--fg))]/85">{title}</h3>
      <div className="mt-4 text-sm leading-7 text-[rgb(var(--fg))]/65">{children}</div>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="bg-softserve relative overflow-hidden guide-lines">
      {/* top dotted strip */}
      <div className="dotted-strip h-10 w-full" />

      {/* HERO */}
      <PageSection id="pricing-hero" header={null} divider="wave" contentClassName="py-8 md:py-10">
        <div className="text-center pt-4 md:pt-6">
          <p className="text-sm tracking-[0.18em] uppercase text-[rgb(var(--fg))]/60">
            Pricing
          </p>

          <h2 className="display text-[48px] sm:text-[64px] md:text-[78px] text-[rgb(var(--fg))]/85 mt-5">
            Simple plans that
            <br />
            scale with your business
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-[rgb(var(--fg))]/60">
            Hosting, database, security, and backups are fully managed and included in your subscription.
            Choose a plan, launch fast, and grow without technical overhead.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/contact">
              <Button>Get in Touch</Button>
            </Link>
            {/* <Link to="/book">
              <Button variant="secondary">Book a Call</Button>
            </Link> */}
          </div>
        </div>
      </PageSection>

      {/* SETUP FEE */}
      <PageSection id="setup" header="Section: Setup" divider="line" className="pt-0">
        <div className="grid gap-8 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <h2 className="display text-5xl md:text-6xl text-[rgb(var(--fg))]/75">
              One-Time
              <br />
              Setup
            </h2>
            <p className="mt-6 text-sm leading-7 text-[rgb(var(--fg))]/60 max-w-sm">
              Covers onboarding, configuration, and initial implementation. Charged once per client.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-3xl bg-[rgb(var(--fg))]/5 ring-1 ring-[rgb(var(--fg))]/10 backdrop-blur p-8 md:p-9">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-lg font-medium text-[rgb(var(--fg))]/90">Standard Setup</p>
                  <p className="mt-1 text-sm text-[rgb(var(--fg))]/55">
                    Configuration, branding, launch readiness.
                  </p>
                </div>
                <Pill>AUD $600 (one-time)</Pill>
              </div>

              <div className="mt-6 h-px bg-[rgb(var(--fg))]/10" />

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Web application setup & configuration",
                  "Client account creation",
                  "Basic branding (logo, colours, business details)",
                  "Initial data setup (services, pricing, workflow)",
                  "Domain connection (if required)",
                  "Payment gateway setup (if required)",
                  "Training / walkthrough (30–45 mins)",
                ].map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-[rgb(var(--fg))]/70 leading-6">
                    <span className="mt-[6px] h-2 w-2 rounded-full bg-[rgb(var(--fg))]/40" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 text-xs text-[rgb(var(--fg))]/45">
                Note: Setup ensures your system is configured correctly from day one.
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      {/* PLANS */}
      <PageSection id="plans" header="Section: Plans" divider="line" className="pt-0">
        <h2 className="display text-5xl md:text-6xl text-[rgb(var(--fg))]/75">Monthly Subscription</h2>
        <p className="mt-6 text-sm leading-7 text-[rgb(var(--fg))]/60 max-w-2xl">
          Your subscription includes ongoing maintenance, security updates, monitoring, and backups.
          No confusing infrastructure line items—just a clean monthly plan.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PricingCard
            title="Starter"
            price="$49 / month"
            tagline="Best for small shops getting started."
            features={[
              "Web app access",
              "Lead capture & job tracking",
              "Quote → invoice workflow",
              "Customer management",
              "Hosting included",
              "Database included",
              "Basic email support",
              "Automated backups",
            ]}
          />

          <PricingCard
            title="Growth"
            price="$79 / month"
            tagline="Best value. The plan most businesses choose."
            highlight
            features={[
              "Everything in Starter",
              "Automated follow-ups (email/WhatsApp reminders)",
              "Advanced job statuses",
              "Basic reporting",
              "Priority support",
              "Minor feature requests considered",
            ]}
          />

          <PricingCard
            title="Pro"
            price="$119 / month"
            tagline="For established businesses that want optimisation."
            features={[
              "Everything in Growth",
              "SEO tools / analytics integration",
              "Monthly performance check",
              "Higher usage limits",
              "Faster support response",
              "Optional workflow tweaks",
            ]}
          />
        </div>
      </PageSection>

      {/* SUPPORT + SEO */}
      <PageSection id="support-seo" header="Section: Add-ons" divider="none" className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoBlock title="Support & Maintenance (Included)">
            <ul className="mt-4 space-y-2">
              {[
                "Bug fixes",
                "Security updates",
                "Hosting uptime monitoring",
                "Database maintenance",
                "Small changes (text, settings, configuration)",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-[rgb(var(--fg))]/40" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-black/5 ring-1 ring-[rgb(var(--fg))]/10 p-5">
              <p className="text-[rgb(var(--fg))]/80 font-medium">Out of Scope</p>
              <p className="mt-2 text-[rgb(var(--fg))]/60">
                <span className="text-[rgb(var(--fg))]/80">AUD $110 / hour</span> for custom features, major redesigns,
                non-roadmap integrations, or data migrations.
              </p>
            </div>
          </InfoBlock>

          <InfoBlock title="SEO Services (Optional Add-on)">
            <div className="rounded-2xl bg-black/5 ring-1 ring-[rgb(var(--fg))]/10 p-5">
              <p className="text-[rgb(var(--fg))]/80 font-medium">Local SEO Setup</p>
              <p className="mt-1 text-[rgb(var(--fg))]/60">AUD $400 (one-time)</p>
              <ul className="mt-3 space-y-2">
                {[
                  "Google Business Profile optimisation",
                  "On-page SEO (titles, meta, headings)",
                  "Local keywords",
                  "Sitemap + indexing",
                  "Basic performance tracking",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-[7px] h-2 w-2 rounded-full bg-[rgb(var(--fg))]/40" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl bg-black/5 ring-1 ring-[rgb(var(--fg))]/10 p-5">
              <p className="text-[rgb(var(--fg))]/80 font-medium">Ongoing SEO</p>
              <p className="mt-1 text-[rgb(var(--fg))]/60">AUD $300 / month</p>
              <ul className="mt-3 space-y-2">
                {[
                  "Monthly optimisation",
                  "Content tweaks",
                  "Keyword tracking",
                  "Local ranking improvements",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-[7px] h-2 w-2 rounded-full bg-[rgb(var(--fg))]/40" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </InfoBlock>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl bg-[rgb(var(--fg))]/5 ring-1 ring-[rgb(var(--fg))]/10 backdrop-blur p-8 md:p-10 text-center">
          <p className="text-sm tracking-[0.18em] uppercase text-[rgb(var(--fg))]/55">Ready to launch?</p>
          <h3 className="mt-4 text-3xl sm:text-4xl font-light text-[rgb(var(--fg))]/85">
            Let’s set you up and ship fast.
          </h3>
          <p className="mt-4 text-sm sm:text-base text-[rgb(var(--fg))]/60 max-w-2xl mx-auto leading-7">
            Tell me what you need and I’ll recommend the right plan. You can start on Starter and upgrade anytime.
          </p>

          <div className="mt-7 flex items-center justify-center gap-4">
            <Link to="/contact">
              <Button>Get Started</Button>
            </Link>
            {/* <Link to="/book">
              <Button variant="secondary">Book a Call</Button>
            </Link> */}
          </div>
        </div>
      </PageSection>

      <div className="h-20" />
    </div>
  );
}

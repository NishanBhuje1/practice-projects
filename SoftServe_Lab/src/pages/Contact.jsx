import { useMemo, useState } from "react";
import PageSection from "../components/layout/PageSection.jsx";
import Button from "../components/ui/Button.jsx";

export default function Contact() {
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const contactEmail = "support@softservelab.com";
  const phone = "+61 452 508 594";

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("SoftServe Lab — Project enquiry");
    const body = encodeURIComponent(
      "Hi SoftServe Lab,\n\nI'm interested in building a web application.\n\nProject details:\n- Timeline:\n- Budget:\n- Requirements:\n\nThanks,\n"
    );
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }, [contactEmail]);

  function handleSubmit(e) {
    e.preventDefault();

    // Frontend-only demo (no backend). Replace with your API later.
    setStatus({
      type: "success",
      message: "Message sent. We’ll reply shortly.",
    });

    // Optional: clear form
    e.currentTarget.reset();
  }

  return (
    <div className="bg-softserve min-h-screen relative guide-lines">
      {/* top dotted strip */}
      <div className="dotted-strip h-10 w-full" />

      <PageSection id="contact" header="Section: Contact" divider="soft">
        {/* HERO */}
        <h1 className="display text-[42px] sm:text-[56px] md:text-[72px] leading-tight text-white/80 max-w-5xl">
          Let’s Build Something
          <br />
          That Scales
        </h1>

        <div className="mt-6 max-w-2xl text-white/60 text-sm leading-7">
          Tell us what you’re building. We’ll respond with next steps, a rough
          timeline, and an implementation approach tailored to your product.
        </div>

        {/* CONTENT */}
        <div className="mt-14 grid gap-12 md:grid-cols-12">
          {/* LEFT: CONTACT DETAILS */}
          <aside className="md:col-span-4">
            <h2 className="text-xl font-light tracking-wide text-white/70">
              Contact Details
            </h2>

            <div className="mt-6 space-y-4 text-white/60 text-sm">
              <div>
                <div className="text-white/40 text-xs tracking-wide uppercase">
                  Email
                </div>
                <a
                  className="hover:text-white/80 transition"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
              </div>

              <div>
                <div className="text-white/40 text-xs tracking-wide uppercase">
                  Phone
                </div>
                <a
                  className="hover:text-white/80 transition"
                  href={`tel:${phone}`}
                >
                  {phone}
                </a>
              </div>

              <div>
                <div className="text-white/40 text-xs tracking-wide uppercase">
                  Location
                </div>
                <div>Ben Boyd Road, Neutral bay, Sydney, Australia</div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={mailtoHref}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm
                           bg-softAccent text-white/90 hover:text-white
                           hover:bg-softAccentHover transition shadow-soft"
              >
                Email Us
              </a>
            </div>
          </aside>

          {/* RIGHT: FORM */}
          <section className="md:col-span-8">
            <h2 className="text-xl font-light tracking-wide text-white/70">
              Send a Message
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-2xl bg-black/20 ring-1 ring-white/10 p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" name="name" placeholder="Your name" />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Company (optional)"
                  name="company"
                  placeholder="Company name"
                />
                <Field
                  label="Budget (optional)"
                  name="budget"
                  placeholder="$2,000 – $10,000"
                />
              </div>

              <div className="mt-5">
                <label className="block text-white/50 text-xs tracking-wide uppercase mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Describe what you want to build, key features, and timeline…"
                  className="w-full rounded-xl bg-black/30 ring-1 ring-white/10
                             px-4 py-3 text-sm text-white/80 placeholder:text-white/30
                             focus:outline-none focus:ring-2 focus:ring-softAccent/50"
                />
              </div>

              {/* STATUS */}
              {status.type !== "idle" && (
                <div
                  className={`mt-5 text-sm ${
                    status.type === "success"
                      ? "text-emerald-300/80"
                      : "text-red-300/80"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Button type="submit">Send Message</Button>

                <div className="text-xs text-white/40 leading-5">
                  By submitting, you agree we may contact you back about your
                  enquiry.
                </div>
              </div>
            </form>
          </section>
        </div>
      </PageSection>
    </div>
  );
}

/** Small reusable input field */
function Field({ label, name, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-white/50 text-xs tracking-wide uppercase mb-2">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={name === "name" || name === "email"}
        placeholder={placeholder}
        className="w-full rounded-xl bg-black/30 ring-1 ring-white/10
                   px-4 py-3 text-sm text-white/80 placeholder:text-white/30
                   focus:outline-none focus:ring-2 focus:ring-softAccent/50"
      />
    </div>
  );
}

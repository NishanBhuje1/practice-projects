import PageSection from "../components/layout/PageSection.jsx";

export default function Book() {
  return (
    <div className="bg-softserve min-h-screen relative guide-lines">
      <div className="dotted-strip h-10 w-full" />

      <PageSection id="book" header="Section: Book" divider="line" className="pt-0">
        <h1 className="display text-5xl md:text-6xl text-white/70">Book a Call</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60">
          Choose a time that suits you. We’ll clarify your requirements and propose an approach.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <p className="text-sm text-white/70">
              Replace this box with your booking embed (Calendly, TidyCal, etc.).
            </p>
            <div className="mt-6 h-72 rounded-xl bg-black/30 ring-1 ring-white/10 grid place-items-center text-white/40">
              Booking Widget Embed Area
            </div>
          </div>

          <div className="md:col-span-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <h3 className="text-lg font-light text-white/85">What we cover</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>• Scope and priorities</li>
              <li>• Timeline and budget</li>
              <li>• Tech stack recommendations</li>
              <li>• Next steps and deliverables</li>
            </ul>

            <div className="mt-8">
              <a className="btn-primary" href="/contact">
                Prefer Email?
              </a>
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
}

import PageSection from "../components/layout/PageSection.jsx";

export default function Admin() {
  return (
    <div className="bg-softserve min-h-screen relative guide-lines">
      <div className="dotted-strip h-10 w-full" />

      <PageSection id="admin" header="Section: Admin" divider="none" className="pt-0">
        <h1 className="display text-5xl md:text-6xl text-white/70">Admin</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60">
          Internal dashboard styling to match the site theme.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <p className="text-xs text-white/50">KPI</p>
            <p className="mt-2 text-2xl font-light text-white/85">12</p>
            <p className="mt-1 text-sm text-white/50">New inquiries</p>
          </div>

          <div className="md:col-span-8 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <p className="text-sm text-white/70">Recent activity</p>
            <div className="mt-4 space-y-3">
              {["Form submission", "Booking request", "Email reply queued"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-xl bg-black/25 ring-1 ring-white/10 px-4 py-3">
                  <span className="text-sm text-white/70">{t}</span>
                  <span className="text-xs text-white/40">Just now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
}

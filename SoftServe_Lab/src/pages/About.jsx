import PageSection from "../components/layout/PageSection.jsx";

export default function About() {
  return (
    <div className="bg-softserve min-h-screen relative guide-lines">
      {/* top dotted strip */}
      <div className="dotted-strip h-10 w-full" />

      <PageSection
        id="about"
        header="Section: About"
        divider="none"
        className="pt-0"
      >
        {/* HERO TITLE */}
        <h1 className="display text-[42px] sm:text-[56px] md:text-[72px] leading-tight text-white/80 max-w-5xl">
          Crafting Modern Web
          <br />
          Applications for Business
          <br />
          Growth
        </h1>

        {/* IMAGE */}
        <div className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 bg-black/30">
            <img
              src="https://static.wixstatic.com/media/11062b_165b5e65a7f34255a91e42b5675cac76~mv2.jpg/v1/fill/w_981,h_440,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Open%20Space%20Office.jpg"
              alt="SoftServe Lab team working"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="mt-16 grid gap-12 md:grid-cols-12">
          {/* LEFT – HEADING */}
          <div className="md:col-span-4">
            <h2 className="text-xl font-light tracking-wide text-white/70">
              Our Mission
            </h2>
          </div>

          {/* RIGHT – TEXT */}
          <div className="md:col-span-8">
            <p className="text-sm leading-7 text-white/60 max-w-2xl">
              Soft Serve Lab is a SaaS-focused development studio that designs
              and builds modern web applications with custom frontend, backend
              systems, and scalable cloud infrastructure. We focus on
              performance, maintainability, and long-term product growth.
              <br />
              <br />
              Our mission is to empower businesses with innovative web
              solutions that streamline operations, ensure data security, and
              provide unparalleled user experiences. Leveraging AI-driven
              analytics, we ensure seamless navigation and real-time data
              visualization to meet the dynamic needs of modern enterprises.
            </p>
          </div>
        </div>
      </PageSection>
    </div>
  );
}

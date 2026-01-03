import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";

export default function About() {
  return (
    <PageSection
      title="About"
      subtitle="We build modern websites and internal tools with a premium SaaS finish."
      stickyHeader
      showDividerTop
    >
      <Card className="p-8 max-w-3xl">
        <p>
          SoftServe Lab focuses on maintainable architecture, clean UI systems,
          and measurable performance. This site uses consistent layout sections,
          sticky headers, and subtle dividers for a Wix-style premium feel.
        </p>
      </Card>
    </PageSection>
  );
}

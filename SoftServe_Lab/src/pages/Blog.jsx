import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";

export default function Blog() {
  return (
    <PageSection
      title="Blog"
      subtitle="Updates, notes, and short posts."
      stickyHeader
      showDividerTop
    >
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Coming soon</h3>
          <p className="mt-2">Add posts later or connect a CMS.</p>
        </Card>
      </div>
    </PageSection>
  );
}

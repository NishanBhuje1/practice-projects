import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";

export default function Portfolio() {
  return (
    <PageSection
      title="Portfolio"
      subtitle="Selected work and projects."
      stickyHeader
      showDividerTop
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Project A</h3>
          <p className="mt-2">Brief description of the project.</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Project B</h3>
          <p className="mt-2">Brief description of the project.</p>
        </Card>
      </div>
    </PageSection>
  );
}

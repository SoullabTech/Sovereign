// frontend: app/admin/opus-pulse/page.tsx

import GlobalOpusPulse from '../../../components/admin/opus-pulse/GlobalOpusPulse';
import AxiomHeatmap from '../../../components/admin/opus-pulse/AxiomHeatmap';
import FacetElementGrid from '../../../components/admin/opus-pulse/FacetElementGrid';
import OpusTimeline from '../../../components/admin/opus-pulse/OpusTimeline';

export default function OpusPulsePage() {
  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Opus Pulse Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Steward view of MAIA&apos;s stance: Gold / Edge / Rupture across spirals.
        </p>
      </header>

      <section>
        <GlobalOpusPulse />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <AxiomHeatmap />
        <FacetElementGrid />
      </section>

      <section>
        <OpusTimeline />
      </section>
    </div>
  );
}

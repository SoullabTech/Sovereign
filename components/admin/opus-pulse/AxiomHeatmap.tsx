// frontend: components/admin/opus-pulse/AxiomHeatmap.tsx

'use client';

export default function AxiomHeatmap() {
  // TODO: fetch /api/admin/opus-pulse/axiom-heatmap
  return (
    <div className="rounded-xl border p-4 space-y-2">
      <h2 className="text-lg font-medium">Axiom Heatmap</h2>
      <p className="text-xs text-muted-foreground">
        Where MAIA struggles or shines across the 8 Opus Axioms.
      </p>
      {/* TODO: render matrix once data is wired */}
      <div className="text-xs text-muted-foreground mt-4">
        Heatmap will appear here (axioms × severity).
      </div>
    </div>
  );
}

import ArrivalFlow from '@/components/field/ArrivalFlow';

/**
 * Arrival — a self-contained, additive room inside Personal Field.
 *
 * This is NOT the (paused, episode-gated) Personal Field home redesign. It is a
 * new room holding the Marran/Kane arrival process: reception first (Arrive →
 * Receive → Resonate → Coherence), and only then action (Express). Capture is
 * never the opening posture — the member lands before anything is offered.
 */
export default function ArrivalPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-light tracking-tight">Arrival</h1>
        <p className="text-sm opacity-70">
          What arrived with you today? Say it however it comes. We’ll let it land before anything else.
        </p>
      </header>
      <ArrivalFlow />
    </main>
  );
}

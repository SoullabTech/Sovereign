'use client';

export type SynastryCell = {
  aspect?: string; // e.g. "Trine"
  orb?: number; // e.g. 1.2
  score?: number; // e.g. -3..+3
  title?: string;
  note?: string;
};

function keyFor(a: string, b: string) {
  return `${a}__${b}`;
}

export function SynastryGrid({
  planetsA,
  planetsB,
  cells,
}: {
  planetsA: string[];
  planetsB: string[];
  cells: Record<string, SynastryCell>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-[720px] w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-black/40 border-b border-white/10 px-3 py-2 text-left text-xs font-medium text-white/70">
                A ⟂ B
              </th>
              {planetsB.map((b) => (
                <th
                  key={b}
                  className="z-10 bg-black/30 border-b border-white/10 px-3 py-2 text-left text-xs font-medium text-white/70"
                >
                  {b}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {planetsA.map((a) => (
              <tr key={a}>
                <td className="sticky left-0 z-20 bg-black/40 border-b border-white/10 px-3 py-2 text-xs font-medium text-white/80">
                  {a}
                </td>

                {planetsB.map((b) => {
                  const cell = cells[keyFor(a, b)] ?? cells[keyFor(b, a)] ?? null;

                  return (
                    <td
                      key={b}
                      className="border-b border-white/10 px-3 py-2 align-top"
                    >
                      {cell ? (
                        <div className="space-y-1">
                          <div className="text-xs text-white/80">
                            {cell.aspect ?? '—'}
                            {typeof cell.orb === 'number' ? (
                              <span className="text-white/50"> · orb {cell.orb.toFixed(1)}°</span>
                            ) : null}
                          </div>

                          {typeof cell.score === 'number' ? (
                            <div className="text-[11px] text-white/50">score {cell.score}</div>
                          ) : null}

                          {cell.title ? (
                            <div className="text-xs text-white/70">{cell.title}</div>
                          ) : null}

                          {cell.note ? (
                            <div className="text-[11px] leading-snug text-white/50">
                              {cell.note}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-xs text-white/30">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

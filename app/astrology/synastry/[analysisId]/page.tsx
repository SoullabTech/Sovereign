import { SynastryGrid, type SynastryCell } from '@/components/astrology/SynastryGrid';
import { SynastryActions } from '@/components/astrology/SynastryActions';

type SynastryAspect = {
  aBody: string;
  bBody: string;
  aspect: string;
  orbDeg: number;
  strength: number;
};

type SynastryResult = {
  success: boolean;
  analysisId: string;
  persistedAt?: string;
  updatedAt?: string;
  savedAt?: string | null;
  synastry?: {
    aspects: SynastryAspect[];
    highlights: SynastryAspect[];
    scores: { attraction: number; harmony: number; friction: number; growth: number };
  };
  chartA?: { sunSign: string; moonSign: string };
  chartB?: { sunSign: string; moonSign: string };
};

const ALL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

function aspectsToGridCells(aspects: SynastryAspect[]): Record<string, SynastryCell> {
  const cells: Record<string, SynastryCell> = {};
  for (const asp of aspects) {
    const key = `${asp.aBody}__${asp.bBody}`;
    cells[key] = {
      aspect: asp.aspect.charAt(0).toUpperCase() + asp.aspect.slice(1),
      orb: asp.orbDeg,
      score: Math.round(asp.strength * 3), // Scale to -3..+3 range
    };
  }
  return cells;
}

async function loadSynastry(analysisId: string): Promise<SynastryResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(
    `${baseUrl}/api/astrology/synastry?analysisId=${encodeURIComponent(analysisId)}`,
    { cache: 'no-store' }
  );

  const data = (await res.json()) as any;

  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? 'Failed to load synastry');
  }

  return data as SynastryResult;
}

export default async function SynastryAnalysisPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const data = await loadSynastry(analysisId);

  const cells = aspectsToGridCells(data.synastry?.aspects ?? []);
  const scores = data.synastry?.scores;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Synastry</h1>
            <div className="text-xs text-white/50">
              Analysis: {data.analysisId}
              {data.updatedAt ? ` · Updated: ${new Date(data.updatedAt).toLocaleString()}` : ''}
            </div>
          </div>
          <SynastryActions
            analysisId={data.analysisId}
            initialSavedAt={data.savedAt ?? null}
          />
        </div>

        {/* Chart summaries */}
        {(data.chartA || data.chartB) && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.chartA && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-medium text-white/80">Person A</div>
                <div className="text-xs text-white/50 mt-1">
                  Sun in {data.chartA.sunSign} · Moon in {data.chartA.moonSign}
                </div>
              </div>
            )}
            {data.chartB && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-medium text-white/80">Person B</div>
                <div className="text-xs text-white/50 mt-1">
                  Sun in {data.chartB.sunSign} · Moon in {data.chartB.moonSign}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scores summary */}
        {scores && (
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-3 text-center">
              <div className="text-lg font-semibold text-pink-200">{scores.attraction}</div>
              <div className="text-[10px] text-pink-300/70">Attraction</div>
            </div>
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center">
              <div className="text-lg font-semibold text-green-200">{scores.harmony}</div>
              <div className="text-[10px] text-green-300/70">Harmony</div>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-center">
              <div className="text-lg font-semibold text-orange-200">{scores.friction}</div>
              <div className="text-[10px] text-orange-300/70">Friction</div>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-center">
              <div className="text-lg font-semibold text-violet-200">{scores.growth}</div>
              <div className="text-[10px] text-violet-300/70">Growth</div>
            </div>
          </div>
        )}

        <SynastryGrid
          planetsA={ALL_PLANETS}
          planetsB={ALL_PLANETS}
          cells={cells}
        />
      </div>
    </main>
  );
}

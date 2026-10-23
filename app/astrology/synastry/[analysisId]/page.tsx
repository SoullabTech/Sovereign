export const dynamic = 'force-static';

// Native static export still needs an example route, but its HTML reveals no chart.
export function generateStaticParams() {
  return [{ analysisId: 'default' }];
}

import SynastryAnalysisClient from './SynastryAnalysisClient';

export default async function SynastryAnalysisPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  if (analysisId === 'default' || process.env.CAPACITOR_BUILD) {
    return <main className="min-h-screen px-4 py-20 text-center text-white/60">Open a saved Synastry analysis in your account.</main>;
  }

  return <SynastryAnalysisClient analysisId={analysisId} />;
}

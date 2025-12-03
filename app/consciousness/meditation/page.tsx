import dynamicImport from 'next/dynamic';

// Force static for Capacitor builds, dynamic for dev
export const dynamic = process.env.CAPACITOR_BUILD ? 'force-static' : 'force-dynamic';

const MeditationAwakeningPlatform = dynamicImport(
  () => import('@/components/consciousness/MeditationAwakeningPlatform'),
  { ssr: false }
);

export default function ConsciousnessMeditationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
      <MeditationAwakeningPlatform />
    </div>
  );
}
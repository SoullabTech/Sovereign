import dynamicImport from 'next/dynamic';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';

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
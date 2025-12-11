'use client';

import dynamicImport from 'next/dynamic';

const MeditationAwakeningPlatform = dynamicImport(
  () => import('@/components/consciousness/MeditationAwakeningPlatform')
);

// Force dynamic for Docker/dev builds - Next.js 15 doesn't support conditional exports
export const dynamic = 'force-dynamic';

export default function ConsciousnessMeditationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
      <MeditationAwakeningPlatform />
    </div>
  );
}
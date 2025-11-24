import dynamicImport from 'next/dynamic';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';

const MAIAConsciousnessInterface = dynamicImport(
  () => import('@/components/consciousness/MAIAConsciousnessInterface'),
  { ssr: false }
);

export default function MAIAConsciousnessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-cyan-900/10">
      <MAIAConsciousnessInterface />
    </div>
  );
}
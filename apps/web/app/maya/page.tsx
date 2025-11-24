import dynamicImport from 'next/dynamic';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';

const MayaVoiceChat = dynamicImport(
  () => import('@/components/chat/MayaVoiceChat'),
  { ssr: false }
);

export default function MayaPage() {
  return <MayaVoiceChat />;
}
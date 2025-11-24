// frontend
'use client';

import dynamic from 'next/dynamic';

const OracleConversation = dynamic(
  () => import('../../components/OracleConversation'),
  { ssr: false }
);

export default function OracleConversationPage() {
  return <OracleConversation />;
}

import JournalSemanticSearch from '@/components/journaling/JournalSemanticSearch';

export const metadata = {
  title: 'Semantic Search | Sacred Journaling with MAIA',
  description: 'Ask MAIA questions about your journey. Search by meaning, discover patterns, explore symbolic threads.'
};

export default function SearchPage() {
  return <JournalSemanticSearch />;
}
/**
 * Individual Territory Page
 *
 * Shows posts and discussions for a specific community territory
 * Loads real data from the Community API
 */

import TerritoryPageWrapper from './TerritoryPageWrapper';

// Generate static params for deployment
export async function generateStaticParams() {
  // Return the available community territory slugs for static generation
  return [
    { slug: 'soul-work' },
    { slug: 'practices' },
    { slug: 'traditions' },
    { slug: 'breakthrough' },
    { slug: 'workshop' },
    { slug: 'general' }
  ];
}

export default function TerritoryPage() {
  return <TerritoryPageWrapper />;
}

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
  // These match the actual territories in the database
  return [
    { slug: 'threshold' },
    { slug: 'seeking' },
    { slug: 'practice' },
    { slug: 'breakthrough' },
    { slug: 'offering' },
    { slug: 'circle' },
    { slug: 'foundation' },
    { slug: 'workshop' }
  ];
}

export default function TerritoryPage() {
  return <TerritoryPageWrapper />;
}

/**
 * Individual Category/Channel Page
 *
 * Shows posts and discussions for a specific forum category
 * Loads real data from the Community API
 */

import CategoryPageWrapper from './CategoryPageWrapper';

// Generate static params for deployment
export async function generateStaticParams() {
  // Return the available community channel slugs for static generation
  return [
    { slug: 'announcements' },
    { slug: 'breakthroughs' },
    { slug: 'field-reports' },
    { slug: 'wisdom-traditions' },
    { slug: 'sacred-technologies' },
    { slug: 'general' }
  ];
}

export default function CategoryPage() {
  return <CategoryPageWrapper />;
}
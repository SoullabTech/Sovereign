/**
 * Individual Aspect Detail Page (Server Component)
 *
 * Shows archetypal synthesis + Spiralogic interpretation for a specific aspect
 * URL pattern: /astrology/aspects/sun-square-saturn
 */

import AspectDetailClient from './AspectDetailClient';

// Generate static params for all available aspect interpretations
export async function generateStaticParams() {
  // Define all aspects we have interpretations for
  const aspectSlugs = [
    'sun-saturn-square',
    'sun-saturn-conjunction',
    'sun-saturn-opposition',
    'sun-saturn-trine',
    'sun-moon-conjunction',
    'sun-moon-opposition',
    'sun-mars-conjunction',
    'sun-mars-square',
    'sun-jupiter-trine',
    'sun-jupiter-square',
    'sun-uranus-conjunction',
    'sun-uranus-square',
    'sun-neptune-square',
    'sun-pluto-square',
    'sun-pluto-conjunction',
    'moon-saturn-square',
    'moon-saturn-conjunction',
    'moon-pluto-conjunction',
    'moon-pluto-square',
    'mercury-saturn-conjunction',
    'mercury-uranus-conjunction',
    'venus-saturn-square',
    'venus-pluto-conjunction',
    'venus-uranus-square',
    'mars-saturn-square',
    'mars-pluto-conjunction',
    'mars-pluto-square',
    'jupiter-saturn-conjunction',
    'jupiter-saturn-square',
    'jupiter-uranus-conjunction',
    'jupiter-neptune-conjunction',
    'jupiter-pluto-conjunction',
    'saturn-uranus-square',
    'saturn-neptune-square',
    'saturn-pluto-conjunction',
    'uranus-neptune-conjunction',
    'uranus-pluto-conjunction',
    'neptune-pluto-conjunction',
  ];

  return aspectSlugs.map((slug) => ({
    slug,
  }));
}

export default function AspectDetailPage() {
  return <AspectDetailClient />;
}
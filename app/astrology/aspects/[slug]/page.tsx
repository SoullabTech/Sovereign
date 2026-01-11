/**
 * Individual Aspect Detail Page (Server Component)
 *
 * Shows archetypal synthesis + Spiralogic interpretation for a specific aspect
 * URL pattern: /astrology/aspects/sun-square-saturn
 */

import AspectDetailClient from './AspectDetailClient';

// Generate static params for all available aspect interpretations
// URL format: planet1-aspectType-planet2 (e.g., sun-square-saturn)
export async function generateStaticParams() {
  // Define all aspects we have interpretations for
  // Format: planet1-aspectType-planet2 (matches link generation in /astrology page)
  const aspectSlugs = [
    // Sun aspects
    'sun-square-saturn',
    'sun-conjunction-saturn',
    'sun-opposition-saturn',
    'sun-trine-saturn',
    'sun-conjunction-moon',
    'sun-opposition-moon',
    'sun-conjunction-mars',
    'sun-square-mars',
    'sun-trine-jupiter',
    'sun-square-jupiter',
    'sun-conjunction-uranus',
    'sun-square-uranus',
    'sun-square-neptune',
    'sun-square-pluto',
    'sun-conjunction-pluto',
    // Moon aspects
    'moon-square-saturn',
    'moon-conjunction-saturn',
    'moon-conjunction-pluto',
    'moon-square-pluto',
    // Mercury aspects
    'mercury-conjunction-saturn',
    'mercury-conjunction-uranus',
    // Venus aspects
    'venus-square-saturn',
    'venus-conjunction-pluto',
    'venus-square-uranus',
    // Mars aspects
    'mars-square-saturn',
    'mars-conjunction-pluto',
    'mars-square-pluto',
    // Jupiter aspects
    'jupiter-conjunction-saturn',
    'jupiter-square-saturn',
    'jupiter-conjunction-uranus',
    'jupiter-conjunction-neptune',
    'jupiter-conjunction-pluto',
    // Outer planet aspects
    'saturn-square-uranus',
    'saturn-square-neptune',
    'saturn-conjunction-pluto',
    'uranus-conjunction-neptune',
    'uranus-conjunction-pluto',
    'neptune-conjunction-pluto',
  ];

  return aspectSlugs.map((slug) => ({
    slug,
  }));
}

export default function AspectDetailPage() {
  return <AspectDetailClient />;
}
/**
 * Elemental Pathway Detail Page
 *
 * Shows the 3 houses in each elemental pathway (Fire/Water/Earth/Air)
 * and the archetypal journey through consciousness
 *
 * Dune/Blade Runner aesthetic: Desert mysticism meets cyberpunk precision
 */

import { Metadata } from 'next';
import PathwayDetailClient from './PathwayDetailClient';

// Generate static params for all pathway elements
export async function generateStaticParams() {
  const elementSlugs = [
    'fire',
    'water',
    'earth',
    'air'
  ];

  return elementSlugs.map((element) => ({
    element,
  }));
}

// Generate metadata for each pathway
export async function generateMetadata({ params }: { params: Promise<{ element: string }> }): Promise<Metadata> {
  const { element } = await params;
  const elementNames = {
    fire: 'Fire Pathway - Vision & Projection',
    water: 'Water Pathway - Introspection & Depth',
    earth: 'Earth Pathway - Manifestation & Grounding',
    air: 'Air Pathway - Communication & Connection'
  };

  const title = elementNames[element as keyof typeof elementNames] || 'Elemental Pathway';

  return {
    title: `${title} | MAIA Astrology`,
    description: `Explore the archetypal journey through the ${element} houses and their consciousness evolution.`,
  };
}

interface PathwayDetailPageProps {
  params: Promise<{ element: string }>;
}

export default async function PathwayDetailPage({ params }: PathwayDetailPageProps) {
  const { element } = await params;
  return <PathwayDetailClient element={element} />;
}

/**
 * Elemental Pathway Detail Page
 */

import type { Metadata } from 'next';
import PathwayDetailClient from './PathwayDetailClient';

const ELEMENTS = ['fire', 'water', 'earth', 'air'] as const;
type PathwayElement = (typeof ELEMENTS)[number];

type PathwayPageProps = {
  params: Promise<{ element: string }>;
};

export async function generateStaticParams() {
  return ELEMENTS.map((element) => ({ element }));
}

export async function generateMetadata({ params }: PathwayPageProps): Promise<Metadata> {
  const { element } = await params;
  const elementNames: Record<PathwayElement, string> = {
    fire: 'Fire Pathway - Vision & Projection',
    water: 'Water Pathway - Introspection & Depth',
    earth: 'Earth Pathway - Manifestation & Grounding',
    air: 'Air Pathway - Communication & Connection',
  };
  const title = ELEMENTS.includes(element as PathwayElement)
    ? elementNames[element as PathwayElement]
    : 'Elemental Pathway';
  return {
    title: `${title} | Soullab Astrology`,
    description: `Explore the archetypal journey through the ${element} houses and their consciousness evolution.`,
  };
}

export default async function PathwayDetailPage({ params }: PathwayPageProps) {
  const { element } = await params;
  return <PathwayDetailClient element={element} />;
}

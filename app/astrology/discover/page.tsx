import type { Metadata } from 'next';
import { AstrologyDoorway } from './AstrologyDoorway';

export const metadata: Metadata = {
  title: 'Astrology · Your chart is not a verdict',
  description:
    'Meet your birth chart as a living symbolic whole — calculated carefully, interpreted humbly, and explored in conversation with MAIA.',
};

export default function AstrologyDiscoverPage() {
  return <AstrologyDoorway />;
}

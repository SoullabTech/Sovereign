import { HouseExperience } from '@/app/house/page';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  return <HouseExperience current="home" />;
}

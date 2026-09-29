import { notFound } from 'next/navigation';
import { AtmosphereLab } from './AtmosphereLab';

export default function LivingFieldAtmosphereLabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <AtmosphereLab />;
}

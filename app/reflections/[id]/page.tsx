'use client';

/**
 * /reflections/[id] — one kept reflection.
 *
 * NATIVE: this is a client component on a dynamic segment, so
 * scripts/capacitor-patch-routes.sh strips it from the iOS bundle by design
 * (a client component cannot supply generateStaticParams). That is why the
 * House registers Reflections as a WEB destination rather than a native room —
 * shipping the feed natively while the detail route is absent would reproduce
 * exactly the silent white screen the House navigation contract exists to
 * prevent. See houseDestinations → id 'reflections'.
 */

import { useParams } from 'next/navigation';
import ReflectionDetail from '@/components/reflections/ReflectionDetail';

export default function ReflectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  return <ReflectionDetail id={id} />;
}

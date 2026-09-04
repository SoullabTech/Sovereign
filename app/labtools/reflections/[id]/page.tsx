'use client';

/**
 * /labtools/reflections/[id] — one reflection, founder/lab surface.
 *
 * The member-facing sibling is /reflections/[id]. Same component, same
 * member-scoped data; this address stays behind the requireFounder() gate in
 * app/labtools/layout.tsx.
 */

import { useParams } from 'next/navigation';
import ReflectionDetail from '@/components/reflections/ReflectionDetail';

export default function LabReflectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  return <ReflectionDetail id={id} basePath="/labtools/reflections" />;
}

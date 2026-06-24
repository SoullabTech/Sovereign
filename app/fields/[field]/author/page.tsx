






import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldEssenceInterview from '@/components/masters/FieldEssenceInterview';

/**
 * /fields/[field]/author
 *
 * The master authors their field.
 * This is the first act of field authorship — the Essence Interview.
 *
 * Not publicly linked. The master accesses this directly.
 * Future: gate behind field authentication.
 */
export default async function AuthorPage({
  params,
}: {
  params: Promise<{ field: string }>;
}) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);

  if (!master) notFound();

  // Load existing profile state (if any) from the API
  // Server-side fetch to pre-populate completed modules
  let initialProfile = undefined;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/masters/${slug}/author`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      initialProfile = data.profile;
    }
  } catch {
    // Non-critical — interview starts fresh
  }

  return (
    <FieldEssenceInterview
      master={master}
      initialProfile={initialProfile}
    />
  );
}

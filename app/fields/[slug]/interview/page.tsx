import { redirect } from 'next/navigation';

/**
 * /fields/[field]/interview — friendly alias for the Essence Interview.
 *
 * jondi.soullab.life/interview → middleware rewrites to /fields/jondi/interview
 * → this page redirects to /fields/jondi/author (the actual interview)
 *
 * This keeps the public URL clean without duplicating interview logic.
 */
export default async function InterviewAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: field } = await params;
  redirect(`/fields/${field}/author`);
}

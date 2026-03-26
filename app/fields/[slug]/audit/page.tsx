/**
 * Field-aware Identity Audit — /fields/[field]/audit
 *
 * Server component: resolves field by slug, extracts context, renders client.
 * Supports Individual, Partnership, and Team modes.
 */

import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import { FieldAuditPageClient } from './FieldAuditPageClient';
import type { AuditFieldContext } from '@/lib/maia/prompts/auditTypes';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) return {};
  return {
    title: `${master.shortName} — Identity Audit`,
    description: master.presence.openingLine,
  };
}

export default async function FieldAuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  const fieldContext: AuditFieldContext = {
    masterName: master.name,
    tone: master.maia.tone,
    frameworks: master.maia.frameworks,
    systemPromptBlock: master.maia.systemPromptBlock,
  };

  return (
    <FieldAuditPageClient
      fieldSlug={master.slug}
      fieldShortName={master.shortName}
      openingLine={master.presence.openingLine}
      fieldContext={fieldContext}
    />
  );
}

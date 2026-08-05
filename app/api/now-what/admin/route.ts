export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Now What? — Practitioner Field admin read (the surface behind the door at
 * the bottom of the client Home).
 *
 * SERVER GATE — this route is the boundary, not the door's rendering:
 * practitioner-ness is derived from the authenticated member via
 * `getAuthoredField` (field-scoped ownership: the caller never names a field;
 * the field is derived from the session member). A member who holds no
 * practice field receives 404 — the surface is ABSENT for them, not hidden.
 *
 * §9 FENCE (PRACTITIONER_FIELD_ADMIN_SPEC_2026-07-10), refined by founder
 * direction 2026-08-05: the practitioner field EXISTS to inform the client
 * environment through authored, governed translation — the bridge is the
 * point, not a violation. What this payload therefore monitors is the health
 * and expression of the field AS IT TRANSLATES into client environments:
 * coherence, available resources, expressions in use, revision history.
 * What it may NEVER carry: anything about clients — no positions, counts,
 * activity, reflections, progress, funnels, or aggregates. The practitioner
 * provides the terrain; the client's journey through it is not visible here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { getAuthoredField, listMaterials, listPrograms } from '@/lib/practiceField/programAuthoringService';
import { getPracticeField, formatFieldContextForRoom } from '@/lib/practiceField/practiceFieldService';
import { checkPracticeFieldReadiness } from '@/lib/types/practiceField';

interface RevisionRow {
  revision_number: number;
  saved_by: string;
  note: string | null;
  promoted_from_draft: boolean;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // 401-first: identity before any read.
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    // The gate: holding a practice field IS practitioner-ness. Absent, not 403.
    const authored = await getAuthoredField(memberId);
    if (!authored) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    const field = await getPracticeField(memberId);
    if (!field) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    const readiness = checkPracticeFieldReadiness(field);

    /*
     * Field history — the revision spine (PR #586). Append-only by trigger;
     * this is the §3.1 read surface: what changed, by whom, when.
     */
    let revisions: {
      revisionNumber: number; savedBy: string; note: string | null;
      promotedFromDraft: boolean; createdAt: string;
    }[] = [];
    try {
      const rev = await query<RevisionRow>(
        `SELECT revision_number, saved_by, note, promoted_from_draft, created_at
           FROM practice_field_revisions
          WHERE practice_field_id = $1
          ORDER BY revision_number DESC
          LIMIT 12`,
        [authored.practiceFieldId],
      );
      revisions = rev.rows.map((r) => ({
        revisionNumber: r.revision_number,
        savedBy: r.saved_by,
        note: r.note,
        promotedFromDraft: r.promoted_from_draft,
        createdAt: r.created_at,
      }));
    } catch (err) {
      console.warn('[NowWhat/admin] revisions read failed (non-fatal):', err);
    }

    /*
     * The composed-field view (§3.2): exactly the text the room receives.
     * Read-only witness — seeing what composes is not the same as changing
     * what may compose; no composition rule is altered here.
     */
    const composedPreview = formatFieldContextForRoom(field);

    /*
     * Translation health — which authored expressions are in use, i.e. reach
     * the client environment. `authored` = the practitioner wrote it;
     * `composed` = the room's composition includes it. The conditions mirror
     * formatFieldContextForRoom; composedPreview above remains the
     * authoritative translation truth if these ever drift. welcome_message is
     * deliberately authored-but-not-composed: it is arrival copy, not room
     * context — showing that distinction IS the translation-health fact.
     */
    const expressions = [
      { key: 'welcome_message', label: 'Welcome message', authored: Boolean(field.welcome_message), composed: false },
      { key: 'about_practice', label: 'About this practice', authored: Boolean(field.about_practice), composed: Boolean(field.about_practice) },
      { key: 'how_we_work_together', label: 'How this practice works', authored: Boolean(field.how_we_work_together), composed: Boolean(field.how_we_work_together) },
      { key: 'how_maia_supports', label: 'How MAIA supports it', authored: Boolean(field.how_maia_supports), composed: Boolean(field.how_maia_supports) },
      { key: 'professional_practice', label: 'The practitioner', authored: Boolean(field.professional_practice), composed: Boolean(field.professional_practice) },
      { key: 'maia_guidance', label: 'Field guidance', authored: Boolean(field.maia_guidance), composed: Boolean(field.maia_guidance) },
      { key: 'active_field_content', label: "The field's material", authored: Boolean(field.active_field_content), composed: Boolean(field.active_field_content) },
    ];

    // Counts of the practitioner's OWN authored objects — never member data.
    let materialsCount = 0;
    let programsCount = 0;
    try {
      materialsCount = (await listMaterials(authored)).length;
      programsCount = (await listPrograms(authored)).length;
    } catch (err) {
      console.warn('[NowWhat/admin] authored counts read failed (non-fatal):', err);
    }

    console.info(
      '[NowWhat/admin] read',
      JSON.stringify({
        memberIdPrefix: memberId.slice(0, 8),
        fieldSlug: authored.fieldSlug,
        revisions: revisions.length,
        status: field.status,
      }),
    );

    return NextResponse.json({
      fieldSlug: authored.fieldSlug,
      status: field.status,
      statusReason: field.status_reason ?? null,
      readiness,
      revisions,
      composedPreview,
      expressions,
      materialsCount,
      programsCount,
      activeFieldChars: field.active_field_content?.length ?? 0,
      activeFieldUpdatedAt: field.active_field_updated_at ?? null,
    });
  } catch (err: any) {
    console.error('[NowWhat/admin] GET error:', err?.message || err);
    return NextResponse.json(
      { error: 'Could not open the field right now.' },
      { status: 500 },
    );
  }
}

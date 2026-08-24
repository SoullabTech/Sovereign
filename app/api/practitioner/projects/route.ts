export const dynamic = 'force-dynamic';

/**
 * PRACTITIONER PROJECTS API
 *
 * Returns the practitioner's portal/project info for quick links
 * to their client-facing site (e.g., loralee.soullab.life)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export async function GET(request: NextRequest) {
  try {
    // Get member ID from header (same pattern as practitioner dashboard)
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return unauthenticatedResponse();
    }

    // Find practitioner by member_id
    const practitionerResult = await query(
      `SELECT
        p.id,
        p.slug,
        p.name,
        p.business_name,
        p.status,
        pd.subdomain,
        pd.custom_domain,
        pd.custom_domain_verified
      FROM practitioners p
      LEFT JOIN practitioner_domains pd ON pd.practitioner_id = p.id
      WHERE p.member_id = $1
      LIMIT 1`,
      [memberId]
    );

    const practitioner = practitionerResult.rows?.[0];

    if (!practitioner) {
      // Return structured response so UI can show helpful messaging
      return NextResponse.json({
        ok: false,
        reason: 'NO_PRACTITIONER_LINK',
        message: 'No practitioner record linked to this member.',
        memberId,
        projects: [],
      });
    }

    // Build the project entry
    // The subdomain might be in practitioner_domains or fall back to practitioners.slug
    const subdomain = practitioner.subdomain || practitioner.slug;
    const hasCustomDomain = practitioner.custom_domain && practitioner.custom_domain_verified;

    const project = {
      id: practitioner.id,
      slug: practitioner.slug,
      name: practitioner.business_name || practitioner.name,
      status: practitioner.status,
      // Public URL - prefer verified custom domain, otherwise subdomain
      publicUrl: hasCustomDomain
        ? `https://${practitioner.custom_domain}`
        : `https://${subdomain}.soullab.life`,
      // Internal preview URL (same app, different route)
      previewUrl: `/portal/${practitioner.slug}`,
      // Custom domain info (for future domain management UI)
      customDomain: practitioner.custom_domain || null,
      customDomainVerified: practitioner.custom_domain_verified || false,
    };

    return NextResponse.json({
      practitioner: {
        id: practitioner.id,
        slug: practitioner.slug,
        name: practitioner.name,
      },
      projects: [project], // Array for future multi-portal support
    });
  } catch (error) {
    console.error('[PRACTITIONER PROJECTS] error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

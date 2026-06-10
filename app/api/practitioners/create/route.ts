/**
 * PRACTITIONER CREATE API
 *
 * Creates a new practitioner record linked to an existing member.
 * This is the entry point for members becoming practitioners.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { v4 as uuid } from 'uuid';
import { validateModuleSlugs } from '@/lib/studio/moduleDefinitions';

interface CreatePractitionerInput {
  memberId: string;
  practiceName: string;
  slug: string;
  email: string;
  portalType?: string;
  enabledModules?: string[];
  consultantProfile?: {
    subtypes?: string[];
    industries?: string[];
    modalities?: string[];
    notes?: string;
  };
}

const VALID_PORTAL_TYPES = ['generalist', 'astrology', 'therapy', 'bodywork', 'groups', 'clinician', 'consultant', 'personal'] as const;
type PortalType = typeof VALID_PORTAL_TYPES[number];

function isValidPortalType(t: string): t is PortalType {
  return VALID_PORTAL_TYPES.includes(t as PortalType);
}

/**
 * POST /api/practitioners/create
 *
 * Creates a new practitioner for an existing member.
 * - Validates member exists
 * - Checks slug uniqueness
 * - Creates practitioner record
 * - Creates initial practitioner_themes record
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePractitionerInput = await request.json();
    const {
      memberId,
      practiceName,
      slug,
      email,
      portalType = 'generalist',
      enabledModules,
      consultantProfile,
    } = body;

    // Validate required fields
    if (!memberId || !practiceName || !slug || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId, practiceName, slug, email' },
        { status: 400 }
      );
    }

    // Validate portal type
    if (!isValidPortalType(portalType)) {
      return NextResponse.json(
        { error: `Invalid portal type. Must be one of: ${VALID_PORTAL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate enabled modules (if provided)
    if (enabledModules && !validateModuleSlugs(enabledModules)) {
      return NextResponse.json(
        { error: 'Invalid module slug in enabledModules' },
        { status: 400 }
      );
    }

    // Validate consultant profile (only allowed for consultant type)
    if (consultantProfile && portalType !== 'consultant') {
      return NextResponse.json(
        { error: 'consultantProfile is only valid for consultant portal type' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use 4-50 lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    // Check member exists
    const memberResult = await query<{ id: string; name: string }>(
      'SELECT id, name FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if member already has a practitioner record
    const existingPractitioner = await query<{ id: string }>(
      'SELECT id FROM practitioners WHERE member_id = $1',
      [memberId]
    );

    if (existingPractitioner.rows.length > 0) {
      return NextResponse.json(
        { error: 'Member already has a practitioner account', practitionerId: existingPractitioner.rows[0].id },
        { status: 409 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await query<{ id: string }>(
      'SELECT id FROM practitioners WHERE slug = $1',
      [slug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { error: 'This URL is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Create practitioner and theme in a transaction
    const practitioner = await transaction(async (client) => {
      const practitionerId = uuid();
      const now = new Date().toISOString();

      // Create practitioner record
      await client.query(
        `INSERT INTO practitioners (
          id, member_id, slug, name, email, portal_type, status,
          enabled_modules, consultant_profile, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          practitionerId, memberId, slug, practiceName, email, portalType, 'active',
          enabledModules ? JSON.stringify(enabledModules) : null,
          consultantProfile ? JSON.stringify(consultantProfile) : null,
          now, now,
        ]
      );

      // Keep members.is_practitioner in sync with the authoritative practitioners
      // row. The Studio gate (getCurrentPractitioner) reads the practitioners table
      // directly, but auth whoami, Nostr practitioner gating, caseload, and the team
      // practitioner badge all read this flag — so it must be set on creation.
      await client.query(
        `UPDATE members SET is_practitioner = true, updated_at = NOW() WHERE id = $1`,
        [memberId]
      );

      // Create initial practitioner_themes record with defaults
      const themeId = uuid();
      const defaultTheme = {
        identity: {
          practiceName,
          practitionerName: memberResult.rows[0].name || '',
          domain: `${slug}.soullab.network`,
        },
        theme: {
          colors: {
            primary: '#B8860B',
            secondary: '#2D3748',
            accent: '#D4AF37',
            background: '#1A1A2E',
            surface: '#16213E',
            text: '#E2E8F0',
            textMuted: '#A0AEC0',
            border: '#2D3748',
          },
          typography: {
            heading: 'Cormorant Garamond',
            body: 'Open Sans',
          },
        },
        ai: {
          name: 'MAIA',
          tone: 'warm',
          persona: '',
        },
        features: {
          voice: true,
          textChat: true,
          dreamJournal: false,
          birthChart: true,
          sessionNotes: true,
          progressTracking: false,
          resourceLibrary: false,
          communityForum: false,
        },
      };

      await client.query(
        `INSERT INTO practitioner_themes (
          id, practitioner_id, theme_json, version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [themeId, practitionerId, JSON.stringify(defaultTheme), 1, now, now]
      );

      return {
        id: practitionerId,
        member_id: memberId,
        slug,
        name: practiceName,
        email,
        portal_type: portalType,
        enabled_modules: enabledModules ?? null,
        consultant_profile: consultantProfile ?? null,
        status: 'active',
        created_at: now,
        updated_at: now,
      };
    });

    return NextResponse.json({
      success: true,
      practitioner,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Practitioner Create API] Error:', message, error);
    return NextResponse.json(
      { error: 'Failed to create practitioner', detail: message },
      { status: 500 }
    );
  }
}

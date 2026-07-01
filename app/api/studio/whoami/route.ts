export const dynamic = 'force-dynamic';

/**
 * STUDIO WHOAMI - Identity verification endpoint
 *
 * Returns the current practitioner identity for debugging/verification.
 * Use this to confirm auth chain is working correctly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { getTeamRole, getTeamById } from '@/lib/auth/teamPermissions';

export async function GET(request: NextRequest) {
  try {
    // Get raw member ID first (for debugging)
    const rawMemberId = await getMemberIdFromRequest(request);

    // Get full practitioner identity
    const identity = await getCurrentPractitioner(request);

    // Determine auth method used
    const authMethod = request.headers.get('x-member-id')
      ? 'header'
      : 'cookie';

    if (!rawMemberId) {
      return NextResponse.json({
        authenticated: false,
        status: 401,
        error: 'No member ID found',
        authMethod,
        debug: {
          hasHeader: !!request.headers.get('x-member-id'),
          hasCookie: !!request.cookies.get('maia_member_id'),
        },
      }, { status: 401 });
    }

    if (!identity) {
      return NextResponse.json({
        authenticated: true,
        isPractitioner: false,
        status: 403,
        error: 'Member exists but is not a practitioner',
        memberId: rawMemberId,
        authMethod,
      }, { status: 403 });
    }

    // Resolve active Co-Lab and role for the identity display.
    const jar = await cookies();
    const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value ?? null;
    const teamId = await resolveCurrentTeamId(identity.memberId, cookieTeam);
    const [team, teamRole] = teamId
      ? await Promise.all([getTeamById(teamId), getTeamRole(identity.memberId, teamId)])
      : [null, null];

    return NextResponse.json({
      authenticated: true,
      isPractitioner: true,
      status: 200,
      identity: {
        memberId: identity.memberId,
        practitionerId: identity.practitionerId,
        slug: identity.practitionerSlug,
        name: identity.practitionerName,
        portalType: identity.portalType,
        enabledModules: identity.enabledModules,
        studioMode: identity.studioMode,
        // Co-Lab context — who are you, inside whose workspace, under what authority?
        coLabId: teamId,
        coLabName: team?.name ?? null,
        coLabRole: teamRole ?? null,
      },
      authMethod,
    });
  } catch (error) {
    console.error('[Studio Whoami] Error:', error);
    return NextResponse.json({
      authenticated: false,
      status: 500,
      error: 'Internal error checking identity',
    }, { status: 500 });
  }
}

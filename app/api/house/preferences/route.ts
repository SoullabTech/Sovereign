import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { InvalidHousePreferences, defaultHousePreferences, parseHousePreferences } from '@/lib/house/preferences';
import { readHousePreferences, saveHousePreferences, housePreferenceTag } from '@/lib/house/preferencesStore';
import { HOUSE_PLACES, type HousePlaceId } from '@/lib/house/catalog';
import { cabinStore, cabinMemberFromRequest, setCabinSessionCookie } from '@/lib/cabin/request';
export const dynamic = 'force-dynamic';
const privacyHeaders = { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'Cookie, x-session-token' };
function reply(body: unknown, status = 200, tag?: string) {
  return NextResponse.json(body, { status, headers: { ...privacyHeaders, ...(tag ? { ETag: tag } : {}) } });
}
function failure(error: unknown) {
  if (error instanceof Error && error.message === 'AUTH_REQUIRED') return reply({ error: 'Sign in to arrange your House.', code: 'AUTH_REQUIRED' }, 401);
  if (error instanceof InvalidHousePreferences || error instanceof SyntaxError) return reply({ error: 'These House choices are not valid.', code: 'INVALID_PREFERENCES' }, 400);
  // Never include preferences, credentials, SQL parameters or member identifiers in diagnostics.
  return reply({ error: 'Your House choices could not be confirmed. Please try again.', code: 'PREFERENCES_UNAVAILABLE' }, 503);
}
export async function GET(request: NextRequest) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);
      const eligibleIds = HOUSE_PLACES.map((place) => place.id) as HousePlaceId[];
      const saved = store.readHousePreferences(member.id);
      const preferences = saved
        ? parseHousePreferences({
            version: 1,
            center: saved.center,
            shortcuts: saved.shortcuts,
            passingThrough: saved.passingThrough,
          })
        : defaultHousePreferences(eligibleIds);
      const revision = saved?.revision ?? 0;
      const tag = housePreferenceTag(member.id, revision);
      const response = reply(
        { preferences, revision, eligibleIds, tag },
        200,
        tag,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    } catch (error) {
      return failure(error);
    } finally {
      store.close();
    }
  }

  try {
    const memberId = await requireMemberId();
    if (request.nextUrl.search) return reply({ code: 'UNEXPECTED_PARAMETERS' }, 400);
    const value = await readHousePreferences(memberId, query);
    return reply(value, 200, value.tag);
  } catch (error) { return failure(error); }
}
function isSameOrigin(request: NextRequest, origin: string): boolean {
  try {
    const source = new URL(origin);
    // Compare the HTTP authority. NextURL can normalize 127.0.0.1 to localhost.
    const host = request.headers.get('host') || request.nextUrl.host;
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
      || request.nextUrl.protocol.replace(':', '');
    return source.origin === origin && source.host === host
      && ['http:', 'https:'].includes(source.protocol) && source.protocol === `${protocol}:`;
  } catch { return false; }
}
export async function PUT(request: NextRequest) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);
      if (request.nextUrl.search) return reply({ code: 'UNEXPECTED_PARAMETERS' }, 400);

      const origin = request.headers.get('origin');
      if ((origin && !isSameOrigin(request, origin)) || (!origin && !request.headers.get('x-session-token'))) {
        return reply({ error: 'Open your House and try again.', code: 'ORIGIN_REQUIRED' }, 403);
      }
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
        return reply({ code: 'JSON_REQUIRED' }, 415);
      }

      const body: unknown = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).sort().join(',') !== 'expectedRevision,preferences') {
        throw new InvalidHousePreferences();
      }

      const input = body as { expectedRevision: unknown; preferences: unknown };
      if (!Number.isInteger(input.expectedRevision) || Number(input.expectedRevision) < 0
        || Number(input.expectedRevision) >= 2147483647) {
        throw new InvalidHousePreferences();
      }

      const revision = Number(input.expectedRevision);
      if (request.headers.get('if-match') !== housePreferenceTag(member.id, revision)) {
        return reply(
          { code: 'HOUSE_CONTEXT_CHANGED', error: 'Your saved choices or signed-in account changed. Reload before saving.' },
          409,
        );
      }

      const value = parseHousePreferences(input.preferences);
      const eligibleIds = HOUSE_PLACES.map((place) => place.id) as HousePlaceId[];
      if ([...value.center, ...value.shortcuts].some((id) => !eligibleIds.includes(id))) {
        return reply({ code: 'SHORTCUT_UNAVAILABLE', error: 'A selected place is no longer available to this account.' }, 403);
      }

      const saved = store.saveHousePreferences(
        member.id,
        {
          center: value.center,
          shortcuts: value.shortcuts,
          passingThrough: value.passingThrough,
        },
        revision,
      );

      const tag = housePreferenceTag(member.id, saved.revision);
      const response = reply(
        {
          preferences: value,
          revision: saved.revision,
          eligibleIds,
          tag,
        },
        200,
        tag,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    } catch (error) {
      return failure(error);
    } finally {
      store.close();
    }
  }

  try {
    const memberId = await requireMemberId();
    if (request.nextUrl.search) return reply({ code: 'UNEXPECTED_PARAMETERS' }, 400);
    const origin = request.headers.get('origin');
    if ((origin && !isSameOrigin(request, origin)) || (!origin && !request.headers.get('x-session-token')))
      return reply({ error: 'Open your House and try again.', code: 'ORIGIN_REQUIRED' }, 403);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ code: 'JSON_REQUIRED' }, 415);
    const text = await request.text();
    if (text.length > 4096) return reply({ code: 'PREFERENCES_TOO_LARGE' }, 413);
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || Object.keys(body).sort().join(',') !== 'expectedRevision,preferences') throw new InvalidHousePreferences();
    const input = body as { expectedRevision: unknown; preferences: unknown };
    if (!Number.isInteger(input.expectedRevision) || Number(input.expectedRevision) < 0
      || Number(input.expectedRevision) >= 2147483647) throw new InvalidHousePreferences();
    const revision = Number(input.expectedRevision);
    if (request.headers.get('if-match') !== housePreferenceTag(memberId, revision))
      return reply({ code: 'HOUSE_CONTEXT_CHANGED', error: 'Your saved choices or signed-in account changed. Reload before saving.' }, 409);
    const result = await saveHousePreferences(memberId, parseHousePreferences(input.preferences), revision, query);
    if (result.kind === 'conflict') return reply({ code: 'PREFERENCES_CONFLICT', error: 'Your saved choices changed elsewhere. Your draft has not been discarded.' }, 409);
    if (result.kind === 'ineligible') return reply({ code: 'SHORTCUT_UNAVAILABLE', error: 'A selected place is no longer available to this account.' }, 403);
    return reply(result.snapshot, 200, result.snapshot.tag);
  } catch (error) { return failure(error); }
}

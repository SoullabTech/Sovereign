import type {HousePreferenceSnapshot} from '@/lib/house/preferences';

/** JSON shape returned only after a verified cookie-backed member read. */
export interface HomeViewPayload {
  memberId: string;
  firstName: string;
  livingWorks: Array<{id:string;title:string|null}>;
  housePreferences: HousePreferenceSnapshot;
  houseStudioH1Admitted: boolean;
}

export function isHomeViewPayload(input:unknown, expectedMemberId:string): input is HomeViewPayload {
  if (!input || typeof input !== 'object') return false;
  const data=input as Record<string,unknown>;
  if (data.memberId !== expectedMemberId || typeof data.firstName !== 'string' ||
      !Array.isArray(data.livingWorks) || data.livingWorks.length > 2 ||
      typeof data.houseStudioH1Admitted !== 'boolean') return false;
  if (!data.livingWorks.every(w=>w && typeof w.id==='string' &&
      (w.title === null || typeof w.title==='string'))) return false;
  const prefs=data.housePreferences as Record<string,unknown>|null;
  return !!prefs && typeof prefs === 'object' &&
    typeof prefs.tag === 'string' && !!prefs.preferences &&
    Array.isArray(prefs.eligibleIds);
}

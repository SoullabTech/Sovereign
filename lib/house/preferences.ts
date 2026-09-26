import { DEFAULT_CENTER_IDS, HOUSE_PLACES, placeById, type HousePlaceId } from './catalog';

export type HouseShortcutId = HousePlaceId;

export interface HousePreferences {
  version: 1;
  center: HousePlaceId[];
  shortcuts: HouseShortcutId[];
  passingThrough: 'shared' | 'quiet';
}

export interface HousePreferenceSnapshot {
  preferences: HousePreferences;
  revision: number;
  eligibleIds: HousePlaceId[];
  tag: string;
}

export class InvalidHousePreferences extends Error {
  constructor() { super('INVALID_HOUSE_PREFERENCES'); }
}

export function isHousePlaceId(id: unknown): id is HousePlaceId {
  return typeof id === 'string' && !!placeById(id);
}

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length
    && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}

function parseIds(value: unknown, max: number): HousePlaceId[] {
  if (!Array.isArray(value) || value.length > max || !value.every(isHousePlaceId)
    || new Set(value).size !== value.length) throw new InvalidHousePreferences();
  return [...value];
}

export function parseHousePreferences(value: unknown): HousePreferences {
  if (!exactKeys(value, ['version', 'center', 'shortcuts', 'passingThrough']) || value.version !== 1
    || (value.passingThrough !== 'shared' && value.passingThrough !== 'quiet')) throw new InvalidHousePreferences();
  const center = parseIds(value.center, 5);
  const shortcuts = parseIds(value.shortcuts, HOUSE_PLACES.length);
  return { version: 1, center, shortcuts, passingThrough: value.passingThrough };
}

export function defaultHousePreferences(eligible: readonly HousePlaceId[]): HousePreferences {
  const preferred = DEFAULT_CENTER_IDS.filter(id => eligible.includes(id));
  const fallbacks = HOUSE_PLACES.map(place => place.id)
    .filter(id => eligible.includes(id) && !preferred.includes(id));
  const center = [...preferred, ...fallbacks].slice(0, 5);
  return {
    version: 1,
    center,
    shortcuts: ['journal','ideas','reflections','changes','decisions','relationships','writing','community','astrology']
      .filter((id): id is HousePlaceId => isHousePlaceId(id) && eligible.includes(id)),
    passingThrough: 'shared',
  };
}

export function visibleHouseShortcuts(prefs: HousePreferences, eligible: readonly HousePlaceId[]) {
  return prefs.shortcuts.filter(id => eligible.includes(id)).map(id => placeById(id)!);
}

export function visibleHouseCenter(prefs: HousePreferences, eligible: readonly HousePlaceId[]) {
  return prefs.center.filter(id => eligible.includes(id)).slice(0, 5).map(id => placeById(id)!);
}

export function parseHouseSnapshot(value: unknown): HousePreferenceSnapshot {
  if (!exactKeys(value, ['preferences', 'revision', 'eligibleIds', 'tag'])
    || !Number.isSafeInteger(value.revision) || (value.revision as number) < 0
    || !Array.isArray(value.eligibleIds) || !value.eligibleIds.every(isHousePlaceId)
    || new Set(value.eligibleIds).size !== value.eligibleIds.length
    || typeof value.tag !== 'string' || !/^"hp1-[a-f0-9]{32}-\d+"$/.test(value.tag)
    || !value.tag.endsWith(`-${value.revision}"`)) throw new InvalidHousePreferences();
  return {
    preferences: parseHousePreferences(value.preferences),
    revision: value.revision as number,
    eligibleIds: [...value.eligibleIds],
    tag: value.tag,
  };
}

export function sameHouseOwner(a: string, b: string): boolean {
  return a.split('-')[1] === b.split('-')[1];
}

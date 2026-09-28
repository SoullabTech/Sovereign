import { HOUSE_PLACES } from '../catalog';
import { defaultHousePreferences, parseHousePreferences, parseHouseSnapshot,
  visibleHouseCenter, visibleHouseShortcuts, sameHouseOwner } from '../preferences';
import { housePreferenceTag, readHousePreferences, saveHousePreferences, type HouseQuery } from '../preferencesStore';
const ids = HOUSE_PLACES.map(p => p.id);
const prefs = defaultHousePreferences(ids);
const row = { version: 1, center_ids: ['astrology','journal'], shortcut_ids: ['astrology', 'journal'], passing_through: false, revision: 4 };
describe('P1 presentation contract', () => {
  test('default order matches the accepted Here Now; no new category', () => {
    expect(prefs.center).toEqual(['writing','relationships','practices','community','studio']);
    expect(prefs.shortcuts).toEqual(['journal','ideas','reflections','changes','decisions','relationships','writing','community','astrology']);
    expect(prefs.passingThrough).toBe('shared');
  });
  test('default Center remains five places when Studio is unavailable', () => {
    const nonStudio = ids.filter(id => id !== 'studio');
    expect(defaultHousePreferences(nonStudio).center)
      .toEqual(['writing','relationships','practices','community','decisions']);
  });
  test.each([null, [], {}, { ...prefs, version: 2 }, { ...prefs, memberId:'foreign' },
    { ...prefs, role:'admin' }, { ...prefs, attunement:true }, { ...prefs, shortcuts:['journal','journal'] },
    { ...prefs, shortcuts:['/other'] }, { ...prefs, shortcuts:['research'] },
    { ...prefs, passingThrough:{} }, { ...prefs, passingThrough:'personal' }])('rejects malformed/unsupported or authority-bearing choices %#', value => {
      expect(() => parseHousePreferences(value)).toThrow('INVALID_HOUSE_PREFERENCES');
  });
  test('an intentionally empty foreground is not overwritten by defaults', () => {
    expect(parseHousePreferences({version:1,center:[],shortcuts:[],passingThrough:'quiet'}).shortcuts).toEqual([]);
  });
  test('immutable draft inputs and place identity survive reorder', () => {
    const custom = parseHousePreferences({...prefs, shortcuts:['astrology','journal']});
    const places = visibleHouseShortcuts(custom, ids);
    expect(visibleHouseCenter(custom, ids).map(p => p.id)).toEqual(prefs.center);
    expect(places.map(p => [p.id,p.href,p.mark])).toEqual([
      ['astrology','/astrology?from=house','◉'],['journal','/journal?from=house','▯']]);
    custom.shortcuts.pop(); expect(prefs.shortcuts).toHaveLength(9);
  });
  test('lost eligibility cannot be turned back into a live shortcut by a saved preference', () => {
    expect(visibleHouseShortcuts(prefs, ['journal']).map(p => p.id)).toEqual(['journal']);
  });
  test('owner tags guard account switching but are not credentials', () => {
    expect(sameHouseOwner(housePreferenceTag('A',1),housePreferenceTag('A',2))).toBe(true);
    expect(sameHouseOwner(housePreferenceTag('A',1),housePreferenceTag('B',1))).toBe(false);
  });
  test('validates the saved receipt, not just HTTP 200', () => {
    const value={preferences:prefs,eligibleIds:ids,revision:2,tag:housePreferenceTag('A',2)};
    expect(parseHouseSnapshot(value).revision).toBe(2);
    expect(()=>parseHouseSnapshot({...value,tag:housePreferenceTag('A',1)})).toThrow();
  });
});
describe('P1 owner-scoped SQL', () => {
  test('GET default is read-only and every read binds the verified owner', async () => {
    const q=jest.fn(async (sql:string, values:unknown[]) => { expect(values).toEqual(['A']);
      expect(sql).not.toMatch(/INSERT|UPDATE|DELETE/); return {rows:sql.includes('EXISTS')?[{studio:true}]:[]}; });
    const state=await readHousePreferences('A',q);
    expect(state.revision).toBe(0); expect(state.preferences).toEqual(prefs); expect(q).toHaveBeenCalledTimes(2);
  });
  test('a second read recovers the saved record rather than local storage', async () => {
    const q:HouseQuery=async sql=>({rows:sql.includes('EXISTS')?[{studio:true}]:[row]});
    const state=await readHousePreferences('A',q);
    expect(state.preferences.shortcuts).toEqual(['astrology','journal']); expect(state.preferences.passingThrough).toBe('quiet');
  });
  test('a NULL center keeps following the current eligible default', async () => {
    const saved = {...row, center_ids:null};
    const q:HouseQuery=async sql=>({rows:sql.includes('EXISTS')?[{studio:false}]:[saved]});
    const state=await readHousePreferences('A',q);
    expect(state.preferences.center).toEqual(['writing','relationships','practices','community','decisions']);
  });
  test('malformed stored data fails rather than pretending to be saved defaults', async () => {
    const q:HouseQuery=async sql=>({rows:sql.includes('EXISTS')?[{studio:true}]:[{...row,shortcut_ids:['unknown']}]});
    await expect(readHousePreferences('A',q)).rejects.toThrow();
  });
  test('first-save SQL is conditional insert, not read-then-unconditional-write', async () => {
    const q=jest.fn(async (sql:string, values:unknown[])=>{
      if(sql.includes('AS studio'))return {rows:[{studio:true}]};
      expect(sql).toContain('ON CONFLICT (member_id) DO NOTHING'); expect(values[0]).toBe('A');
      expect(sql).toContain("status = 'active'");return {rows:[{...row,revision:1}]};
    });
    expect((await saveHousePreferences('A',prefs,0,q)).kind).toBe('saved');
  });
  test('stale revisions never overwrite a winner', async () => {
    const q=jest.fn(async(sql:string)=>{
      if(sql.includes('AS studio'))return {rows:[{studio:true}]};
      expect(sql).toContain('WHERE member_id = $1 AND revision = $5'); return {rows:[]};
    });
    expect((await saveHousePreferences('A',prefs,3,q)).kind).toBe('conflict');
  });
  test('a newly ineligible Studio placement is refused without a write', async () => {
    const withStudio = {...prefs, center:[...prefs.center.slice(0,4),'studio'] as typeof prefs.center};
    const q=jest.fn(async()=>({rows:[{studio:false}]}));
    expect((await saveHousePreferences('A',withStudio,0,q)).kind).toBe('ineligible'); expect(q).toHaveBeenCalledTimes(1);
  });
  test('no store read or write touches private content, consent, membership or legacy settings', async () => {
    const q=jest.fn(async(sql:string)=>{
      expect(sql).not.toMatch(/member_settings|journals|capsules|living_works|auth_sessions/);
      return {rows:sql.includes('AS studio')?[{studio:true}]:[row]};
    });
    await readHousePreferences('A',q); await saveHousePreferences('A',prefs,3,q);
  });
});

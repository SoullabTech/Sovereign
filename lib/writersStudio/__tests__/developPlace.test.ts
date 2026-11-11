/**
 * @jest-environment jsdom
 *
 * Founder P0 item 4 (2026-11-11): reopening Develop restores the writer's chapter, per writer and
 * per manuscript; account isolation strict. Fictional ids only.
 */
import {
  __setDevelopPlaceMemberResolver, developPlaceKey, readDevelopPlace, resolveDevelopSection, writeDevelopPlace,
} from '../developPlace';

const INES = '11111111-1111-4111-8111-111111111111';
const TOMAS = '22222222-2222-4222-8222-222222222222';
const SECTIONS = [{ draftSectionId: 'harbour' }, { draftSectionId: 'salt' }, { draftSectionId: 'letter' }];
let member: string | null = INES;
beforeEach(() => { window.localStorage.clear(); member = INES; __setDevelopPlaceMemberResolver(() => member); });
afterAll(() => __setDevelopPlaceMemberResolver(null));

test('reopening without an address returns to the remembered chapter', () => {
  writeDevelopPlace('ms-1', 'salt');
  expect(resolveDevelopSection(SECTIONS, null, readDevelopPlace('ms-1'))).toBe('salt');
});

test('the address still wins over the remembered chapter', () => {
  writeDevelopPlace('ms-1', 'salt');
  expect(resolveDevelopSection(SECTIONS, 'letter', readDevelopPlace('ms-1'))).toBe('letter');
});

test('a remembered chapter that no longer exists falls back to the first, without error', () => {
  writeDevelopPlace('ms-1', 'deleted-chapter');
  expect(resolveDevelopSection(SECTIONS, null, readDevelopPlace('ms-1'))).toBe('harbour');
});

test('another writer on the same browser does not land in the first writer’s chapter', () => {
  writeDevelopPlace('ms-1', 'salt');
  member = TOMAS;
  expect(readDevelopPlace('ms-1')).toBeNull();
  expect(resolveDevelopSection(SECTIONS, null, readDevelopPlace('ms-1'))).toBe('harbour');
});

test('one manuscript’s place does not leak into another', () => {
  writeDevelopPlace('ms-1', 'salt');
  expect(readDevelopPlace('ms-2')).toBeNull();
});

test('no signed-in writer: nothing remembered, nothing written', () => {
  member = null;
  writeDevelopPlace('ms-1', 'salt');
  expect(window.localStorage.length).toBe(0);
  expect(readDevelopPlace('ms-1')).toBeNull();
});

test('stored under the writer’s own key; malformed storage is ignored', () => {
  writeDevelopPlace('ms-1', 'salt');
  expect(window.localStorage.getItem(developPlaceKey(INES, 'ms-1'))).toBe(JSON.stringify({ sectionId: 'salt' }));
  window.localStorage.setItem(developPlaceKey(INES, 'ms-1'), '{not json');
  expect(readDevelopPlace('ms-1')).toBeNull();
});

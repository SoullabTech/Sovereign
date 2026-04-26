/**
 * Birth Data Resolver — unit tests for the pure evaluator.
 *
 * The DB-reading wrapper (`getBirthDataStatus`) is exercised in route
 * integration tests once wiring lands. These tests pin the rule:
 *
 *   sufficient =
 *     birth_date AND birth_time AND birth_timezone AND
 *     (birth_location_name OR (birth_location_lat AND birth_location_lng))
 */

import { evaluateRow, type MemberBirthRow } from '@/lib/symbolic/presence/birthDataResolver';

const FULL: MemberBirthRow = {
  birth_date: '1985-04-26',
  birth_time: '14:30:00',
  birth_timezone: 'America/Los_Angeles',
  birth_location_name: 'Los Angeles, CA, USA',
  birth_location_lat: '34.0522',
  birth_location_lng: '-118.2437',
};

describe('evaluateRow — birth data sufficiency', () => {
  test('null row → both false', () => {
    expect(evaluateRow(null)).toEqual({ self: false, partner: false });
  });

  test('undefined row → both false', () => {
    expect(evaluateRow(undefined)).toEqual({ self: false, partner: false });
  });

  test('fully populated row → self: true', () => {
    expect(evaluateRow(FULL)).toEqual({ self: true, partner: false });
  });

  test('partner is always false (v1)', () => {
    expect(evaluateRow(FULL).partner).toBe(false);
  });

  describe('missing required fields → self: false', () => {
    test('missing birth_date', () => {
      expect(evaluateRow({ ...FULL, birth_date: null }).self).toBe(false);
    });

    test('missing birth_time', () => {
      expect(evaluateRow({ ...FULL, birth_time: null }).self).toBe(false);
    });

    test('empty-string birth_time treated as missing', () => {
      expect(evaluateRow({ ...FULL, birth_time: '' }).self).toBe(false);
      expect(evaluateRow({ ...FULL, birth_time: '   ' }).self).toBe(false);
    });

    test('missing birth_timezone', () => {
      expect(evaluateRow({ ...FULL, birth_timezone: null }).self).toBe(false);
    });

    test('empty-string birth_timezone treated as missing', () => {
      expect(evaluateRow({ ...FULL, birth_timezone: '' }).self).toBe(false);
      expect(evaluateRow({ ...FULL, birth_timezone: '   ' }).self).toBe(false);
    });
  });

  describe('location resolution', () => {
    test('name only (no lat/lng) → self: true', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_lat: null,
          birth_location_lng: null,
        }).self,
      ).toBe(true);
    });

    test('lat+lng only (no name) → self: true', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: null,
        }).self,
      ).toBe(true);
    });

    test('empty-string name and no lat/lng → self: false', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: '',
          birth_location_lat: null,
          birth_location_lng: null,
        }).self,
      ).toBe(false);
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: '   ',
          birth_location_lat: null,
          birth_location_lng: null,
        }).self,
      ).toBe(false);
    });

    test('lat without lng (incomplete coords) and no name → self: false', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: null,
          birth_location_lng: null,
        }).self,
      ).toBe(false);
    });

    test('lng without lat (incomplete coords) and no name → self: false', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: null,
          birth_location_lat: null,
        }).self,
      ).toBe(false);
    });

    test('all three location fields null → self: false', () => {
      expect(
        evaluateRow({
          ...FULL,
          birth_location_name: null,
          birth_location_lat: null,
          birth_location_lng: null,
        }).self,
      ).toBe(false);
    });
  });

  test('numeric lat/lng (vs string) also accepted', () => {
    expect(
      evaluateRow({
        ...FULL,
        birth_location_name: null,
        birth_location_lat: 34.0522 as any,
        birth_location_lng: -118.2437 as any,
      }).self,
    ).toBe(true);
  });

  test('Date object for birth_date also accepted', () => {
    expect(
      evaluateRow({
        ...FULL,
        birth_date: new Date('1985-04-26'),
      }).self,
    ).toBe(true);
  });
});

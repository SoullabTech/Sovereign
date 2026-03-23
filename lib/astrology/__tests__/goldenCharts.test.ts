/**
 * Golden chart regression suite.
 *
 * Run: npx vitest lib/astrology/__tests__/goldenCharts.test.ts
 *
 * Fields marked TODO will be skipped until verified against a trusted reference.
 * Do not change expected values to match failing output — fix the calculation instead.
 */

import { describe, it, expect } from 'vitest';
import { goldenCharts } from './fixtures/goldenCharts';
import { normalizeBirthData } from '../normalizeBirthData';
import { calculateNatalChart } from '../calculateNatalChart';

describe('Astrology Engine — golden chart regression', () => {
  for (const chart of goldenCharts) {
    describe(`${chart.label} [${chart.category}]`, () => {
      const normalized = normalizeBirthData(chart.input);
      const natal = calculateNatalChart(normalized);

      it('display date is correct [CRITICAL]', () => {
        expect(normalized.displayDateLong).toBe(chart.expected.displayDateLong);
      });

      it('Sun sign is correct [CRITICAL]', () => {
        expect(natal.sun.sign).toBe(chart.expected.sunSign);
      });

      if (chart.expected.moonSign && !chart.expected.moonSign.startsWith('TODO')) {
        it('Moon sign is correct [CRITICAL]', () => {
          expect(natal.moon.sign).toBe(chart.expected.moonSign);
        });
      }

      if (chart.expected.ascendant && !chart.expected.ascendant.startsWith('TODO')) {
        it('Ascendant is correct [CRITICAL]', () => {
          expect(natal.ascendant?.sign).toBe(chart.expected.ascendant);
        });
      }

      // Unknown-time charts should not have ascendant
      if (chart.category === 'unknown-time') {
        it('Ascendant is null when birth time unknown [CRITICAL]', () => {
          expect(natal.ascendant).toBeNull();
        });
      }

      it('birth date preserved exactly [CRITICAL]', () => {
        expect(normalized.birthDate).toBe(chart.input.birthDate);
      });

      it('local date parts match source [CRITICAL]', () => {
        const [y, m, d] = chart.input.birthDate.split('-').map(Number);
        expect(normalized.localDateParts.year).toBe(y);
        expect(normalized.localDateParts.month).toBe(m);
        expect(normalized.localDateParts.day).toBe(d);
      });
    });
  }
});

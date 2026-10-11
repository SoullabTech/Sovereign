import { describe, expect, it } from 'vitest';
import { inches, kdpPaperbackCoverGeometry } from '../kdpCoverGeometry';

describe('KDP paperback cover geometry · 6×9 no-bleed interior', () => {
  it('uses KDP white-paper spine thickness and mandatory cover bleed', () => {
    const result = kdpPaperbackCoverGeometry(216, 'white');
    expect(result.spineWidthIn).toBeCloseTo(216 * 0.002252, 8);
    expect(result.fullWidthIn).toBeCloseTo(12.25 + (216 * 0.002252), 8);
    expect(result.fullHeightIn).toBe(9.25);
    expect(result.bleedIn).toBe(0.125);
  });

  it('uses KDP cream-paper spine thickness', () => {
    const result = kdpPaperbackCoverGeometry(216, 'cream');
    expect(result.spineWidthIn).toBeCloseTo(0.54, 8);
    expect(result.fullWidthIn).toBeCloseTo(12.79, 8);
  });

  it('does not claim spine text eligibility at 79 pages or below', () => {
    expect(kdpPaperbackCoverGeometry(79, 'white').spineTextEligible).toBe(false);
    expect(kdpPaperbackCoverGeometry(80, 'white').spineTextEligible).toBe(true);
  });

  it('refuses unknown or non-whole page counts', () => {
    expect(() => kdpPaperbackCoverGeometry(0, 'white')).toThrow(/positive whole page count/i);
    expect(() => kdpPaperbackCoverGeometry(100.5, 'cream')).toThrow(/positive whole page count/i);
  });

  it('formats inch measurements without false precision noise', () => {
    expect(inches(9.25)).toBe('9.25');
    expect(inches(0.54)).toBe('0.54');
    expect(inches(12)).toBe('12');
  });
});

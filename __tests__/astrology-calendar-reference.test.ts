/**
 * Calendar reference vectors. Independent of the implementation: dates are
 * published values, not outputs of the code under test.
 */
import { chineseYearForDate, chineseYearForIsoDate, CHINESE_NEW_YEAR } from '@/lib/astrology/chineseNewYear';
import { traditionalMayaDateFromIso } from '@/lib/astrology/mayanTraditional';
import { calculateHaabDate } from '@/lib/astrology/mayanAstrology';
import { calculateChineseBirthProfile, getChineseZodiacAnimal } from '@/lib/astrology/chineseAstrology';

const PUBLISHED_CNY = `1985-02-20 1987-01-29 1990-01-27 1995-01-31 2000-02-05 2001-01-24 2003-02-01
2004-01-22 2005-02-09 2006-01-29 2007-02-18 2008-02-07 2009-01-26 2010-02-14 2011-02-03 2012-01-23
2013-02-10 2014-01-31 2015-02-19 2016-02-08 2017-01-28 2018-02-16 2019-02-05 2020-01-25 2021-02-12
2022-02-01 2023-01-22 2024-02-10 2025-01-29 2026-02-17`.split(/\s+/);

describe('Chinese New Year table', () => {
  it.each(PUBLISHED_CNY)('%s matches the published date', (iso) => {
    const y = Number(iso.slice(0, 4));
    expect(`${y}-${CHINESE_NEW_YEAR[y]}`).toBe(iso);
  });
  it('covers 1900-2100', () => {
    for (let y = 1900; y <= 2100; y++) expect(CHINESE_NEW_YEAR[y]).toMatch(/^\d\d-\d\d$/);
  });
  it('assigns January and early-February births to the previous year', () => {
    expect(chineseYearForIsoDate('2015-02-18').chineseYear).toBe(2014); // Horse, not Goat
    expect(chineseYearForIsoDate('2015-02-19').chineseYear).toBe(2015); // New Year day itself
    expect(chineseYearForIsoDate('1985-01-21').chineseYear).toBe(1984); // the day the old rule split on
    expect(chineseYearForDate(2003, 9, 3).chineseYear).toBe(2003);
  });
  it('flags dates outside the table as approximate', () => {
    expect(chineseYearForDate(1850, 6, 1).exact).toBe(false);
  });
  it('profile uses the Chinese year', () => {
    const p = calculateChineseBirthProfile(new Date(2015, 1, 10)); // 10 Feb 2015 local
    expect(p.year).toBe(2014);
    expect(p.animal.name).toBe(getChineseZodiacAnimal(2014).name);
  });
});

describe('Traditional Maya count (GMT 584283)', () => {
  it('3 Sep 2003 = 13 Akbal, 11 Mol, 12.19.10.10.3', () => {
    const t = traditionalMayaDateFromIso('2003-09-03');
    expect(t.tzolkin.text).toBe('13 Akbal');
    expect(t.tzolkin.kiche).toBe("Aq'ab'al");
    expect(t.haab.text).toBe('11 Mol');
    expect(t.longCount).toBe('12.19.10.10.3');
  });
  it('21 Dec 2012 = 13.0.0.0.0, 4 Ahau, 3 Kankin', () => {
    const t = traditionalMayaDateFromIso('2012-12-21');
    expect(t.longCount).toBe('13.0.0.0.0');
    expect(t.tzolkin.text).toBe('4 Ahau');
    expect(t.haab.text).toBe('3 Kankin');
  });
  it('the Haab used by the Free page is the traditional one', () => {
    expect(calculateHaabDate(new Date('2003-09-03T12:00:00.000Z')).fullDate).toBe('11 Mol');
  });
});

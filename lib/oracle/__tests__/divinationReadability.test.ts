import fs from 'node:fs';
import path from 'node:path';

import { divinationType } from '../divinationTypography';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const iching = read('app/oracle/iching/page.tsx');
const tarot = read('app/oracle/tarot/page.tsx');
const runes = read('app/oracle/runes/page.tsx');
const maia = read('components/oracle/EmbeddedMAIAChat.tsx');
const globals = read('app/globals.css');

describe('Divination readability conformance', () => {
  it('exposes one shared semantic type map', () => {
    expect(divinationType.fieldLabel).toContain('font-semibold');
    expect(divinationType.fieldBody).toContain('17px');
    expect(divinationType.support).toContain('16px');
    expect(divinationType.metadata).toContain('14px');
    expect(divinationType.action).toContain('16px');
  });

  it('binds I Ching, Tarot, and Runes to the same type grammar', () => {
    for (const source of [iching, tarot, runes]) {
      expect(source).toContain("import { divinationType } from '@/lib/oracle/divinationTypography'");
      expect(source).toContain('divinationType.fieldBody');
      expect(source).toContain('divinationType.fieldLabel');
      expect(source).toContain('divinationType.metadata');
      expect(source).toContain('divinationType.action');
    }
  });

  it('removes ad-hoc micro type from the three Divination rooms and embedded MAIA', () => {
    for (const source of [iching, tarot, runes, maia]) {
      expect(source).not.toContain('text-xs');
      expect(source).not.toContain('text-sm');
      expect(source).not.toContain('text-[10px]');
      expect(source).not.toContain('text-[11px]');
      expect(source).not.toContain('text-[12px]');
    }
  });

  it('overrides the global 16px textarea guard only for Divination reading fields', () => {
    for (const source of [iching, tarot, runes]) {
      expect(source).toContain('divination-reading-field');
    }
    expect(globals).toContain('textarea.divination-reading-field');
    expect(globals).toContain('font-size: 17px !important;');
    expect(globals).toContain('font-size: 18px !important;');
  });

  it('keeps embedded MAIA conversation on House reading roles', () => {
    expect(maia).toContain("import { readability } from '@/lib/house/readability'");
    expect(maia).toContain('readability.reading');
    expect(maia).toContain('readability.body');
    expect(maia).toContain('readability.metadata');
    expect(maia).toContain('readability.action');
  });
});

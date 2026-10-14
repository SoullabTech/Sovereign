import { describe, expect, it } from 'vitest';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { COMPLETE_PREFACE_ID, resolveListenReading, hasListenSessionWork } from '../listenState';
const rows: RebuildSection[] = [
  {draftSectionId:'preface',sourceSectionId:'s1',position:0,heading:'Preface',headingDepth:1,headingSignal:'explicit',body:'Preface words.',editable:true},
  {draftSectionId:'chapter',sourceSectionId:'s2',position:1,heading:'Chapter One',headingDepth:1,headingSignal:'explicit',body:'Chapter words.',editable:true},
];
describe('Listen follows the chosen reading and protects session-only work', () => {
  it('does not replace an explicitly requested chapter with a Preface', () => expect(resolveListenReading(rows,'chapter')).toBe('chapter'));
  it('honors an explicit individual Preface instead of widening to the whole reading', () => expect(resolveListenReading(rows,'preface')).toBe('preface'));
  it('retains the complete-Preface arrival when no reading was requested', () => expect(resolveListenReading(rows,null)).toBe(COMPLETE_PREFACE_ID));
  it('accepts an explicitly chosen complete-Preface projection', () => expect(resolveListenReading(rows,COMPLETE_PREFACE_ID)).toBe(COMPLETE_PREFACE_ID));
  it('refuses an unknown requested section rather than choosing different text', () => expect(resolveListenReading(rows,'unknown')).toBeNull());
  it('does not treat an empty explicit address as permission to substitute', () => expect(resolveListenReading(rows,'')).toBeNull());
  it('does not invent a missing complete Preface', () => expect(resolveListenReading([rows[1]],COMPLETE_PREFACE_ID)).toBeNull());
  it('keeps first-section arrival for writing without a Preface', () => expect(resolveListenReading([rows[1]],null)).toBe('chapter'));
  it('refuses an empty manuscript', () => expect(resolveListenReading([],null)).toBeNull());
  it('does not alter source structure or prose when choosing', () => { const before=JSON.stringify(rows);resolveListenReading(rows,'chapter');expect(JSON.stringify(rows)).toBe(before); });
  it('protects notes even when no take was recorded', () => expect(hasListenSessionWork(0,'A pause to keep.',false)).toBe(true));
  it('protects a retained recording even with no notes', () => expect(hasListenSessionWork(1,'',false)).toBe(true));
  it('protects an active recording before the first take exists', () => expect(hasListenSessionWork(0,'',true)).toBe(true));
  it('does not warn for an empty room', () => expect(hasListenSessionWork(0,'  ',false)).toBe(false));
});

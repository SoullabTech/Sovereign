import { describe, expect, it } from 'vitest';
import { workingDraftBody } from '../workingDraftBody';

describe('workingDraftBody', () => {
  it('removes one exact structural heading from the start of draft text', () => {
    expect(workingDraftBody('Preface\n\n\nOnce upon a time', 'Preface'))
      .toBe('Once upon a time');
  });

  it('handles CRLF draft payloads', () => {
    expect(workingDraftBody('Copyright\r\n\r\nCopyright © 2026', 'Copyright'))
      .toBe('Copyright © 2026');
  });

  it('does not strip similar prose that merely starts with the heading words', () => {
    expect(workingDraftBody('Preface is a word in this sentence.', 'Preface'))
      .toBe('Preface is a word in this sentence.');
  });

  it('does not alter heading-less sections', () => {
    expect(workingDraftBody('Elemental Alchemy\n\nElemental Alchemy', null))
      .toBe('Elemental Alchemy\n\nElemental Alchemy');
  });

  it('removes only the structural occurrence, preserving later authorial text', () => {
    expect(workingDraftBody('Dedication\n\nDedication belongs here.', 'Dedication'))
      .toBe('Dedication belongs here.');
  });
});

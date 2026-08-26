import {
  canExtractText,
  checkArrival,
  isMaterialKind,
  kindById,
  kindForFile,
  MATERIAL_KINDS,
  openingName,
  sizeLabel,
  type ArrivalClaim,
} from '../kinds';

const file = (over: Partial<ArrivalClaim> = {}): ArrivalClaim => ({
  kind: 'document',
  artifactRef: 'studio-materials/abc.pdf',
  artifactHash: 'deadbeef',
  artifactSize: 1024,
  originalFilename: 'notes.pdf',
  sourceUrl: null,
  ...over,
});

const typed = (over: Partial<ArrivalClaim> = {}): ArrivalClaim => ({
  kind: 'note',
  artifactRef: null,
  artifactHash: null,
  artifactSize: null,
  originalFilename: null,
  sourceUrl: null,
  ...over,
});

describe('the kinds a writer can bring in', () => {
  it('offers every kind GATHER-02 promised', () => {
    expect(MATERIAL_KINDS.map((k) => k.id)).toEqual([
      'document',
      'note',
      'transcript',
      'audio',
      'image',
      'link',
    ]);
  });

  it('does not resolve a kind it does not offer', () => {
    expect(kindById('manuscript_fragment')).toBeNull();
    expect(isMaterialKind('anything')).toBe(false);
  });

  it('says plainly that a recording is kept, not transcribed', () => {
    expect(kindById('audio')!.blurb).toContain('not transcribed');
  });

  it('says plainly that a link is not fetched', () => {
    expect(kindById('link')!.blurb).toContain('not fetched');
  });
});

describe('kindForFile', () => {
  it('reads the extension before the MIME type', () => {
    // Browsers routinely send octet-stream or text/plain for .md and .docx.
    expect(kindForFile('chapter.md', 'application/octet-stream')).toBe('document');
    expect(kindForFile('interview.m4a', 'application/octet-stream')).toBe('audio');
  });

  it('falls back to the MIME type when the name says nothing', () => {
    expect(kindForFile('recording', 'audio/mpeg')).toBe('audio');
    expect(kindForFile('scan', 'image/png')).toBe('image');
  });

  it('recognises a subtitle file as a transcript', () => {
    expect(kindForFile('session.vtt')).toBe('transcript');
  });

  it('refuses a file it cannot place rather than guessing document', () => {
    expect(kindForFile('archive.zip', 'application/zip')).toBeNull();
    expect(kindForFile('mystery')).toBeNull();
  });
});

describe('canExtractText — honest about what is read', () => {
  it('reads the document formats it actually parses', () => {
    for (const name of ['a.pdf', 'a.docx', 'a.txt', 'a.md']) {
      expect(canExtractText('document', name)).toBe(true);
    }
  });

  it('does not claim to read a recording or an image', () => {
    expect(canExtractText('audio', 'voice.m4a')).toBe(false);
    expect(canExtractText('image', 'sketch.png')).toBe(false);
  });

  it('does not claim to read a document format it cannot parse', () => {
    expect(canExtractText('document', 'old.rtf')).toBe(false);
    expect(canExtractText('document', 'old.doc')).toBe(false);
  });
});

describe('checkArrival — a material may not claim a provenance it lacks', () => {
  it('accepts a real file', () => {
    expect(checkArrival(file())).toEqual({ ok: true });
  });

  it('accepts a typed note', () => {
    expect(checkArrival(typed())).toEqual({ ok: true });
  });

  it('refuses a note claiming to be an extracted file', () => {
    const v = checkArrival(typed({ artifactRef: 'x', artifactHash: 'y', artifactSize: 1 }));
    expect(v.ok).toBe(false);
  });

  it('refuses an image with no bytes behind it', () => {
    const v = checkArrival(typed({ kind: 'image' }));
    expect(v).toEqual({ ok: false, reason: 'A image must arrive as a file' });
  });

  it('refuses a partial artifact claim — the dangerous one', () => {
    // Looks like custody in a listing, has nothing behind it.
    const v = checkArrival(file({ artifactHash: null }));
    expect(v.ok).toBe(false);
    expect((v as { reason: string }).reason).toContain('bytes, hash and size');
  });

  it('refuses a file with no name of its own', () => {
    const v = checkArrival(file({ originalFilename: null }));
    expect(v.ok).toBe(false);
  });

  it('requires a link to have an address', () => {
    expect(checkArrival(typed({ kind: 'link' })).ok).toBe(false);
    expect(checkArrival(typed({ kind: 'link', sourceUrl: 'https://x.test/a' }))).toEqual({
      ok: true,
    });
  });

  it('refuses an address on anything that is not a link', () => {
    expect(checkArrival(typed({ sourceUrl: 'https://x.test/a' })).ok).toBe(false);
  });

  it('refuses a kind it does not know', () => {
    expect(checkArrival({ ...typed(), kind: 'telepathy' as never }).ok).toBe(false);
  });
});

describe('openingName — a name before the writer has said', () => {
  it('uses the filename the writer chose, without its extension', () => {
    expect(openingName({ kind: 'document', originalFilename: 'Larry interview.docx' })).toBe(
      'Larry interview',
    );
  });

  it('uses a note’s own first line', () => {
    expect(openingName({ kind: 'note', text: '\n\n  chapter opening thought\nmore' })).toBe(
      'chapter opening thought',
    );
  });

  it('names a link by where it points', () => {
    expect(openingName({ kind: 'link', sourceUrl: 'https://www.example.com/jung/essay' })).toBe(
      'example.com/jung/essay',
    );
  });

  it('keeps a malformed address rather than throwing', () => {
    expect(openingName({ kind: 'link', sourceUrl: 'not a url' })).toBe('not a url');
  });

  it('says Untitled rather than inventing one', () => {
    expect(openingName({ kind: 'note', text: '   \n  ' })).toBe('Untitled');
  });

  it('never returns an empty name, which the schema forbids', () => {
    expect(openingName({ kind: 'document', originalFilename: '.pdf' })).not.toBe('');
  });
});

describe('sizeLabel', () => {
  it('speaks in the unit a person would use', () => {
    expect(sizeLabel(512)).toBe('512 bytes');
    expect(sizeLabel(2048)).toBe('2 KB');
    expect(sizeLabel(16_370_251)).toBe('15.6 MB');
  });

  it('says nothing when there is nothing to say', () => {
    expect(sizeLabel(null)).toBeNull();
  });
});

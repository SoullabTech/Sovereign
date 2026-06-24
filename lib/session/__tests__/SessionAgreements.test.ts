import {
  AgreementMode,
  CURRENT_AGREEMENT_VERSION,
  DEFAULT_AGREEMENT_MODE,
  generateAgreementStatements,
  keptAndNotKept,
  resolveRetentionProfile,
  validateVideoLink,
} from '../SessionAgreements';

describe('SessionAgreements — ratified defaults', () => {
  it('defaults to notes', () => {
    expect(DEFAULT_AGREEMENT_MODE).toBe('notes');
  });
});

describe('resolveRetentionProfile — presets match the spec retention matrix', () => {
  it('sanctuary keeps nothing', () => {
    expect(resolveRetentionProfile('sanctuary')).toEqual({
      practitionerNotes: false, recording: false, transcript: 'none', summary: false, memory: false, videoArchive: false,
    });
  });

  it('notes is practitioner-only (no MAIA memory)', () => {
    const p = resolveRetentionProfile('notes');
    expect(p.practitionerNotes).toBe(true);
    expect(p.memory).toBe(false);
    expect(p.recording).toBe(false);
    expect(p.transcript).toBe('none');
    expect(p.summary).toBe(false);
  });

  it('reflection uses a temporary transcript and keeps summary + continuity', () => {
    const p = resolveRetentionProfile('reflection');
    expect(p.transcript).toBe('temporary');
    expect(p.summary).toBe(true);
    expect(p.memory).toBe(true);
    expect(p.recording).toBe(false);
  });

  it('learning keeps recording, kept transcript, and video archive', () => {
    const p = resolveRetentionProfile('learning');
    expect(p.recording).toBe(true);
    expect(p.transcript).toBe('kept');
    expect(p.videoArchive).toBe(true);
  });

  it('custom maps the toggles (transcript on => kept)', () => {
    const p = resolveRetentionProfile('custom', { recording: true, transcript: true });
    expect(p.recording).toBe(true);
    expect(p.transcript).toBe('kept');
    expect(p.summary).toBe(false);
    expect(p.videoArchive).toBe(false);
  });
});

describe('generateAgreementStatements — two-statement rule', () => {
  it('external provider always carries a provider notice naming the provider', () => {
    const s = generateAgreementStatements({ mode: 'notes', provider: 'meet' });
    expect(s.providerNotice).toBeDefined();
    expect(s.providerNotice).toContain('Google Meet');
    expect(s.providerNotice).toContain("outside MAIA's control");
  });

  it('Soullab Video carries no provider notice (sovereign media)', () => {
    const s = generateAgreementStatements({ mode: 'notes', provider: 'soullab' });
    expect(s.providerNotice).toBeUndefined();
  });

  it('sanctuary statement promises not to remember', () => {
    const s = generateAgreementStatements({ mode: 'sanctuary', provider: 'zoom' });
    expect(s.maiaRetention).toContain("won't be remembered");
    expect(s.maiaRetention).toContain('basic session metadata');
    expect(s.maiaRetention).toContain('consent events');
  });

  it('reflection statement names the discarded transcript', () => {
    const s = generateAgreementStatements({ mode: 'reflection', provider: 'zoom' });
    expect(s.maiaRetention).toContain('summary');
    expect(s.maiaRetention).toContain('discarded');
  });

  it('learning statement requires both-party consent', () => {
    const s = generateAgreementStatements({ mode: 'learning', provider: 'doxy' });
    expect(s.maiaRetention).toContain('both practitioner and client');
  });

  it('notes statement is storage-honest (no memory unless marked)', () => {
    const s = generateAgreementStatements({ mode: 'notes', provider: 'zoom' });
    expect(s.maiaRetention).toContain('practitioner notes');
    expect(s.maiaRetention).toContain('unless explicitly marked later');
  });

  it('custom statement is assembled from the resolved profile', () => {
    const s = generateAgreementStatements({ mode: 'custom', provider: 'zoom', customFlags: { recording: true } });
    expect(s.maiaRetention).toContain('video recording');
  });

  it('stamps the current version by default and honors an override', () => {
    expect(generateAgreementStatements({ mode: 'notes', provider: 'zoom' }).version).toBe(CURRENT_AGREEMENT_VERSION);
    expect(generateAgreementStatements({ mode: 'notes', provider: 'zoom', version: 'frozen-x' }).version).toBe('frozen-x');
  });
});

describe('keptAndNotKept — closing ritual lists', () => {
  it('sanctuary keeps only date and duration', () => {
    const r = keptAndNotKept(resolveRetentionProfile('sanctuary'));
    expect(r.kept).toEqual(['date and duration only']);
    expect(r.notKept).toContain('video');
    expect(r.notKept).toContain('raw transcript');
  });

  it('learning keeps recording + transcript with nothing in not-kept', () => {
    const r = keptAndNotKept(resolveRetentionProfile('learning'));
    expect(r.kept).toContain('video recording');
    expect(r.kept).toContain('transcript');
    expect(r.notKept).toEqual([]);
  });

  it('notes keeps practitioner notes but not video or raw transcript', () => {
    const r = keptAndNotKept(resolveRetentionProfile('notes'));
    expect(r.kept).toContain('notes, markers, follow-ups');
    expect(r.notKept).toContain('video');
    expect(r.notKept).toContain('raw transcript');
  });
});

describe('validateVideoLink — write-time https allowlist', () => {
  it('accepts a valid https URL and preserves it for persistence (reveal unchanged)', () => {
    const r = validateVideoLink('zoom', 'https://zoom.us/j/123');
    expect(r.ok).toBe(true);
    expect(r.videoLink).toBe('https://zoom.us/j/123');
  });

  it('rejects a javascript: link', () => {
    const r = validateVideoLink('zoom', 'javascript:alert(1)');
    expect(r.ok).toBe(false);
    expect(r.videoLink).toBeNull();
    expect(r.error).toBeDefined();
  });

  it('rejects a data: link', () => {
    expect(validateVideoLink('zoom', 'data:text/html,<script>x</script>').ok).toBe(false);
  });

  it('rejects a non-https (http:) link', () => {
    const r = validateVideoLink('meet', 'http://meet.example/abc');
    expect(r.ok).toBe(false);
    expect(r.videoLink).toBeNull();
  });

  it('rejects a malformed / empty-host URL', () => {
    expect(validateVideoLink('zoom', 'not a url').ok).toBe(false);
    expect(validateVideoLink('zoom', 'https://').ok).toBe(false);
  });

  it('rejects a blank / whitespace / null external link', () => {
    expect(validateVideoLink('zoom', '').ok).toBe(false);
    expect(validateVideoLink('zoom', '   ').ok).toBe(false);
    expect(validateVideoLink('zoom', null).ok).toBe(false);
  });

  it('trims surrounding whitespace before validating', () => {
    const r = validateVideoLink('zoom', '  https://zoom.us/j/9  ');
    expect(r.ok).toBe(true);
    expect(r.videoLink).toBe('https://zoom.us/j/9');
  });

  it('preserves soullab behavior — no external URL required or persisted', () => {
    expect(validateVideoLink('soullab', null)).toEqual({ ok: true, videoLink: null });
    // even if a stray link is passed, soullab persists none (native room)
    expect(validateVideoLink('soullab', 'https://example.com')).toEqual({ ok: true, videoLink: null });
  });
});

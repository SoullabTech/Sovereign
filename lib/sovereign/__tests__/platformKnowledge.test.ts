import {
  PLATFORM_IDENTITY,
  PLATFORM_AREAS,
  PLATFORM_RELATIONSHIPS,
  PLATFORM_ORIENTATION,
  PLATFORM_KNOWLEDGE_LIMITS,
  PLATFORM_KNOWLEDGE_ADDENDUM,
  PLATFORM_KNOWLEDGE_LAST_VERIFIED,
  PLATFORM_KNOWLEDGE_VERSION,
} from '../platformKnowledge';

// Platform-area grounding tests (2026-07-16).
// These are deterministic guards over the AUTHORED CONTENT — they fail if the
// knowledge layer drifts into account-state claims, diagnostic language,
// directions to closed rooms, or loses the content needed to ground the
// canonical member utterances. They do not test model output.

const ALL = PLATFORM_KNOWLEDGE_ADDENDUM;
const lower = (s: string) => s.toLowerCase();

describe('provenance and versioning', () => {
  it('carries a valid lastVerified date and version', () => {
    expect(PLATFORM_KNOWLEDGE_LAST_VERIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PLATFORM_KNOWLEDGE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('the AREAS block states its own as-of date (stale-block rule)', () => {
    expect(PLATFORM_AREAS).toContain(PLATFORM_KNOWLEDGE_LAST_VERIFIED);
  });

  it('addendum composes all five layers in order', () => {
    const idx = [
      'PLATFORM IDENTITY',
      'PLATFORM AREAS',
      'PLATFORM RELATIONSHIPS',
      'PLATFORM ORIENTATION',
      'PLATFORM KNOWLEDGE LIMITS',
    ].map((h) => ALL.indexOf(h));
    expect(idx[0]).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < idx.length; i++) {
      expect(idx[i]).toBeGreaterThan(idx[i - 1]);
    }
  });
});

describe('never account state', () => {
  const forbidden = [
    'you have access',
    "you don't have access",
    'you should have access',
    'your account state',
    'your tier',
    'your permissions',
    'contact support',
    'help desk',
  ];
  it.each(forbidden)('content never claims: %s', (phrase) => {
    expect(lower(ALL)).not.toContain(phrase);
  });

  it('AREAS explicitly forbids account-state claims', () => {
    expect(lower(PLATFORM_AREAS)).toContain("never claim knowledge of this member's account state");
  });
});

describe('no diagnostic, directive, or authority language', () => {
  const forbidden = [
    'you seem',
    'you appear',
    'you need to',
    'you must',
    'you should go',
    'we recommend',
    'diagnose',
    'diagnosis of you',
    'treatment plan',
    'will predict',
    'predicts your',
    'your therapist',
  ];
  // Lines that QUOTE forbidden phrases as never-said exemplars are mentions,
  // not uses — exclude only those from the scan.
  const spoken = ALL.split('\n')
    .filter((line) => !line.includes('are never said'))
    .join('\n');

  it.each(forbidden)('content never says: %s', (phrase) => {
    expect(lower(spoken)).not.toContain(phrase);
  });

  it('orientation names the refusals: therapy / diagnosis / prediction / authority', () => {
    const o = lower(PLATFORM_ORIENTATION);
    for (const word of ['therapy', 'diagnosis', 'prediction', 'authority']) {
      expect(o).toContain(word);
    }
    expect(o).toContain('never present any area as');
  });

  it('astrology is framed as non-predictive; decisions as non-deciding', () => {
    expect(lower(PLATFORM_AREAS)).toContain('never predictive');
    expect(lower(PLATFORM_AREAS)).toContain('never decides for the member');
  });
});

describe('reachability honesty — no directions to closed or broken doors', () => {
  it('closed rooms carry no routes or navigation directions', () => {
    const closedSection = PLATFORM_AREAS.slice(PLATFORM_AREAS.indexOf('Built but not generally open'));
    expect(closedSection).not.toMatch(/\/relationships|\/journey/);
    expect(closedSection).not.toMatch(/[Rr]eached (by|from|via)/);
  });

  it('no raw internal route paths leak anywhere in the spoken model', () => {
    // Members are directed by UI landmarks (buttons, icons, menus), not URLs.
    expect(ALL).not.toMatch(/\/(api|maia|studio|labtools|now-what)\b/);
  });

  it('Now What? describes the fixed compass entry (R-B: content updated 2026-07-16 for the rail-retarget PR; deploy must follow that merge)', () => {
    const nw = PLATFORM_AREAS.slice(PLATFORM_AREAS.indexOf('Now What?'));
    expect(nw).toContain('compass icon');
    expect(nw).toContain('Find my next step');
  });

  it('quiet features are marked do-not-advertise', () => {
    expect(lower(PLATFORM_AREAS)).toContain('do not advertise');
  });

  it('practitioner working surfaces are marked do-not-proactively-mention', () => {
    expect(lower(PLATFORM_AREAS)).toContain('do not proactively mention');
  });
});

describe('grounding for the canonical member utterances', () => {
  // Each utterance from the test plan must have authored content that grounds
  // the answer — so MAIA is never left to model prior.
  const groundings: Array<[string, string, string]> = [
    ['Help me understand this place.', 'PLATFORM_IDENTITY', 'member environment for reflection'],
    ['Where should I begin?', 'PLATFORM_ORIENTATION', 'where should i begin'],
    ['What should I do next?', 'PLATFORM_ORIENTATION', 'what should i do next'],
    ['What is Studio?', 'PLATFORM_AREAS', 'studio — a workspace'],
    ['What is Journey?', 'PLATFORM_AREAS', 'journey — reflection across'],
    ['What is the Library?', 'PLATFORM_AREAS', 'library — a wisdom archive'],
    ['I had a dream.', 'PLATFORM_AREAS', 'i had a dream'],
    ['I have an idea.', 'PLATFORM_AREAS', "i have an idea i don't want to lose"],
    ['My life is changing.', 'PLATFORM_AREAS', 'something in my life is shifting'],
    ['I need to make a decision.', 'PLATFORM_AREAS', 'torn between options'],
    ['I want to explore a relationship.', 'PLATFORM_AREAS', 'relationships — relational exploration'],
    ["I'm lost.", 'PLATFORM_ORIENTATION', "i'm lost"],
  ];

  const layers: Record<string, string> = {
    PLATFORM_IDENTITY,
    PLATFORM_AREAS,
    PLATFORM_ORIENTATION,
  };

  it.each(groundings)('"%s" is grounded in %s', (_utterance, layer, needle) => {
    expect(lower(layers[layer])).toContain(needle);
  });

  it('"Show me everything I can access" is answerable without account claims', () => {
    // The model answers from the feature tiers; it must have all four tiers.
    for (const tier of [
      'generally available to members',
      'Available under specific roles or invitations',
      'Built but not generally open',
      'Quiet by design',
    ]) {
      expect(PLATFORM_AREAS).toContain(tier);
    }
  });
});

describe('orientation behavior contract', () => {
  it('handles the orientation-vs-decision ambiguity without forcing a doorway', () => {
    const o = lower(PLATFORM_ORIENTATION);
    expect(o).toContain('usually an orientation question, not a life decision');
    expect(o).toContain('never force a doorway');
  });

  it('prescribes the answer order: purpose before navigation', () => {
    expect(lower(PLATFORM_ORIENTATION)).toContain('purpose before navigation');
  });

  it('the host rhythm: understand → answer → orient → optionally offer, never detect-and-route', () => {
    const o = lower(PLATFORM_ORIENTATION);
    expect(o).toContain('understand, then answer, then orient');
    expect(o).toContain('never detect-and-route');
    expect(o).toContain('stay present with the person first');
  });

  it('hospitality anticipates situations, never people', () => {
    const o = lower(PLATFORM_ORIENTATION);
    expect(o).toContain('anticipate situations, never people');
    expect(o).toContain('never infer mood, identity, or need from behavior');
  });

  it('uncertainty resolves to honesty, never invention (LIMITS layer)', () => {
    expect(PLATFORM_KNOWLEDGE_LIMITS).toContain(
      'I may not have a current enough map of that area to answer reliably',
    );
    expect(lower(PLATFORM_KNOWLEDGE_LIMITS)).toContain('never fill a gap');
    expect(lower(PLATFORM_KNOWLEDGE_LIMITS)).toContain('the map wins');
  });
});

describe('Keep is on the map (2026-08-28 — MAIA denied it existed in production)', () => {
  // MAIA answered "can we keep this, I don't see the keep button" with "I don't
  // control the interface directly so I can't save it from my side." Keep was
  // absent from PLATFORM_AREAS entirely, so she had nothing true to say. These
  // guards keep the affordance, its location, and its Sanctuary absence authored.
  it('AREAS carries a Keep entry with its purpose', () => {
    expect(PLATFORM_AREAS).toContain('• Keep —');
    expect(lower(PLATFORM_AREAS)).toContain("holds onto something from a conversation");
  });

  it('names where the conversation-level Keep is found', () => {
    expect(lower(PLATFORM_AREAS)).toContain('bookmark icon near the top of the main screen');
  });

  it('names both forms: the single moment and the wider conversation', () => {
    const a = lower(PLATFORM_AREAS);
    expect(a).toContain("member's own exact words");
    expect(a).toContain('keeping the wider conversation');
  });

  it('states the Sanctuary absence as the boundary working, not a fault', () => {
    const a = lower(PLATFORM_AREAS);
    expect(a).toContain('deliberately absent during sanctuary mode');
    expect(a).toContain('the boundary working, not a fault');
  });

  it('grounds the member utterance "can we keep this"', () => {
    expect(lower(PLATFORM_AREAS)).toContain('can we keep this');
  });

  it('forbids the three false denials MAIA actually produced', () => {
    const a = lower(PLATFORM_AREAS);
    expect(a).toContain('never tell a member that keeping is impossible here');
    expect(a).toContain('no relationship to the interface');
    expect(a).toContain('only option');
  });

  it('naming Keep does not license claiming a keep happened', () => {
    expect(lower(PLATFORM_AREAS)).toContain(
      'naming keep is not claiming a keep happened',
    );
  });
});

describe('one relationship, one voice (composition ruling 2026-07-16)', () => {
  it('no second intelligence is ever named — "Jeeves" never appears in spoken content', () => {
    expect(lower(ALL)).not.toContain('jeeves');
  });

  it('the backstage stays backstage: library/map/guides do not speak', () => {
    const r = lower(PLATFORM_RELATIONSHIPS);
    expect(r).toContain('the library does not speak');
    expect(r).toContain('one relationship and one voice');
    expect(r).toContain('never present retrieval as a second helper');
  });

  it('archive drawing is in MAIA\'s own voice, sources named', () => {
    const r = lower(PLATFORM_RELATIONSHIPS);
    expect(r).toContain('speak in your own voice');
    expect(r).toContain('naming sources');
  });

  it('returning members reconnect only through consented memory', () => {
    const r = lower(PLATFORM_RELATIONSHIPS);
    expect(r).toContain('consented memory');
    expect(r).toContain('offered, never imposed');
  });

  it('new members are welcomed as a host would', () => {
    expect(lower(PLATFORM_ORIENTATION)).toContain('welcome them as a host would');
  });

  it('the house is one whole — presence without a doorway is always available', () => {
    expect(lower(PLATFORM_RELATIONSHIPS)).toContain(
      'a member never needs a feature to be accompanied',
    );
  });
});

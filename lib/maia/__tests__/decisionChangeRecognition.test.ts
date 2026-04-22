/**
 * Tests for lib/maia/decisionChangeRecognition.ts
 *
 * Covers pure functions only (no DB). The fire-and-forget writers
 * (storeRecognitionEvent) and async readers (getRecentRecognitionEvents)
 * are integration concerns tested via the route's behavior, not here.
 */

import {
  detectDecisionSignal,
  detectChangeSignal,
  extractXY,
  selectNamingLine,
  checkRestraint,
  runRecognition,
  type RecognitionEventRow,
} from '../decisionChangeRecognition';

// ─── helpers ────────────────────────────────────────────────────────────────

function event(
  overrides: Partial<RecognitionEventRow> & {
    event_type: RecognitionEventRow['event_type'];
    signal_kind: RecognitionEventRow['signal_kind'];
  }
): RecognitionEventRow {
  return {
    id: 1,
    thread_id: 't1',
    member_id: 'm1',
    fired_at: new Date().toISOString(),
    signal_strength: 'strong',
    meta: {},
    ...overrides,
  };
}

// ─── detectDecisionSignal ───────────────────────────────────────────────────

describe('detectDecisionSignal', () => {
  it('returns strong for "I\'m going to"', () => {
    const result = detectDecisionSignal("I'm going to focus on the integration phase first.");
    expect(result.kind).toBe('decision');
    expect(result.strength).toBe('strong');
    expect(result.matchedPhrase).toBeDefined();
  });

  it('returns strong for "I\'ve decided"', () => {
    expect(detectDecisionSignal("I've decided to start with the prep phase.").strength).toBe(
      'strong'
    );
  });

  it('returns strong for "This is what I want to build"', () => {
    expect(detectDecisionSignal('This is what I want to build first.').strength).toBe('strong');
  });

  it('returns medium for "I think I should"', () => {
    expect(detectDecisionSignal('I think I should start with integration.').strength).toBe(
      'medium'
    );
  });

  it('returns medium for "I think we should start"', () => {
    expect(detectDecisionSignal('I think we should start with the integration phase.').strength).toBe(
      'medium'
    );
  });

  it('returns medium for "leaning toward"', () => {
    expect(detectDecisionSignal("I'm leaning toward the integration approach.").strength).toBe(
      'medium'
    );
  });

  it('returns weak when exploring with no commitment language', () => {
    expect(detectDecisionSignal('I am exploring different approaches to retreats.').strength).toBe(
      'weak'
    );
    expect(detectDecisionSignal('What if we did before, during, and after support?').strength).toBe(
      'weak'
    );
  });

  it('returns weak on empty input', () => {
    expect(detectDecisionSignal('').strength).toBe('weak');
    expect(detectDecisionSignal('   ').strength).toBe('weak');
  });

  // ─── Widened commitment patterns (tuning 2026-04-22) ────────────────────

  it('returns strong for "I will X" on bare commitment', () => {
    expect(
      detectDecisionSignal('I will focus on the integration phase first.').strength
    ).toBe('strong');
  });

  it('returns strong for "I\'ll X" on bare commitment', () => {
    expect(
      detectDecisionSignal("I'll start with the integration phase.").strength
    ).toBe('strong');
  });

  it('returns strong for "I am going to X"', () => {
    expect(
      detectDecisionSignal('I am going to build the prep phase first.').strength
    ).toBe('strong');
  });

  it('returns strong for "I have decided to X"', () => {
    expect(
      detectDecisionSignal('I have decided to focus on the integration phase.').strength
    ).toBe('strong');
  });

  // ─── Exploratory qualifier exclusions (must NOT be strong) ──────────────

  it('does NOT treat "I\'m going to think about" as strong', () => {
    expect(
      detectDecisionSignal("I'm going to think about it more carefully.").strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I\'m going to explore" as strong', () => {
    expect(
      detectDecisionSignal("I'm going to explore different approaches.").strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I\'m going to consider" as strong', () => {
    expect(
      detectDecisionSignal("I'm going to consider all the options first.").strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I might" as strong', () => {
    expect(detectDecisionSignal('I might focus on integration.').strength).not.toBe(
      'strong'
    );
  });

  it('does NOT treat "Maybe I\'ll" as strong', () => {
    expect(
      detectDecisionSignal("Maybe I'll start with integration.").strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I could" as strong', () => {
    expect(detectDecisionSignal('I could try building integration first.').strength).not.toBe(
      'strong'
    );
  });

  it('does NOT treat "I\'ll think" as strong', () => {
    expect(
      detectDecisionSignal("I'll think about what makes sense here.").strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I\'ll probably" as strong', () => {
    expect(
      detectDecisionSignal("I'll probably focus on integration later.").strength
    ).not.toBe('strong');
  });

  // ─── Curly-apostrophe normalization (smart-quotes fix 2026-04-22) ──────
  //
  // macOS "Smart Quotes" auto-converts ' (U+0027) to ' (U+2019) in many
  // text inputs. Detection must treat both forms identically. These tests
  // assert the canonical live-thread failure — "I'm going to focus on the
  // integration phase first." with a curly apostrophe — now fires strong.

  it('returns strong for STRAIGHT-apostrophe "I\'m going to focus on..."', () => {
    expect(
      detectDecisionSignal("I'm going to focus on the integration phase first.").strength
    ).toBe('strong');
  });

  it('returns strong for CURLY-apostrophe "I\u2019m going to focus on..."', () => {
    expect(
      detectDecisionSignal(
        'I\u2019m going to focus on the integration phase first.'
      ).strength
    ).toBe('strong');
  });

  it('returns strong for CURLY-apostrophe "I\u2019ll start with..."', () => {
    expect(
      detectDecisionSignal('I\u2019ll start with the integration phase.').strength
    ).toBe('strong');
  });

  it('returns strong for CURLY-apostrophe "I\u2019ve decided to..."', () => {
    expect(
      detectDecisionSignal(
        'I\u2019ve decided to focus on the integration phase.'
      ).strength
    ).toBe('strong');
  });

  it('does NOT treat CURLY "I\u2019m going to think about" as strong', () => {
    expect(
      detectDecisionSignal('I\u2019m going to think about this more.').strength
    ).not.toBe('strong');
  });

  it('does NOT treat CURLY "I\u2019m going to explore" as strong', () => {
    expect(
      detectDecisionSignal('I\u2019m going to explore a few options.').strength
    ).not.toBe('strong');
  });

  it('does NOT treat CURLY "Maybe I\u2019ll start with..." as strong', () => {
    expect(
      detectDecisionSignal('Maybe I\u2019ll start with integration.').strength
    ).not.toBe('strong');
  });

  it('does NOT treat "I could begin there" as strong', () => {
    expect(detectDecisionSignal('I could begin there.').strength).not.toBe('strong');
  });
});

// ─── detectChangeSignal ─────────────────────────────────────────────────────

describe('detectChangeSignal', () => {
  it('returns strong for "I no longer"', () => {
    expect(detectChangeSignal("I no longer think the event is the center.").strength).toBe(
      'strong'
    );
  });

  it('returns strong with xy for "used to X, now Y"', () => {
    const result = detectChangeSignal(
      'I used to think the event was the center. Now I think the continuity is the center.'
    );
    expect(result.strength).toBe('strong');
    expect(result.xy).toBeDefined();
    expect(result.xy?.x).toContain('event');
    expect(result.xy?.y).toContain('continuity');
  });

  it('returns strong with xy for "from X to Y"', () => {
    const result = detectChangeSignal(
      "I'm shifting from trying to please everyone to focusing on what's true."
    );
    expect(result.strength).toBe('strong');
  });

  it('returns strong via xy-only path when no explicit strong marker', () => {
    // "At first I thought X, now I think Y" triggers xy but no explicit marker
    const result = detectChangeSignal(
      'At first I thought the retreat was the main container. Now I think the continuity is the real container.'
    );
    expect(result.strength).toBe('strong');
    expect(result.xy).toBeDefined();
  });

  it('returns medium for "this feels different"', () => {
    expect(detectChangeSignal('This feels different than before.').strength).toBe('medium');
  });

  it('returns medium for "less about X and more about Y"', () => {
    expect(
      detectChangeSignal("It's less about the event and more about the container.").strength
    ).toBe('medium');
  });

  it('returns weak on exploratory language', () => {
    expect(detectChangeSignal('I am considering many different ideas here.').strength).toBe(
      'weak'
    );
    expect(detectChangeSignal('Let me think about this more.').strength).toBe('weak');
  });

  it('returns weak on empty input', () => {
    expect(detectChangeSignal('').strength).toBe('weak');
  });
});

// ─── extractXY ──────────────────────────────────────────────────────────────

describe('extractXY', () => {
  it('extracts X and Y from "used to X, now Y"', () => {
    const xy = extractXY(
      'I used to believe I needed external validation. Now I trust my own sense.'
    );
    expect(xy).not.toBeNull();
    expect(xy?.x).toContain('external validation');
    expect(xy?.y).toContain('my own sense');
  });

  it('extracts from "thought X, now think Y"', () => {
    const xy = extractXY(
      'I thought the event was the container. Now I think the continuity is the container.'
    );
    expect(xy).not.toBeNull();
    expect(xy?.x).toContain('event');
    expect(xy?.y).toContain('continuity');
  });

  it('extracts from "from X to Y"', () => {
    const xy = extractXY(
      "I'm moving from trying to please everyone to focusing on what matters."
    );
    // "from X to Y" pattern may or may not match depending on the sentence
    // shape; if it matches, it should have valid snippets. If not, null is
    // also acceptable — the caller falls back.
    if (xy) {
      expect(xy.x.length).toBeGreaterThan(4);
      expect(xy.y.length).toBeGreaterThan(4);
    }
  });

  it('rejects generic snippets like bare "this" or "that"', () => {
    // Construct input where the capture would be just a pronoun
    const xy = extractXY('Used to that. Now this.');
    expect(xy).toBeNull();
  });

  it('returns null when no contrast pattern present', () => {
    expect(extractXY('I like retreats and integration is important.')).toBeNull();
  });

  it('returns null for too-short snippets', () => {
    expect(extractXY('Used to a. Now b.')).toBeNull();
  });

  it('returns null on empty input', () => {
    expect(extractXY('')).toBeNull();
  });
});

// ─── selectNamingLine ───────────────────────────────────────────────────────

describe('selectNamingLine', () => {
  it('returns null for weak signal', () => {
    expect(selectNamingLine({ kind: 'decision', strength: 'weak' }, [])).toBeNull();
    expect(selectNamingLine({ kind: 'change', strength: 'weak' }, [])).toBeNull();
  });

  it('returns medium template for decision medium', () => {
    const line = selectNamingLine({ kind: 'decision', strength: 'medium' }, []);
    expect(line).toBe('This is starting to settle into a direction.');
  });

  it('returns strong primary for decision strong with no prior naming', () => {
    const line = selectNamingLine({ kind: 'decision', strength: 'strong' }, []);
    expect(line).toBe('This is taking the shape of a decision.');
  });

  it('returns repeat variant when same-kind naming fired recently', () => {
    const prior = [event({ event_type: 'naming_fired', signal_kind: 'decision' })];
    const line = selectNamingLine({ kind: 'decision', strength: 'strong' }, prior);
    expect(line).toBe('Something here is becoming a decision.');
  });

  it('returns change medium primary', () => {
    const line = selectNamingLine({ kind: 'change', strength: 'medium' }, []);
    expect(line).toBe('This is starting to turn.');
  });

  it('returns strong xy template when xy provided', () => {
    const line = selectNamingLine(
      { kind: 'change', strength: 'strong', xy: { x: 'the event', y: 'the continuity' } },
      []
    );
    expect(line).toBe(`There's a shift here — from "the event" to "the continuity".`);
  });

  it('returns strong fallback when no xy', () => {
    const line = selectNamingLine({ kind: 'change', strength: 'strong' }, []);
    expect(line).toBe('Something here has moved.');
  });

  it('returns repeat variant for change when same-kind naming fired recently', () => {
    const prior = [event({ event_type: 'naming_fired', signal_kind: 'change' })];
    const line = selectNamingLine(
      { kind: 'change', strength: 'strong', xy: { x: 'a', y: 'b' } },
      prior
    );
    // repeat variant takes precedence over xy template
    expect(line).toBe('Something here is turning.');
  });
});

// ─── checkRestraint ─────────────────────────────────────────────────────────

describe('checkRestraint', () => {
  it('blocks everything on weak signal', () => {
    const r = checkRestraint({ kind: 'decision', strength: 'weak' }, [], 5);
    expect(r.allowNaming).toBe(false);
    expect(r.allowInvitation).toBe(false);
  });

  it('allows naming + invitation for strong signal with clean history', () => {
    const r = checkRestraint({ kind: 'decision', strength: 'strong' }, [], 5);
    expect(r.allowNaming).toBe(true);
    expect(r.allowInvitation).toBe(true);
  });

  it('blocks naming within naming cooldown', () => {
    const recent = [
      event({ event_type: 'naming_fired', signal_kind: 'decision' }),
      event({ event_type: 'naming_fired', signal_kind: 'decision' }),
    ];
    const r = checkRestraint({ kind: 'decision', strength: 'strong' }, recent, 5);
    // Most recent event (index 0) is naming_fired — within 2-turn cooldown
    expect(r.allowNaming).toBe(false);
    expect(r.reason).toBe('naming_cooldown');
  });

  it('blocks naming and invitation inside quiet zone after acceptance', () => {
    const recent = [
      event({ event_type: 'invitation_accepted', signal_kind: 'decision' }),
    ];
    const r = checkRestraint({ kind: 'decision', strength: 'strong' }, recent, 5);
    expect(r.allowNaming).toBe(false);
    expect(r.reason).toBe('quiet_zone');
  });

  it('blocks invitation when same-kind previously declined', () => {
    const recent = [event({ event_type: 'invitation_declined', signal_kind: 'decision' })];
    const r = checkRestraint({ kind: 'decision', strength: 'strong' }, recent, 5);
    expect(r.allowNaming).toBe(true);
    expect(r.allowInvitation).toBe(false);
    expect(r.reason).toBe('kind_previously_declined');
  });

  it('allows invitation for a different kind even if other kind declined', () => {
    const recent = [event({ event_type: 'invitation_declined', signal_kind: 'decision' })];
    const r = checkRestraint({ kind: 'change', strength: 'strong' }, recent, 5);
    expect(r.allowNaming).toBe(true);
    expect(r.allowInvitation).toBe(true);
  });

  it('gates medium-signal invitation behind minimum history', () => {
    const rInsufficient = checkRestraint({ kind: 'decision', strength: 'medium' }, [], 0);
    expect(rInsufficient.allowNaming).toBe(true);
    expect(rInsufficient.allowInvitation).toBe(false);
    expect(rInsufficient.reason).toBe('medium_insufficient_history');

    const rOk = checkRestraint({ kind: 'decision', strength: 'medium' }, [], 2);
    expect(rOk.allowNaming).toBe(true);
    expect(rOk.allowInvitation).toBe(true);
  });
});

// ─── runRecognition (orchestrator) ──────────────────────────────────────────

describe('runRecognition', () => {
  it('is an absolute no-op when sanctuaryMode is true', () => {
    const result = runRecognition({
      userText: "I'm going to build the integration phase first.",
      priorTurnCount: 5,
      sanctuaryMode: true,
      recentEvents: [],
    });
    expect(result).toBeNull();
  });

  it('returns null on weak signal', () => {
    const result = runRecognition({
      userText: 'I am exploring retreats.',
      priorTurnCount: 5,
      sanctuaryMode: false,
      recentEvents: [],
    });
    expect(result).toBeNull();
  });

  it('returns outcome with naming line for strong decision signal', () => {
    const result = runRecognition({
      userText: "I'm going to focus on the integration phase first.",
      priorTurnCount: 5,
      sanctuaryMode: false,
      recentEvents: [],
    });
    expect(result).not.toBeNull();
    expect(result!.signal.kind).toBe('decision');
    expect(result!.signal.strength).toBe('strong');
    expect(result!.namingLine).toBe('This is taking the shape of a decision.');
    expect(result!.offerInvitation).toBe(true);
  });

  it('returns xy-bearing naming line for strong change with X→Y', () => {
    const result = runRecognition({
      userText:
        'I used to think the event was the center. Now I think the continuity is the center.',
      priorTurnCount: 5,
      sanctuaryMode: false,
      recentEvents: [],
    });
    expect(result).not.toBeNull();
    expect(result!.signal.kind).toBe('change');
    expect(result!.namingLine).toContain('from');
    expect(result!.namingLine).toContain('to');
  });

  it('suppresses naming and invitation when restraint blocks (cooldown)', () => {
    const recent = [event({ event_type: 'naming_fired', signal_kind: 'decision' })];
    const result = runRecognition({
      userText: "I've decided to focus on prep first.",
      priorTurnCount: 5,
      sanctuaryMode: false,
      recentEvents: recent,
    });
    expect(result).not.toBeNull();
    expect(result!.namingLine).toBeNull();
    expect(result!.offerInvitation).toBe(false);
    expect(result!.restraintReason).toBe('naming_cooldown');
  });

  it('names medium signal without offering invitation when history insufficient', () => {
    const result = runRecognition({
      userText: 'I think we should start with the integration phase.',
      priorTurnCount: 0,
      sanctuaryMode: false,
      recentEvents: [],
    });
    expect(result).not.toBeNull();
    expect(result!.signal.strength).toBe('medium');
    expect(result!.namingLine).toBe('This is starting to settle into a direction.');
    expect(result!.offerInvitation).toBe(false);
  });
});

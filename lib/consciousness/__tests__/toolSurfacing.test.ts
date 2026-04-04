/**
 * Tool Surfacing — Contract Tests
 *
 * Validates that tool surfacing detection, suppression, and exit behavior
 * matches the spec in docs/framework/tool-surfacing-spec.md
 */

import { detectToolSuggestions, assessReadiness, type ToolSurfacingContext } from '../toolSurfacing';

// ─── Helpers ────────────────────────────────────────────────────────────────

const waterPhase2 = { element: 'Water', phase: 2, context: 'general' } as any;
const airPhase1 = { element: 'Air', phase: 1, context: 'general' } as any;
const earthPhase3 = { element: 'Earth', phase: 3, context: 'general' } as any;

function surface(message: string, cell = airPhase1, depth = 5): ReturnType<typeof detectToolSuggestions> {
  return detectToolSuggestions({ message, spiralogicCell: cell, conversationDepth: depth });
}

function topToolId(message: string, cell = airPhase1, depth = 5): string | null {
  const results = surface(message, cell, depth);
  return results.length > 0 ? results[0].toolId! : null;
}

// ─── Belief Lens ────────────────────────────────────────────────────────────

describe('Belief Lens surfacing', () => {
  it('fires on cognitive distortion patterns', () => {
    expect(topToolId('Everyone always lets me down. I keep thinking I can never trust anyone.')).toBe('belief-lens');
  });

  it('fires on certainty markers', () => {
    expect(topToolId('Obviously this is never going to work. The reason is clear.')).toBe('belief-lens');
  });

  it('includes felt language in response', () => {
    const results = surface('I always end up in the same place. Nobody cares.');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].feltLanguage).toBeTruthy();
    expect(results[0].kind).toBe('tool');
    expect(results[0].route).toBe('/labtools/belief-lens');
  });

  it('does not fire at early conversation depth', () => {
    expect(topToolId('Everyone always lets me down.', airPhase1, 1)).toBeNull();
  });

  it('exits on self-reframing language', () => {
    expect(topToolId('I notice Im telling myself that this always happens. Maybe its not true.')).toBeNull();
  });

  it('exits on meta-cognitive awareness', () => {
    expect(topToolId('Thats a story Im telling myself. Thats my interpretation, not fact.')).toBeNull();
  });
});

// ─── Parts & Shadow ─────────────────────────────────────────────────────────

describe('Parts & Shadow surfacing', () => {
  it('fires on inner conflict language', () => {
    expect(topToolId('Part of me wants to leave but another part is terrified.', waterPhase2, 3)).toBe('parts-shadow');
  });

  it('fires on inner critic language', () => {
    expect(topToolId('Whats wrong with me? I should be further along by now. Why cant I just get over this?', waterPhase2, 3)).toBe('parts-shadow');
  });

  it('fires on projection language even with low agency', () => {
    // Projection IS the parts signal — low agency should NOT suppress it
    expect(topToolId('They always do this. People like that never change.', waterPhase2, 4)).toBe('parts-shadow');
  });

  it('wins over belief-lens on mixed signals (priority 1 vs 2)', () => {
    const results = surface('Part of me always thinks people are judging me. I cant stop thinking about it.', airPhase1, 4);
    expect(results[0].toolId).toBe('parts-shadow');
  });

  it('suppressed during dissociation', () => {
    expect(topToolId('I cant feel anything. Everything is foggy. Im not here. Part of me is gone.', waterPhase2, 5)).toBeNull();
  });

  it('suppressed during active crisis', () => {
    expect(topToolId('I want to die. Part of me just wants to end it all.', waterPhase2, 5)).toBeNull();
  });

  it('exits on Self-energy language', () => {
    expect(topToolId('I see that part. It makes sense that it would protect me that way. I understand why.', waterPhase2, 5)).toBeNull();
  });
});

// ─── Brain Trust ────────────────────────────────────────────────────────────

describe('Brain Trust surfacing', () => {
  it('fires on decision paralysis', () => {
    expect(topToolId('I cant decide whether to take the job or stay. On one hand the money, on the other hand my team.', earthPhase3, 6)).toBe('brain-trust');
  });

  it('fires on pros/cons cycling', () => {
    expect(topToolId('Ive been thinking about this for weeks. Option A or B. I keep going back and forth.', earthPhase3, 5)).toBe('brain-trust');
  });

  it('requires minimum 4 interactions', () => {
    expect(topToolId('I cant decide. On one hand this, on the other hand that.', earthPhase3, 3)).toBeNull();
  });

  it('suppressed during grief', () => {
    expect(topToolId('My mother passed away. I cant decide what to do with her things. On one hand I want to keep them.', waterPhase2, 5)).toBeNull();
  });

  it('suppressed during acute flooding', () => {
    expect(topToolId('I cant breathe. I cant decide. Everything is falling apart. On one hand or the other.', waterPhase2, 5)).toBeNull();
  });

  it('exits on decision clarity', () => {
    expect(topToolId('Ive decided. Im going to take the new job. Thats what I want.', earthPhase3, 6)).toBeNull();
  });
});

// ─── Suppression (cross-tool) ───────────────────────────────────────────────

describe('Cross-tool suppression', () => {
  it('suppresses everything during acute distress', () => {
    const results = surface('I cant breathe. Everything is falling apart. Im losing my mind. I cant take this anymore.', waterPhase2, 5);
    expect(results).toHaveLength(0);
  });

  it('suppresses everything during crisis', () => {
    const results = surface('I want to die. I dont see the point anymore.', waterPhase2, 5);
    expect(results).toHaveLength(0);
  });

  it('suppresses everything at very early interaction', () => {
    const results = surface('Everyone always lets me down. Part of me wants to give up. I cant decide anything.', airPhase1, 1);
    expect(results).toHaveLength(0);
  });
});

// ─── Readiness assessment ───────────────────────────────────────────────────

describe('Readiness assessment', () => {
  it('detects high emotional intensity', () => {
    const r = assessReadiness('I cant breathe. Everything is falling apart. Im desperate.');
    expect(r.emotionalIntensity).toBeGreaterThan(0.5);
  });

  it('detects low emotional intensity in calm message', () => {
    const r = assessReadiness('I have been thinking about my career options lately.');
    expect(r.emotionalIntensity).toBe(0);
  });

  it('detects high agency markers', () => {
    const r = assessReadiness('I notice that I tend to react this way. I realize I have a choice here.');
    expect(r.agencyMarkers).toBeGreaterThan(0.5);
  });

  it('detects low agency markers', () => {
    const r = assessReadiness('They always do this to me. They never listen. People always let me down.');
    expect(r.agencyMarkers).toBe(0);
  });

  it('returns 0.5 agency when no markers either way', () => {
    const r = assessReadiness('The weather has been nice this week.');
    expect(r.agencyMarkers).toBe(0.5);
  });
});

// ─── Priority and stacking ──────────────────────────────────────────────────

describe('Priority and stacking', () => {
  it('returns at most 2 tools', () => {
    // Message that could match all 3 tools
    const results = surface(
      'Part of me always thinks everyone is judging me. I cant decide what to do. I keep going back and forth.',
      airPhase1, 5
    );
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('higher priority tools come first', () => {
    // Parts (priority 1) should beat Belief Lens (priority 2) when both match
    const results = surface(
      'Part of me always thinks people are judging me. Everyone always does this.',
      airPhase1, 4
    );
    if (results.length >= 2) {
      expect(results[0].toolId).toBe('parts-shadow');
    }
  });
});

// ─── Action shape ───────────────────────────────────────────────────────────

describe('Action shape', () => {
  it('tool actions have correct shape', () => {
    const results = surface('Everyone always lets me down. I keep thinking about it.');
    expect(results.length).toBeGreaterThan(0);
    const action = results[0];
    expect(action.kind).toBe('tool');
    expect(action.toolId).toBeTruthy();
    expect(action.route).toMatch(/^\/labtools\//);
    expect(action.feltLanguage).toBeTruthy();
    expect(typeof action.silent).toBe('boolean');
    expect(action.elementalResonance).toBeTruthy();
  });

  it('belief-lens is silent by default', () => {
    const results = surface('Everyone always lets me down.');
    const beliefLens = results.find(r => r.toolId === 'belief-lens');
    if (beliefLens) expect(beliefLens.silent).toBe(true);
  });

  it('brain-trust is not silent', () => {
    const results = surface('I cant decide. On one hand this, on the other hand that. I keep going back and forth.', earthPhase3, 5);
    const brainTrust = results.find(r => r.toolId === 'brain-trust');
    if (brainTrust) expect(brainTrust.silent).toBe(false);
  });
});

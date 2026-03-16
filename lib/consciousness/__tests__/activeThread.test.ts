import { deriveActiveThread } from '../activeThread';

describe('deriveActiveThread', () => {
  it('detects stable product-trust thread from repeated topic', () => {
    const result = deriveActiveThread({
      recentTurns: [
        { role: 'user', content: 'The platform keeps dropping context mid-conversation.' },
        { role: 'assistant', content: 'I hear that the drops are frustrating.' },
        { role: 'user', content: 'Every time context drops the trust erodes a bit more.' },
      ],
      latestUserMessage: 'Context drops are the biggest trust problem right now.',
    });

    expect(result.detectedTopic).toBe('context');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.activeThread).toContain('context');
    expect(result.sourceSignals).toContain('repeated_noun');
  });

  it('detects emotional thread with concern language', () => {
    const result = deriveActiveThread({
      recentTurns: [
        { role: 'user', content: 'I feel embarrassed when it forgets what I said.' },
        { role: 'assistant', content: 'That makes sense.' },
      ],
      latestUserMessage: 'It is frustrating and I feel lost in the conversation.',
    });

    expect(result.detectedConcern).toBeTruthy();
    expect(result.sourceSignals).toContain('concern_language');
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it('detects aim language as highest priority', () => {
    const result = deriveActiveThread({
      recentTurns: [
        { role: 'user', content: 'We have been going in circles.' },
        { role: 'assistant', content: 'Tell me more.' },
      ],
      latestUserMessage: 'What I need is for MAIA to actually hold the thread.',
    });

    expect(result.detectedUserAim).toBeTruthy();
    expect(result.sourceSignals).toContain('aim_language');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.activeThread).toContain('What I need');
  });

  it('handles clear topic shift to new subject', () => {
    const result = deriveActiveThread({
      recentTurns: [
        { role: 'user', content: 'We talked about memory.' },
        { role: 'assistant', content: 'Memory is important.' },
      ],
      latestUserMessage: 'Actually I want to talk about something completely different — my sleep.',
    });

    // No repeated noun between previous topic and new message
    // Should reflect the new message
    expect(result.activeThread).toBeTruthy();
    expect(typeof result.confidence).toBe('number');
  });

  it('handles short lightweight talk exchange gracefully', () => {
    const result = deriveActiveThread({
      recentTurns: [],
      latestUserMessage: 'Hi.',
    });

    expect(result.activeThread).toBeTruthy();
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.sourceSignals).toContain('fallback');
  });
});

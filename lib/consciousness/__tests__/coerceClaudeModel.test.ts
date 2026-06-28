import { coerceClaudeModel, DEFAULT_CLAUDE_FALLBACK_MODEL } from '@/lib/consciousness/LLMProvider';

/**
 * Regression guard for the Session Review outage (2026-06-11):
 * under LOCAL_TIER_ENABLED, tier configs carry Ollama model names. generateSimple/
 * generate() could hand those to the Anthropic SDK on the Claude path, producing a
 * 404 ("model: qwen2.5:7b") surfaced as "Primary provider (Claude) unavailable".
 * coerceClaudeModel() is the chokepoint that makes that impossible.
 */
describe('coerceClaudeModel', () => {
  it('passes Claude model ids through unchanged', () => {
    for (const m of [
      'claude-sonnet-4-6',
      'claude-opus-4-6',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-5-20251101',
    ]) {
      expect(coerceClaudeModel(m)).toBe(m);
    }
  });

  it('coerces Ollama/local model ids to the Claude default (never sends them to Anthropic)', () => {
    for (const m of ['qwen2.5:7b', 'qwen2.5:14b-instruct', 'qwen3:32b', 'mistral:7b-instruct', 'deepseek-r1:14b']) {
      expect(coerceClaudeModel(m)).toBe(DEFAULT_CLAUDE_FALLBACK_MODEL);
    }
  });

  it('uses a real Claude model id as the default', () => {
    expect(DEFAULT_CLAUDE_FALLBACK_MODEL.startsWith('claude')).toBe(true);
  });
});

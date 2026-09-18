import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/voice/ContinuousConversation.tsx'),
  'utf8',
);

describe('TURN-01 liveness conformance', () => {
  it('checks held-floor self-heal before capture-loss teardown', () => {
    const verdict = source.indexOf('if (!verdict.dead || !verdict.cause) return;');
    const heal = source.indexOf('shouldSelfHealHeldFloorCapture({', verdict);
    const loss = source.indexOf('handleCaptureLossFnRef.current?.(verdict.cause);', heal);
    expect(verdict).toBeGreaterThan(-1);
    expect(heal).toBeGreaterThan(verdict);
    expect(loss).toBeGreaterThan(heal);
  });

  it('preserves the held transcript across the fresh recognition start', () => {
    const heal = source.indexOf('shouldSelfHealHeldFloorCapture({');
    const block = source.slice(heal, heal + 2200);
    expect(block).toContain('continuationRestartRef.current = true');
    expect(block).toContain("markForRecreate('explicit_floor_silent_death')");
    expect(block).toContain("ensureFreshAndStartFnRef.current?.('explicit_floor_silent_death')");
  });

  it('does not disable the ordinary capture-loss fallback', () => {
    expect(source).toContain('Held-floor capture self-heal failed; falling through to capture loss');
    expect(source).toContain('handleCaptureLossFnRef.current?.(verdict.cause)');
  });
});

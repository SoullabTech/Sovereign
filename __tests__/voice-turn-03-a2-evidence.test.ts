import { readFileSync } from 'fs';
import { join } from 'path';

const R = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const evidencePath = 'docs/programme/VOICE-2026/evidence/TURN-03-A2-DUALTURN-LOCAL-RUNTIME-20260916/A2_LONG_PACED_EVIDENCE.json';
const recordPath = 'docs/programme/VOICE-2026/TURN-03_A2_LOCAL_SHADOW_RUNTIME_2026-09-16.md';

describe('TURN-03 A2 · local shadow runtime evidence', () => {
  const evidence = JSON.parse(R(evidencePath));

  it('pins the selected DualTurn artifact and local-only runtime', () => {
    expect(evidence.model.sha256).toBe('6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f');
    expect(evidence.model.version).toBe('c3860ed71210fe0144af35af340fd7a4dec3d2d3');
    expect(evidence.runtime.provider).toBe('CPUExecutionProvider');
    expect(evidence.network.noOpenSocketsObserved).toBe(true);
  });

  it('proves explicit 16k -> 24k preprocessing is continuous', () => {
    expect(evidence.ingress.sourceRateHz).toBe(16000);
    expect(evidence.ingress.modelRateHz).toBe(24000);
    expect(evidence.ingress.channelsFromMember).toBe(1);
    expect(evidence.ingress.secondMicrophone).toBe(false);
    expect(evidence.continuity.byteIdentical).toBe(true);
    expect(evidence.continuity.oneShotSha256).toBe('8cc6d265f6e390500232bb188e58182ae4fb59154f7117ceffce5d36bcb6935f');
    expect(evidence.continuity.chunkedSha256).toBe(evidence.continuity.oneShotSha256);
  });

  it('pins the 32-second real-time population and latency envelope', () => {
    expect(evidence.continuity.fullFrames).toBe(400);
    expect(evidence.continuity.predictions).toBe(400);
    expect(evidence.continuity.sequenceContinuous).toBe(true);
    expect(evidence.timingMs.pacing).toBe('realtime');
    expect(evidence.timingMs.medianSendInterval).toBeGreaterThan(79);
    expect(evidence.timingMs.medianSendInterval).toBeLessThan(81);
    expect(evidence.timingMs.p95RoundTrip).toBeLessThan(80);
    expect(evidence.timingMs.maxRoundTrip).toBeLessThan(80);
  });

  it('keeps all live turn authority closed', () => {
    expect(evidence.authority).toEqual({
      canCommitTranscript: false,
      canDispatchCognition: false,
      canStartTts: false,
      canAlterEndpointing: false,
    });
    expect(R(recordPath)).toContain('A2 proves runtime feasibility only. It does not prove turn-taking quality.');
    expect(R(recordPath)).toContain('A2 therefore advances to A3 only: MAIA-TURN-BENCH.');
  });
});

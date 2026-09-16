import { readFileSync } from 'fs';
import { join } from 'path';

type Candidate = {
  id: string;
  repository: string;
  repositoryRevision: string;
  modelIdentifier: string;
  sourceCodeLicense: string;
  weightLicense: string;
  commercialUse: string;
  derivativeRedistribution: string;
  encoderObligations: string;
  runtimeWeightArtifacts: Array<{ name: string; sha256: string; sizeBytes: number; localPath: string | null }>;
  networkAutoDownload: boolean;
  cpuViability: string;
  mpsViability: string;
  memoryFootprint: string;
  predictionCadence: string;
  predictionHorizon: string;
  streamingBehavior: string;
  requiredSampleRateHz: number;
  channelContract: string;
  signalContractFit: string;
  sampleRateDisposition: string;
  disposition: string;
  reason: string;
};

const census = JSON.parse(readFileSync(join(process.cwd(), 'docs/programme/VOICE-2026/TURN-03_A1_MODEL_CENSUS_2026-09-16.json'), 'utf8'));

describe('TURN-03 A1 model census', () => {
  it('pins the charter and exactly one A2 baseline candidate', () => {
    expect(census.charterBase).toBe('f5c02193c5ebee4f51b6c4b769ad6a8166b2a80f');
    expect(census.selectedA2CandidateId).toBe('dualturn-endpointing-c3860ed');
    expect(census.candidates.filter((c: Candidate) => c.disposition === 'ADMIT_A2_BASELINE')).toHaveLength(1);
  });

  it('keeps network model resolution forbidden for every candidate', () => {
    expect(census.candidates.every((c: Candidate) => c.networkAutoDownload === false)).toBe(true);
  });

  it('records every charter-required census field', () => {
    const keys = ['repository','repositoryRevision','modelIdentifier','sourceCodeLicense','weightLicense','commercialUse','derivativeRedistribution','encoderObligations','runtimeWeightArtifacts','cpuViability','mpsViability','memoryFootprint','predictionCadence','predictionHorizon','streamingBehavior','requiredSampleRateHz','channelContract','signalContractFit','sampleRateDisposition','disposition','reason'];
    for (const c of census.candidates as Candidate[]) for (const k of keys) expect(c).toHaveProperty(k);
  });

  it('requires exact SHA custody for every declared runtime artifact', () => {
    for (const c of census.candidates as Candidate[]) {
      for (const a of c.runtimeWeightArtifacts) {
        expect(a.sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(a.sizeBytes).toBeGreaterThan(0);
      }
    }
  });

  it('pins the selected local DualTurn artifact and explicit 24 kHz research disposition', () => {
    const c = (census.candidates as Candidate[]).find((x) => x.id === census.selectedA2CandidateId)!;
    expect(c.runtimeWeightArtifacts[0]).toEqual(expect.objectContaining({
      sha256: '6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f',
      localPath: '/private/tmp/dualturn-shadow-candidate/stream_tick.onnx',
    }));
    expect(c.requiredSampleRateHz).toBe(24000);
    expect(c.sampleRateDisposition).toMatch(/research only/i);
    expect(c.channelContract).toMatch(/synthetic zeros/i);
  });

  it('does not misrepresent Smart Turn as future-speech projection', () => {
    const c = (census.candidates as Candidate[]).find((x) => x.id === 'smart-turn-v3.2-cpu')!;
    expect(c.disposition).toBe('A3_COMPARATOR_ONLY');
    expect(c.requiredSampleRateHz).toBe(16000);
    expect(c.signalContractFit).toMatch(/^FAIL/);
  });
});

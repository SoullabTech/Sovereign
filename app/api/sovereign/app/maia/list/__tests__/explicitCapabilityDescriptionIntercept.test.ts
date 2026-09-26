import fs from 'node:fs';
import path from 'node:path';

const ROUTE_PATH = path.resolve(
  process.cwd(),
  'app/api/sovereign/app/maia/list/route.ts',
);

const SOURCE_PATH = path.resolve(
  process.cwd(),
  'lib/maia/explicitCapabilityInquiry.ts',
);

function between(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error(`INVALID_TEST_SLICE:${start}→${end}`);
  }
  return source.slice(startIndex, endIndex);
}

describe('O8R4 post-F1 / pre-F2 capability-description candidate', () => {
  const route = fs.readFileSync(ROUTE_PATH, 'utf8');
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');

  const f1Marker = '// 🧱 TURN ACCEPTANCE BOUNDARY (F1 — durable turn acceptance)';
  const o8Marker = '// O8R4 — EXPLICIT CAPABILITY INQUIRY: text-only, post-F1 / pre-F2.';
  const f2Marker = '// F2-IQ runtime classifier: current accepted utterance only.';

  it('imports only the inert production resolver/composer source', () => {
    expect(route).toContain("from '@/lib/maia/explicitCapabilityInquiry';");
    expect(route).not.toContain(
      "tests/constitutional/whole-organism-orchestration/explicit-capability-inquiry",
    );
  });

  it('places O8 strictly after F1 and before F2', () => {
    const f1 = route.indexOf(f1Marker);
    const o8 = route.indexOf(o8Marker);
    const f2 = route.indexOf(f2Marker);

    expect(f1).toBeGreaterThanOrEqual(0);
    expect(o8).toBeGreaterThan(f1);
    expect(f2).toBeGreaterThan(o8);
  });

  it('keeps the candidate text-only and ABSTAIN-fall-through by construction', () => {
    const seam = between(route, o8Marker, f2Marker);

    expect(seam).toContain('if (includeAudio !== true)');
    expect(seam).toContain('resolveExplicitCapabilityInquiry(message)');
    expect(seam).toContain('composeResolvedInquiry(capabilityInquiry)');
    expect(seam).toContain('renderPilotDescription(capabilityDescription)');
    expect(seam).toContain('capabilityDescriptionText = null;');

    // No else/fallback return on ABSTAIN: F2 remains immediately below the seam.
    expect(seam).not.toContain('NON_PILOT_CAPABILITY');
    expect(seam).not.toContain('NO_EXACT_NAME_MATCH');
  });

  it('uses session infrastructure only before a DESCRIBE response', () => {
    const seam = between(route, o8Marker, f2Marker);

    expect(seam).toContain('initializeSessionTable:capabilityDescription');
    expect(seam).toContain('ensureSession:capabilityDescription');

    for (const forbidden of [
      'getCognitiveProfile(',
      'processNameChangeIfDetected(',
      'getMaiaResponse(',
      'MemoryBundleService',
      'retrieveGovernedKnowledge(',
      'scoreKnowledgeGate(',
      'observeRelationalContent(',
      'emitSignal(',
      'launchRelationalFieldShadow(',
      'toAudioResponsePayload(',
    ]) {
      expect(seam).not.toContain(forbidden);
    }
  });

  it('persists only the assistant half of an already-durable recognized non-Sanctuary exchange', () => {
    const seam = between(route, o8Marker, f2Marker);

    expect(seam).toContain(
      'if (memberTurnDurable && isRecognizedUser && !isSanctuary)',
    );
    expect(seam).toContain("role: 'assistant'");
    expect(seam).toContain('content: capabilityDescriptionText');
    expect(seam).toContain('exchangeId');
    expect(seam).toContain('sessionId: acceptedSessionId');
  });

  it('does not fall into cognition when assistant durability fails', () => {
    const seam = between(route, o8Marker, f2Marker);
    const durabilityCatchStart = seam.indexOf('catch (durabilityErr: any)');
    const canonStart = seam.indexOf('const capabilityDescriptionCanonHeaders');

    expect(durabilityCatchStart).toBeGreaterThanOrEqual(0);
    expect(canonStart).toBeGreaterThan(durabilityCatchStart);

    const durabilityCatch = seam.slice(durabilityCatchStart, canonStart);
    expect(durabilityCatch).not.toContain('getMaiaResponse');
    expect(durabilityCatch).not.toContain('return null');
  });

  it('returns a minimal deterministic response with direct truthful Canon provenance', () => {
    const seam = between(route, o8Marker, f2Marker);

    expect(seam).toContain("pipeline: 'direct'");
    expect(seam).toContain("source: 'direct'");
    expect(seam).toContain(
      "mode: isSanctuary ? 'SANCTUARY' : 'STANDARD'",
    );
    expect(seam).toContain("mode: 'capability-description'");
    expect(seam).toContain(
      "processingProfile: 'DETERMINISTIC_DESCRIPTION'",
    );
    expect(seam).toContain('tierProcessing: false');
    expect(seam).toContain('voiceRequested: false');
    expect(seam).toContain('voiceEnabled: false');

    for (const fabricated of [
      'providerUsed:',
      'model:',
      'stateVector:',
      'ainState:',
      'memoryHealth:',
      'servingTruth:',
      'turnId:',
      'decisionId:',
      'deliberationId:',
    ]) {
      expect(seam).not.toContain(fabricated);
    }
  });

  it('keeps the production resolver source pure and route-independent', () => {
    expect(source.match(/^\s*import\b/gm) ?? []).toHaveLength(0);
    expect(source).not.toContain('/api/sovereign/app/maia/list');
    expect(source).not.toContain('TurnsStore');
    expect(source).not.toContain('makeCanonHeaders');
  });
});

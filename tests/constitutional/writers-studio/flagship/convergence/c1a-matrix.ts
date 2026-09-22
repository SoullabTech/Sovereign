/**
 * C1A — PURE WRITE FRAME + LIVE-HOST CONTRACT
 * Lethality matrix. Each defeat changes one constitutional property only.
 */

interface Candidate {
  manuscriptSlot: boolean;
  presentationOwnsSave: boolean;
  requiresDeadControls: boolean;
  bridgesLegacyNav: boolean;
  duplicatesTokens: boolean;
  fabricatesFacts: boolean;
  duplicatesRuntimeState: boolean;
  preservesControlledVisual: boolean;
}

interface Law {
  id: string;
  test: (candidate: Candidate) => boolean;
}

const LAWS: readonly Law[] = [
  { id: 'C1A-L1-host-manuscript-slot', test: (c) => c.manuscriptSlot },
  { id: 'C1A-L2-presentation-no-save', test: (c) => !c.presentationOwnsSave },
  { id: 'C1A-L3-capability-honest-controls', test: (c) => !c.requiresDeadControls },
  { id: 'C1A-L4-no-legacy-nav-bridge', test: (c) => !c.bridgesLegacyNav },
  { id: 'C1A-L5-single-token-source', test: (c) => !c.duplicatesTokens },
  { id: 'C1A-L6-no-fabricated-view-facts', test: (c) => !c.fabricatesFacts },
  { id: 'C1A-L7-single-runtime-state-owner', test: (c) => !c.duplicatesRuntimeState },
  { id: 'C1A-L8-controlled-visual-stable', test: (c) => c.preservesControlledVisual },
];

const REFERENCE: Candidate = {
  manuscriptSlot: true,
  presentationOwnsSave: false,
  requiresDeadControls: false,
  bridgesLegacyNav: false,
  duplicatesTokens: false,
  fabricatesFacts: false,
  duplicatesRuntimeState: false,
  preservesControlledVisual: true,
};

type Defeat = { id: string; namedKill: string; candidate: Candidate };
const withChange = (patch: Partial<Candidate>): Candidate => ({ ...REFERENCE, ...patch });

const DEFEATS: readonly Defeat[] = [
  { id: 'C1A-D1-STATIC-BODY-REPLACEMENT', namedKill: 'C1A-L1-host-manuscript-slot',
    candidate: withChange({ manuscriptSlot: false }) },
  { id: 'C1A-D2-SECOND-SAVE-OWNER', namedKill: 'C1A-L2-presentation-no-save',
    candidate: withChange({ presentationOwnsSave: true }) },
  { id: 'C1A-D3-DEAD-CONTROL', namedKill: 'C1A-L3-capability-honest-controls',
    candidate: withChange({ requiresDeadControls: true }) },
  { id: 'C1A-D4-LEGACY-NAV-BRIDGE', namedKill: 'C1A-L4-no-legacy-nav-bridge',
    candidate: withChange({ bridgesLegacyNav: true }) },
  { id: 'C1A-D5-TOKEN-DUPLICATION', namedKill: 'C1A-L5-single-token-source',
    candidate: withChange({ duplicatesTokens: true }) },
  { id: 'C1A-D6-FABRICATED-VIEW-FACT', namedKill: 'C1A-L6-no-fabricated-view-facts',
    candidate: withChange({ fabricatesFacts: true }) },
  { id: 'C1A-D7-SECOND-STATE-OWNER', namedKill: 'C1A-L7-single-runtime-state-owner',
    candidate: withChange({ duplicatesRuntimeState: true }) },
  { id: 'C1A-D8-VISUAL-REGRESSION', namedKill: 'C1A-L8-controlled-visual-stable',
    candidate: withChange({ preservesControlledVisual: false }) },
];

function failed(candidate: Candidate): string[] {
  return LAWS.filter((law) => !law.test(candidate)).map((law) => law.id);
}

const referenceFailures = failed(REFERENCE);
if (referenceFailures.length > 0) {
  throw new Error(`C1A reference failed: ${referenceFailures.join(', ')}`);
}

let dead = 0;
for (const defeat of DEFEATS) {
  const failures = failed(defeat.candidate);
  if (!failures.includes(defeat.namedKill)) {
    throw new Error(`${defeat.id} survived named kill ${defeat.namedKill}: ${failures.join(', ') || 'no failures'}`);
  }
  const collateral = failures.filter((id) => id !== defeat.namedKill);
  if (collateral.length > 0) {
    throw new Error(`${defeat.id} has unclassified collateral: ${collateral.join(', ')}`);
  }
  dead += 1;
  console.log(`DEAD  ${defeat.id} → ${defeat.namedKill}`);
}

console.log(`REFERENCE  ${LAWS.length}/${LAWS.length} PASS`);
console.log(`DEFEATS    ${dead}/${DEFEATS.length} DEAD · zero collateral`);
console.log('C1A MATRIX LETHAL + DISCRIMINATING');

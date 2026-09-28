import { buildAetherInputFromField } from '../aetherBuilder';
import { generateAetherCandidates } from '../aetherSynthesis';
import { buildCrystalCenterField } from '../crystalCenter';
import {
  buildParallelPathways,
  exchangeCallosalSignals,
  generateFifthElementCandidate,
} from '../callosalEmergence';
import {
  bridgeAblation,
  distractorInvariant,
  evaluateEmergenceQuality,
} from '../emergenceQuality';

function field(ref:string,refs:string[]){
  const input=buildAetherInputFromField(ref,refs,'mixed');
  input.absences.push({
    absenceRef:'absence:'+ref,
    subject:'member-owned final meaning',
    reason:'no_support',
  });
  return buildCrystalCenterField(input,generateAetherCandidates(input));
}

function candidateFor(f:ReturnType<typeof field>){
  const {analytic,associative}=buildParallelPathways(f);
  return generateFifthElementCandidate(
    f,analytic,associative,exchangeCallosalSignals(analytic,associative),
  );
}

describe('R9 emergence quality and generalization',()=>{
  const constellations=[
    field('R9-governance',[
      'authority-law','source-fabric','direction-authority',
      'teaching-constitution','writers-studio',
    ]),
    field('R9-relational',[
      'rgr-note','rgr-constitution','indra-grammar',
      'indra-permeability','indra-composer','indra-validation',
    ]),
    field('R9-retrieval',[
      'source-fabric','library-adr','source-fabric-census',
      'benchmark-contract','j11-reconciliation',
    ]),
  ];

  test('multiple distinct constellations admit nontrivial emergence',()=>{
    for(const f of constellations){
      const quality=evaluateEmergenceQuality(f,candidateFor(f));
      expect(quality.valid).toBe(true);
      expect(quality.effectiveSupportRefs.length).toBeGreaterThanOrEqual(2);
      expect(quality.bridgeRelationRefs.length).toBeGreaterThan(0);
      expect(quality.trivialRestatement).toBe(false);
    }
  });

  test('an isolated distractor remains contextual rather than effective support',()=>{
    const f=field('R9-distractor',[
      'rgr-note','rgr-constitution','indra-grammar','ea-manuscript',
    ]);
    const quality=evaluateEmergenceQuality(f,candidateFor(f));
    expect(quality.contextualOnlyRefs).toContain('ea-manuscript');
    expect(quality.effectiveSupportRefs).not.toContain('ea-manuscript');
    expect(distractorInvariant(f,'ea-manuscript')).toEqual({valid:true,reason:null});
  });

  test('a disconnected sparse field refuses fake emergence',()=>{
    const f=field('R9-sparse',['ea-manuscript','library-adr']);
    const candidate=candidateFor(f);
    const quality=evaluateEmergenceQuality(f,candidate);
    expect(candidate).toBeNull();
    expect(quality.valid).toBe(false);
    expect(quality.reasons).toContain('candidate_absent');
    expect(quality.reasons).toContain('no_bridge_relation');
  });

  test('removing the only relational bridge destroys emergence',()=>{
    const f=field('R9-single-bridge',['rgr-note','indra-grammar']);
    const before=evaluateEmergenceQuality(f,candidateFor(f));
    expect(before.valid).toBe(true);
    const after=bridgeAblation(f,['indra-grammar']);
    expect(after.candidateAfter).toBeNull();
    expect(after.qualityAfter.valid).toBe(false);
  });

  test('quality signature is grounded in relations/constraints, not pathway labels',()=>{
    for(const f of constellations){
      const quality=evaluateEmergenceQuality(f,candidateFor(f));
      expect(quality.nontrivialSignature.some(x=>x.startsWith('relation:'))).toBe(true);
      expect(quality.nontrivialSignature).not.toContain('analytic_pathway');
      expect(quality.nontrivialSignature).not.toContain('associative_pathway');
    }
  });
});

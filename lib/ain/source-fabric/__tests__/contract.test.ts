import {
  adjudicateCandidate,
  canSupportClaim,
  compareRankableCandidates,
  referenceDescriptiveRetrievalScore,
  type InquiryContract,
  type SourceFabricCandidate,
} from '../contract';

const inquiry: InquiryContract = {
  query: 'What is true for me now about public engagement and solitude?',
  claimNeed: 'current member state',
  temporalNeed: 'current',
  eligibleSourceClasses: ['journal', 'dream', 'astrology', 'relationship'],
  maxCandidates: 8,
};

function candidate(overrides: Partial<SourceFabricCandidate> = {}): SourceFabricCandidate {
  return {
    identity: {
      sourceRef: 'journal:1',
      sourceClass: 'journal',
      objectId: '1',
      returnPath: '/journal?entry=1',
    },
    permission: 'admitted',
    admissionBasis: 'explicit_selection',
    authority: 'descriptive',
    epistemicKind: 'member_authored_report',
    temporalStanding: 'current',
    signals: {
      lexical: .5,
      semantic: .5,
      graph: .5,
      temporal: .5,
      directness: .5,
      inquiryFit: .5,
    },
    roles: ['conceptual'],
    memberSelected: false,
    speakable: true,
    disclosed: true,
    reliedUpon: false,
    uncertainty: .2,
    supportScope: [
      'member_current_state',
      'member_historical_experience',
      'conceptual_orientation',
    ],
    prohibitedSupport: [
      'causal_explanation',
      'prediction',
      'other_person_interiority',
    ],
    ...overrides,
  };
}

describe('AIN-SOURCE-FABRIC-01 constitutional ordering', () => {
  it('permission is a gate, never a weight', () => {
    const denied = candidate({
      permission: 'available',
      signals: {
        lexical: 1,
        semantic: .99,
        graph: 1,
        temporal: 1,
        directness: 1,
        inquiryFit: 1,
      },
    });
    const verdict = adjudicateCandidate(denied, inquiry);
    expect(verdict.admitted).toBe(false);
    expect(verdict.rankable).toBe(false);
    expect(verdict.reason).toBe('permission_denied');
  });

  it('graph proximity cannot open an unopened facet', () => {
    const dream = candidate({
      identity: { sourceRef:'dream:9', sourceClass:'dream', objectId:'9' },
      permission: 'available',
      admissionBasis: undefined,
      signals: {
        lexical:.1,
        semantic:.7,
        graph:1,
        temporal:.8,
        directness:.8,
        inquiryFit:.8,
      },
    });
    expect(adjudicateCandidate(dream, inquiry).reason).toBe('permission_denied');
  });

  it('superseded sources remain historical but cannot lead a current-state claim', () => {
    const old = candidate({ temporalStanding:'superseded', roles:['exact'] });
    const currentVerdict = adjudicateCandidate(old, inquiry);
    expect(currentVerdict.admitted).toBe(true);
    expect(currentVerdict.rankable).toBe(false);
    expect(currentVerdict.reason).toBe('superseded_for_current_claim');

    const historical = { ...inquiry, temporalNeed:'historical' as const };
    expect(adjudicateCandidate(old, historical).rankable).toBe(true);
  });

  it('member selection outranks a higher descriptive retrieval score among admitted candidates', () => {
    const chosen = candidate({
      identity:{sourceRef:'journal:chosen',sourceClass:'journal',objectId:'chosen'},
      memberSelected:true,
      signals:{lexical:.35,semantic:.62,graph:.2,temporal:.8,directness:.7,inquiryFit:.7},
    });
    const highScore = candidate({
      identity:{sourceRef:'journal:auto',sourceClass:'journal',objectId:'auto'},
      signals:{lexical:.99,semantic:.99,graph:.99,temporal:.99,directness:.99,inquiryFit:.99},
    });
    expect(referenceDescriptiveRetrievalScore(highScore.signals))
      .toBeGreaterThan(referenceDescriptiveRetrievalScore(chosen.signals));
    expect([chosen,highScore].sort(compareRankableCandidates)[0].identity.sourceRef)
      .toBe('journal:chosen');
  });

  it('counterevidence is preserved rather than majority-voted away', () => {
    const agreeing = candidate({
      identity:{sourceRef:'journal:agree',sourceClass:'journal',objectId:'agree'},
      signals:{lexical:.9,semantic:.9,graph:.7,temporal:.9,directness:.9,inquiryFit:.9},
    });
    const counter = candidate({
      identity:{sourceRef:'journal:counter',sourceClass:'journal',objectId:'counter'},
      roles:['counterevidence'],
      epistemicKind:'counterevidence',
      signals:{lexical:.3,semantic:.5,graph:.2,temporal:.8,directness:.8,inquiryFit:.6},
    });
    expect([agreeing,counter].sort(compareRankableCandidates)[0].identity.sourceRef)
      .toBe('journal:counter');
  });
});

describe('epistemic standing constrains support', () => {
  it('symbolic sources may support correspondence, not causation or prediction', () => {
    const astrology = candidate({
      identity:{sourceRef:'astrology:natal',sourceClass:'astrology',objectId:'natal'},
      epistemicKind:'symbolic_tradition',
      supportScope:['symbolic_parallel','conceptual_orientation'],
      prohibitedSupport:['causal_explanation','prediction','member_current_state'],
    });
    expect(canSupportClaim(astrology,'symbolic_parallel')).toBe(true);
    expect(canSupportClaim(astrology,'causal_explanation')).toBe(false);
    expect(canSupportClaim(astrology,'prediction')).toBe(false);
    expect(canSupportClaim(astrology,'member_current_state')).toBe(false);
  });

  it('member report does not establish another person interiority', () => {
    const relationship = candidate({
      identity:{sourceRef:'relationship:1',sourceClass:'relationship',objectId:'1'},
      epistemicKind:'member_authored_report',
      supportScope:['member_current_state','other_person_interiority'],
    });
    expect(canSupportClaim(relationship,'member_current_state')).toBe(true);
    expect(canSupportClaim(relationship,'other_person_interiority')).toBe(false);
  });

  it('MAIA hypotheses remain orientation, not facts', () => {
    const hypothesis = candidate({
      epistemicKind:'maia_hypothesis',
      supportScope:['conceptual_orientation','member_current_state'],
    });
    expect(canSupportClaim(hypothesis,'conceptual_orientation')).toBe(true);
    expect(canSupportClaim(hypothesis,'member_current_state')).toBe(false);
  });
});

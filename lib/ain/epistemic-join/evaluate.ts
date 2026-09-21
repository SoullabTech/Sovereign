import type {
  AdoptionAct,
  ComponentEvaluationResult,
  CompositeWarrantStatus,
  DerivedStandingResult,
  EpistemicJoinEvaluation,
  EpistemicStanding,
  EpistemicWarrant,
  EvaluateEpistemicJoinInput,
  EvaluationReason,
  RelationSemantic,
  RequestedStanding,
  SemanticComponent,
  StandingAct,
  WarrantClass,
} from './types';

const STANDING_RANK: Record<RequestedStanding, number> = {
  CANDIDATE: 1,
  PROVISIONAL: 2,
  WARRANTED: 3,
  PROMOTED: 4,
};

const MEMBER_SEMANTICS = new Set<RelationSemantic>([
  'PERSONAL_EXPERIENCE',
  'PERSONAL_MEANING',
  'PERSONAL_VALUE',
  'PERSONAL_PREFERENCE',
  'PERSONAL_INTENTION',
]);

const SOURCE_RELIANT_CLASSES = new Set<WarrantClass>([
  'DIRECT_EVIDENCE',
  'CAUSAL_EVIDENCE',
  'MOTIVE_EVIDENCE',
  'DIAGNOSTIC_EVIDENCE',
  'SCIENTIFIC_EVIDENCE',
  'HISTORICAL_EVIDENCE',
  'METAPHYSICAL_ARGUMENT',
  'UNIVERSAL_ARGUMENT',
  'COMPOSITE_INFERENCE',
]);

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort() as T[];
}

function isTerminal(standing: EpistemicStanding): boolean {
  return standing === 'DISCHARGED' || standing === 'SUPERSEDED';
}

function maxStanding(values: readonly RequestedStanding[]): RequestedStanding | null {
  if (values.length === 0) return null;
  return [...values].sort((a, b) => STANDING_RANK[b] - STANDING_RANK[a])[0] ?? null;
}

function authorityValid(warrant: EpistemicWarrant): boolean {
  switch (warrant.warrantClass) {
    case 'MEMBER_AUTHORITY':
      return warrant.author.role === 'MEMBER';
    case 'PRACTITIONER_INTERPRETATION':
      return warrant.author.role === 'PRACTITIONER';
    case 'SCIENTIFIC_EVIDENCE':
    case 'HISTORICAL_EVIDENCE':
      return warrant.author.role === 'RESEARCHER' || warrant.author.role === 'EXTERNAL_SOURCE';
    case 'DIAGNOSTIC_EVIDENCE':
      return warrant.author.role === 'PRACTITIONER' || warrant.author.role === 'EXTERNAL_SOURCE';
    default:
      return warrant.author.id.trim().length > 0;
  }
}

function semanticClassReason(
  semantic: RelationSemantic,
  warrantClass: WarrantClass,
): EvaluationReason | null {
  if (MEMBER_SEMANTICS.has(semantic)) {
    return warrantClass === 'MEMBER_AUTHORITY'
      ? null
      : 'WARRANT_CLASS_SCOPE_VIOLATION';
  }

  switch (semantic) {
    case 'CAUSAL':
      return warrantClass === 'CAUSAL_EVIDENCE' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'CAUSAL_WARRANT_REQUIRED';
    case 'MOTIVE':
      return warrantClass === 'MOTIVE_EVIDENCE' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'MOTIVE_WARRANT_REQUIRED';
    case 'DIAGNOSTIC':
      return warrantClass === 'DIAGNOSTIC_EVIDENCE' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'DIAGNOSTIC_WARRANT_REQUIRED';
    case 'SCIENTIFIC':
      return warrantClass === 'SCIENTIFIC_EVIDENCE' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'SCIENTIFIC_WARRANT_REQUIRED';
    case 'HISTORICAL':
      return warrantClass === 'HISTORICAL_EVIDENCE' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'HISTORICAL_WARRANT_REQUIRED';
    case 'METAPHYSICAL':
      return warrantClass === 'METAPHYSICAL_ARGUMENT' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'WARRANT_CLASS_SCOPE_VIOLATION';
    case 'UNIVERSAL':
      return warrantClass === 'UNIVERSAL_ARGUMENT' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'WARRANT_CLASS_SCOPE_VIOLATION';
    case 'PRACTITIONER_INTERPRETATION':
    case 'RELATIONAL_PATTERN':
      return warrantClass === 'PRACTITIONER_INTERPRETATION' || warrantClass === 'COMPOSITE_INFERENCE'
        ? null
        : 'WARRANT_CLASS_SCOPE_VIOLATION';
    case 'EXTERNAL_FACT':
      return [
        'DIRECT_EVIDENCE',
        'CAUSAL_EVIDENCE',
        'SCIENTIFIC_EVIDENCE',
        'HISTORICAL_EVIDENCE',
        'COMPOSITE_INFERENCE',
      ].includes(warrantClass)
        ? null
        : 'WARRANT_CLASS_SCOPE_VIOLATION';
    default:
      return 'WARRANT_CLASS_SCOPE_VIOLATION';
  }
}

function compositeValid(warrant: EpistemicWarrant): boolean {
  if (warrant.warrantClass !== 'COMPOSITE_INFERENCE') return false;
  return (
    warrant.proposition.trim().length > 0 &&
    warrant.author.id.trim().length > 0 &&
    warrant.supportRefs.length >= 2 &&
    warrant.reliedUponRefs.length > 0 &&
    warrant.reliedUponRefs.every((ref) => warrant.supportRefs.includes(ref)) &&
    Boolean(warrant.method?.trim()) &&
    warrant.dependenceAssumptions.length > 0 &&
    warrant.jurisdictions.length > 0 &&
    warrant.uncertainty.trim().length > 0 &&
    warrant.boundaries.length > 0 &&
    warrant.invalidityConditions.length > 0 &&
    warrant.licensedRelationSemantics.length > 0
  );
}

function baseWarrantReasons(
  component: SemanticComponent,
  warrant: EpistemicWarrant,
  adoptionActs: readonly AdoptionAct[],
): EvaluationReason[] {
  const reasons: EvaluationReason[] = [];

  if (
    warrant.id.trim().length === 0 ||
    warrant.proposition.trim().length === 0 ||
    warrant.author.id.trim().length === 0 ||
    warrant.jurisdictions.length === 0 ||
    warrant.licensedRelationSemantics.length === 0 ||
    warrant.reliedUponRefs.some((ref) => !warrant.supportRefs.includes(ref))
  ) {
    reasons.push('WARRANT_STRUCTURE_INVALID');
  }

  if (!authorityValid(warrant)) reasons.push('WARRANT_AUTHORITY_INVALID');

  if (warrant.uncertainty.trim().length === 0 || warrant.boundaries.length === 0) {
    reasons.push('WARRANT_BOUNDARY_INCOMPLETE');
  }

  if (!warrant.jurisdictions.includes(component.jurisdiction)) {
    reasons.push('JURISDICTION_MISMATCH');
  }

  if (!warrant.licensedRelationSemantics.includes(component.semantic)) {
    reasons.push('RELATION_SEMANTIC_UNLICENSED');
  }

  const classReason = semanticClassReason(component.semantic, warrant.warrantClass);
  if (classReason) reasons.push(classReason);

  if (warrant.warrantClass === 'MEMBER_AUTHORITY') {
    if (!MEMBER_SEMANTICS.has(component.semantic)) {
      reasons.push('MEMBER_AUTHORITY_SCOPE_VIOLATION');
    }
    const adopted = adoptionActs.some(
      (act) => act.memberWarrantId === warrant.id && act.componentIds.includes(component.id),
    );
    if (!adopted) reasons.push('MEMBER_ADOPTION_REQUIRED');
  }

  if (SOURCE_RELIANT_CLASSES.has(warrant.warrantClass)) {
    if (component.relianceRefs.length === 0) {
      const hasReferenceOnlySupport = component.referenceRefs.some((ref) =>
        warrant.supportRefs.includes(ref),
      );
      reasons.push(hasReferenceOnlySupport ? 'REFERENCE_ONLY_SUPPORT' : 'RELIANCE_NOT_DECLARED');
    } else {
      const explicitlyUsesThisWarrant = warrant.reliedUponRefs.some((ref) =>
        component.relianceRefs.includes(ref),
      );
      if (!explicitlyUsesThisWarrant) reasons.push('RELIANCE_NOT_DECLARED');
    }
  }

  if (warrant.warrantClass === 'COMPOSITE_INFERENCE' && !compositeValid(warrant)) {
    reasons.push('COMPOSITE_WARRANT_INVALID');
  }

  return uniqueSorted(reasons);
}

function evaluateComponent(
  component: SemanticComponent,
  requestedStanding: RequestedStanding,
  warrants: readonly EpistemicWarrant[],
  adoptionActs: readonly AdoptionAct[],
): ComponentEvaluationResult {
  const reasons: EvaluationReason[] = [];
  const selectedIds = uniqueSorted(component.warrantIdsReliedUpon);

  if (selectedIds.length === 0) reasons.push('NO_WARRANT');

  const selected: EpistemicWarrant[] = [];
  const perWarrantReasons = new Map<string, EvaluationReason[]>();

  for (const id of selectedIds) {
    const matches = warrants.filter((warrant) => warrant.id === id);
    if (matches.length !== 1) {
      reasons.push(matches.length === 0 ? 'WARRANT_NOT_FOUND' : 'WARRANT_STRUCTURE_INVALID');
      continue;
    }
    const warrant = matches[0]!;
    selected.push(warrant);
    const localReasons = baseWarrantReasons(component, warrant, adoptionActs);
    perWarrantReasons.set(warrant.id, localReasons);
    reasons.push(...localReasons);
  }

  if (component.inferenceKind === 'COMPOSITE') {
    const validCompositeSelected = selected.some(
      (warrant) =>
        warrant.warrantClass === 'COMPOSITE_INFERENCE' &&
        compositeValid(warrant) &&
        (perWarrantReasons.get(warrant.id)?.length ?? 1) === 0,
    );
    if (!validCompositeSelected) reasons.push('COMPOSITE_WARRANT_REQUIRED');
  }

  if (component.relianceRefs.length > 0) {
    for (const ref of component.relianceRefs) {
      const supported = selected.some(
        (warrant) =>
          warrant.supportRefs.includes(ref) &&
          warrant.reliedUponRefs.includes(ref),
      );
      if (!supported) reasons.push('RELIANCE_NOT_SUPPORTED');
    }
  }

  const validWarrants = selected.filter(
    (warrant) => (perWarrantReasons.get(warrant.id)?.length ?? 1) === 0,
  );

  const qualifyingWarrants =
    component.inferenceKind === 'COMPOSITE'
      ? validWarrants.filter((warrant) => warrant.warrantClass === 'COMPOSITE_INFERENCE')
      : validWarrants;

  const ceiling = maxStanding(qualifyingWarrants.map((warrant) => warrant.standingCeiling));
  if (ceiling !== null && STANDING_RANK[ceiling] < STANDING_RANK[requestedStanding]) {
    reasons.push('STANDING_CEILING_INSUFFICIENT');
  }

  const finalReasons = uniqueSorted(reasons);
  const requestedStandingAdmissible =
    selectedIds.length > 0 &&
    selected.length === selectedIds.length &&
    validWarrants.length === selected.length &&
    qualifyingWarrants.length > 0 &&
    ceiling !== null &&
    STANDING_RANK[ceiling] >= STANDING_RANK[requestedStanding] &&
    finalReasons.length === 0;

  const compositeWarrantStatus: CompositeWarrantStatus =
    component.inferenceKind !== 'COMPOSITE'
      ? 'NOT_REQUIRED'
      : requestedStandingAdmissible
        ? 'VALID'
        : 'INVALID';

  const memberWarrants = selected.filter((warrant) => warrant.warrantClass === 'MEMBER_AUTHORITY');
  const memberAdoptionValid =
    memberWarrants.length === 0 ||
    memberWarrants.every((warrant) =>
      adoptionActs.some(
        (act) => act.memberWarrantId === warrant.id && act.componentIds.includes(component.id),
      ),
    );

  return {
    componentId: component.id,
    jurisdiction: component.jurisdiction,
    semantic: component.semantic,
    requestedStanding,
    warrantIdsReliedUpon: selectedIds,
    validWarrantIds: uniqueSorted(validWarrants.map((warrant) => warrant.id)),
    relianceValid: !finalReasons.some((reason) =>
      ['REFERENCE_ONLY_SUPPORT', 'RELIANCE_NOT_DECLARED', 'RELIANCE_NOT_SUPPORTED'].includes(reason),
    ),
    compositeWarrantStatus,
    memberAdoptionValid,
    maximumLicensedStanding: ceiling,
    uncertainty: uniqueSorted(validWarrants.map((warrant) => warrant.uncertainty).filter(Boolean)),
    boundaries: uniqueSorted(validWarrants.flatMap((warrant) => warrant.boundaries)),
    reasons: finalReasons,
    requestedStandingAdmissible,
  };
}

export function deriveCurrentStanding(acts: readonly StandingAct[]): DerivedStandingResult {
  if (acts.length === 0) return { standing: 'NONE', valid: true, reasons: [] };

  const ordinals = acts.map((act) => act.ordinal);
  if (new Set(ordinals).size !== ordinals.length) {
    return {
      standing: 'NONE',
      valid: false,
      reasons: ['STANDING_HISTORY_AMBIGUOUS'],
    };
  }

  const ordered = [...acts].sort(
    (a, b) => a.ordinal - b.ordinal || a.id.localeCompare(b.id),
  );

  let current: EpistemicStanding = 'NONE';
  let terminalSeen = false;
  const reasons: EvaluationReason[] = [];

  for (const act of ordered) {
    if (terminalSeen) reasons.push('STANDING_HISTORY_AFTER_TERMINAL');
    current = act.standing;
    if (isTerminal(act.standing)) terminalSeen = true;
  }

  return {
    standing: current,
    valid: reasons.length === 0,
    reasons: uniqueSorted(reasons),
  };
}

export function evaluateEpistemicJoin(
  input: EvaluateEpistemicJoinInput,
): EpistemicJoinEvaluation {
  const { proposal, warrants, standingActs, adoptionActs } = input;
  const standing = deriveCurrentStanding(standingActs);
  const relationReasons: EvaluationReason[] = [...standing.reasons];

  if (proposal.components.length === 0) relationReasons.push('NO_COMPONENTS');

  const knownComponentIds = new Set(proposal.components.map((component) => component.id));
  for (const act of adoptionActs) {
    if (act.componentIds.some((id) => !knownComponentIds.has(id))) {
      relationReasons.push('ADOPTION_UNKNOWN_COMPONENT');
    }
  }

  if (isTerminal(standing.standing)) relationReasons.push('TERMINAL_STANDING');

  const componentResults = proposal.components.map((component) =>
    evaluateComponent(component, proposal.requestedStanding, warrants, adoptionActs),
  );

  relationReasons.push(...componentResults.flatMap((result) => result.reasons));
  const reasons = uniqueSorted(relationReasons);

  const admitted =
    proposal.components.length > 0 &&
    standing.valid &&
    !isTerminal(standing.standing) &&
    componentResults.every((result) => result.requestedStandingAdmissible) &&
    !reasons.includes('ADOPTION_UNKNOWN_COMPONENT');

  const compositeStatuses = componentResults.map((result) => result.compositeWarrantStatus);
  const compositeWarrantStatus: CompositeWarrantStatus =
    compositeStatuses.every((status) => status === 'NOT_REQUIRED')
      ? 'NOT_REQUIRED'
      : compositeStatuses.some((status) => status === 'INVALID')
        ? 'INVALID'
        : 'VALID';

  return {
    relationId: proposal.relationId,
    requestedStanding: proposal.requestedStanding,
    derivedCurrentStanding: standing.standing,
    admitted,
    admittedStanding: admitted ? proposal.requestedStanding : null,
    jurisdictions: uniqueSorted(proposal.components.map((component) => component.jurisdiction)),
    warrantIdsReliedUpon: uniqueSorted(
      proposal.components.flatMap((component) => component.warrantIdsReliedUpon),
    ),
    relianceValid: componentResults.every((result) => result.relianceValid),
    compositeWarrantStatus,
    uncertainty: uniqueSorted(componentResults.flatMap((result) => result.uncertainty)),
    boundaries: uniqueSorted(componentResults.flatMap((result) => result.boundaries)),
    reasons,
    hypothesisRepresentationPermissible:
      proposal.components.length > 0 && !isTerminal(standing.standing),
    downstreamRepresentationAuthorized: false,
    componentResults,
  };
}

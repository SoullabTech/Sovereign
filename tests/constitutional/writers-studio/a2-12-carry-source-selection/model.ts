export type Surface = 'EDITORIAL_COMPOSER' | 'RELATIONSHIP_CARD' | 'REVIEW' | 'FOCUS' | 'HISTORY_DRAWER';
export type Ordering = 'CHRONOLOGICAL' | 'RELEVANCE' | 'LATEST_FIRST';

export interface SourceCardDesign {
  readonly exactExcerpt: boolean;
  readonly generatedTitle: boolean;
  readonly generatedSummary: boolean;
  readonly showsMemberTurn: boolean;
  readonly showsWholeTranscript: boolean;
  readonly showsScopeLabel: boolean;
  readonly showsDateLabel: boolean;
  readonly recommendationLabel: boolean;
}

export interface EligibilityDesign {
  readonly separateNarrowReadSeam: boolean;
  readonly relationshipApiRemainsContentFree: boolean;
  readonly provesSameRelationship: boolean;
  readonly provesEditorialSourceKind: boolean;
  readonly excludesSameThread: boolean;
  readonly excludesUnavailable: boolean;
  readonly excludesScopeIneligible: boolean;
  readonly excludesReviewAndFocus: boolean;
  readonly sourceBodyExact: boolean;
  readonly failureFallsBackToEpisodeMetadata: boolean;
}

export interface SelectionDesign {
  readonly visibleChip: boolean;
  readonly removable: boolean;
  readonly maxSelected: number;
  readonly preselected: boolean;
  readonly selectionBasis: 'EXPLICIT' | 'LATEST' | 'FIRST' | 'RELEVANCE';
  readonly mergedIntoTextarea: boolean;
  readonly persistsAcrossTurns: boolean;
  readonly persistsAcrossRelationshipChange: boolean;
  readonly persistsAcrossThreadChange: boolean;
  readonly persistsAcrossPlaceChange: boolean;
  readonly storedInPlace: boolean;
  readonly storedInRelationshipReturn: boolean;
  readonly unavailableAutoReplacement: boolean;
  readonly consumedAfterSend: boolean;
}

export interface A212ExperienceDesign {
  readonly actionLabel: string;
  readonly chooserHeading: string;
  readonly helperText: string;
  readonly selectedLabel: string;
  readonly location: Surface;
  readonly requiresSelectedRelationship: boolean;
  readonly requiresActiveEditorialThread: boolean;
  readonly unavailableInSanctuary: boolean;
  readonly ordering: Ordering;
  readonly orderingHasAuthority: boolean;
  readonly cards: SourceCardDesign;
  readonly eligibility: EligibilityDesign;
  readonly selection: SelectionDesign;
  readonly manuscriptRemainsPrimary: boolean;
  readonly modalByDefault: boolean;
  readonly persistentSideRail: boolean;
  readonly relationshipTimeline: boolean;
  readonly opensOldThreadOnSelect: boolean;
  readonly broadensCarryClasses: boolean;
  readonly productImplementation: boolean;
}

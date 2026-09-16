export type ClaimKind = 'assertion' | 'question' | 'directive' | 'fragment' | 'quotation';
export type SegmentationStatus = 'atomic' | 'composite' | 'uncertain';

export interface ClaimUnit {
  readonly claimId: string;
  readonly turnId: string;
  readonly startChar: number;
  readonly endChar: number;
  readonly exactTextHash: string;
  readonly text: string;
  readonly kind: ClaimKind;
  readonly segmentationStatus: SegmentationStatus;
}

export type GestureKind =
  | 'CONFIRM'
  | 'CORRECT'
  | 'RESTART_PROTEST'
  | 'META_PATTERN'
  | 'OPAQUE_REFERENCE'
  | 'OTHER';

export interface GestureBinding {
  readonly gesture: GestureKind;
  readonly outcome: 'BOUND' | 'AMBIGUOUS' | 'NO_TARGET';
  readonly targetClaimId?: string;
  readonly reason: string;
  readonly candidateClaimIds: readonly string[];
}

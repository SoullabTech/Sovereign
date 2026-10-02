/**
 * F7 / INTENT-FIRST — THE CONTRACT, typed at the boundary.
 * Authority: JARVIS_WS_F7_INTENT_FIRST_CONTRACT_AND_FALSIFIER_FLOW_v1 §4–§18.
 * ⛔ Not imported by runtime. Implementation authority NOT GRANTED.
 *
 * ⭐⭐ THE LOAD-BEARING SEPARATION: suggested scope → authorized scope →
 * executed scope are THREE fields, and reading authority is ONE explicit
 * event, `AUTHORIZE_READING(scope)`. Nothing else — not an intent, a lens
 * tab, MAIA opening, navigation, passage selection or a facet switch — is
 * authority. §18. The forbidden transition INTENT_SELECTED → READ_PENDING is
 * unrepresentable in a conforming machine because READ_PENDING is reachable
 * only from SCOPE_AUTHORIZED.
 */

export type IntentId =
  | 'feels-off' | 'see-the-shape' | 'losing-the-thread' | 'not-my-voice'
  | 'what-is-this-chapter-doing' | 'what-keeps-appearing' | 'go-deeper'
  | 'repeating-myself' | 'help-me-look' | 'keep-writing';

export type ScopeClass = 'passage' | 'section' | 'chapter' | 'adjacent-chapters' | 'range' | 'existing-evidence';

export interface Scope { readonly kind: ScopeClass; readonly sectionIds: readonly string[]; }

export type Facet = 'guided' | 'learning' | 'direct';

export interface Place { readonly sectionId: string; readonly anchor: string | null; }

/** What the machine may know about the Work when an intent is selected. */
export interface Evidence {
  /** Admitted observations tied to the current place. ⛔ Never fabricated. */
  readonly admittedHere: readonly { readonly observationId: string; readonly text: string }[];
  /** What the substrate can actually read. §9: if absent, do not offer. */
  readonly capabilities: readonly ScopeClass[];
}

export type State =
  | { readonly name: 'REST'; readonly place: Place }
  | { readonly name: 'INTENT_OPEN'; readonly place: Place }
  | { readonly name: 'INTENT_SELECTED'; readonly place: Place; readonly intent: IntentId }
  | { readonly name: 'ORIENTED'; readonly place: Place; readonly intent: IntentId; readonly response: FirstResponse }
  | { readonly name: 'SCOPE_PROPOSED'; readonly place: Place; readonly intent: IntentId; readonly suggested: Scope; readonly response: FirstResponse }
  | { readonly name: 'SCOPE_AUTHORIZED'; readonly place: Place; readonly intent: IntentId; readonly suggested: Scope; readonly authorized: Scope }
  | { readonly name: 'READ_PENDING'; readonly place: Place; readonly authorized: Scope; readonly requestId: string }
  | { readonly name: 'READ_COMPLETE'; readonly place: Place; readonly executed: Scope; readonly admitted: number }
  | { readonly name: 'DISCOVERY_PRESENTED'; readonly place: Place; readonly discovery: Discovery | null; readonly copy: string; readonly nextMoves: readonly string[] }
  | { readonly name: 'DECLINED'; readonly place: Place; readonly nextMoves: readonly string[] }
  | { readonly name: 'KEEP_WRITING'; readonly place: Place };

export interface FirstResponse {
  readonly reflection: string;
  readonly wayToLook: string;
  /** Present iff a NEW reading is proposed. Names the exact scope. */
  readonly scopeNamed: Scope | null;
  readonly invitation: string;
  readonly nextMoves: readonly string[];
}

export interface Discovery {
  readonly observationId: string;
  readonly text: string;
  readonly place: Place;
  readonly provenance: 'maia-observation';
  /** ⭐ true iff it came from material MAIA already read. */
  readonly fromExistingEvidence: boolean;
}

export type Event =
  | { readonly type: 'OPEN_INTENTS' }
  | { readonly type: 'SELECT_INTENT'; readonly intent: IntentId; readonly facet: Facet }
  | { readonly type: 'NARROW_SCOPE'; readonly to: Scope }
  | { readonly type: 'AUTHORIZE_READING'; readonly scope: Scope; readonly clickId: string }
  | { readonly type: 'DECLINE' }
  | { readonly type: 'KEEP_WRITING' }
  | { readonly type: 'READ_COMPLETE'; readonly requestId: string; readonly admitted: number }
  | { readonly type: 'READ_FAILED'; readonly requestId: string }
  /* ⛔ none of these may commission */
  | { readonly type: 'NAVIGATE'; readonly to: 'develop' | 'review' }
  | { readonly type: 'OPEN_LENS'; readonly lens: string }
  | { readonly type: 'OPEN_MAIA' }
  | { readonly type: 'SWITCH_FACET'; readonly facet: Facet };

/** A commissioned reading, as the machine's audit log records it. */
export interface Commission { readonly requestId: string; readonly scope: Scope; readonly authorizedBy: 'AUTHORIZE_READING'; }

export interface IntentMachine {
  step(state: State, event: Event, evidence: Evidence): State;
  /** Every reading this machine has ever issued. ⛔ Must be empty until AUTHORIZE_READING. */
  commissions(): readonly Commission[];
  /** The member-facing options at the front door. */
  frontDoor(evidence: Evidence): readonly { readonly id: IntentId | string; readonly label: string }[];
}

/** CONFORMING REFERENCE — a test double, ⛔ never a seed. */
import type { Commission, Discovery, Evidence, Event, Facet, FirstResponse, IntentId, IntentMachine, Scope, State } from './contract';

export const INTENT_LABELS: Readonly<Record<IntentId, string>> = {
  'feels-off': 'Something feels off', 'see-the-shape': 'Help me see the shape',
  'losing-the-thread': 'I’m losing the thread', 'not-my-voice': 'This doesn’t sound like me',
  'what-is-this-chapter-doing': 'I’m not sure what this chapter is doing', 'what-keeps-appearing': 'Show me what keeps appearing',
  'go-deeper': 'I want to go deeper here', 'repeating-myself': 'I’m worried I’m repeating myself',
  'help-me-look': 'I don’t know — help me look', 'keep-writing': 'Keep writing',
};

const REFLECT: Readonly<Record<IntentId, string>> = {
  'feels-off': 'It sounds like something in this chapter feels off to you.',
  'see-the-shape': 'You’d like to see the shape of this.',
  'losing-the-thread': 'It sounds like the chapter is losing its thread for you.',
  'not-my-voice': 'It sounds like this doesn’t sound like you.',
  'what-is-this-chapter-doing': 'You’re not sure what this chapter is doing.',
  'what-keeps-appearing': 'You’d like to see what keeps appearing.',
  'go-deeper': 'You want to go deeper here.',
  'repeating-myself': 'You’re worried you’re repeating yourself.',
  'help-me-look': 'You’re not sure what you’re looking for yet.',
  'keep-writing': '',
};

export class ReferenceIntentMachine implements IntentMachine {
  private log: Commission[] = [];
  private seq = 0;
  private seenClicks = new Set<string>();

  commissions(): readonly Commission[] { return this.log; }

  frontDoor(evidence: Evidence) {
    void evidence;
    return (Object.keys(INTENT_LABELS) as IntentId[]).map((id) => ({ id, label: INTENT_LABELS[id] }));
  }

  /** ⭐ Orientation from existing evidence or a NAMED scope — never a read. Facet-invariant in scope. */
  private orient(intent: IntentId, place: { sectionId: string }, evidence: Evidence, _facet: Facet): FirstResponse {
    const existing = evidence.admittedHere.length > 0;
    if (existing) {
      return { reflection: REFLECT[intent], wayToLook: 'One way to look is at what MAIA has already seen here.',
        scopeNamed: null, invitation: `You already have ${evidence.admittedHere.length} observation(s) tied to this chapter. Want to follow one first?`,
        nextMoves: ['Follow that first', 'Read this chapter again', 'Keep writing'] };
    }
    const canChapter = evidence.capabilities.includes('chapter');
    const scope: Scope | null = canChapter ? { kind: 'chapter', sectionIds: [place.sectionId] } : null;
    return { reflection: REFLECT[intent], wayToLook: 'One way to look is whether the chapter’s shape changes where it starts feeling that way.',
      scopeNamed: scope,
      invitation: scope ? 'I can read this chapter to see where the through-line carries or drops. Want me to read it?'
        : 'I don’t have enough of this chapter in view to say anything useful yet.',
      nextMoves: scope ? ['Yes, read this chapter', 'Not now', 'Keep writing'] : ['Keep writing', 'Ask about a specific passage'] };
  }

  step(state: State, event: Event, evidence: Evidence): State {
    const place = state.place;
    /* ⛔ The five non-authorities: none changes anything but orientation. */
    if (event.type === 'NAVIGATE' || event.type === 'OPEN_LENS' || event.type === 'OPEN_MAIA' || event.type === 'SWITCH_FACET') return state;
    if (event.type === 'KEEP_WRITING') return { name: 'KEEP_WRITING', place };
    if (event.type === 'OPEN_INTENTS') return { name: 'INTENT_OPEN', place };
    if (event.type === 'SELECT_INTENT') {
      if (event.intent === 'keep-writing') return { name: 'KEEP_WRITING', place };
      const response = this.orient(event.intent, place, evidence, event.facet);
      if (response.scopeNamed === null && evidence.admittedHere.length > 0) {
        const first = evidence.admittedHere[0]!;
        const discovery: Discovery = { observationId: first.observationId, text: first.text, place, provenance: 'maia-observation', fromExistingEvidence: true };
        return { name: 'DISCOVERY_PRESENTED', place, discovery, copy: response.invitation, nextMoves: response.nextMoves };
      }
      if (response.scopeNamed === null) return { name: 'ORIENTED', place, intent: event.intent, response };
      return { name: 'SCOPE_PROPOSED', place, intent: event.intent, suggested: response.scopeNamed, response };
    }
    if (event.type === 'NARROW_SCOPE' && state.name === 'SCOPE_PROPOSED') return { ...state, suggested: event.to };
    /* ⭐ R13 — narrowing while a broad read is PENDING supersedes it: the queued
       commission is withdrawn before it can execute. */
    if (event.type === 'NARROW_SCOPE' && state.name === 'READ_PENDING') {
      this.log = this.log.filter((c) => c.requestId !== state.requestId);
      return { name: 'SCOPE_PROPOSED', place, intent: 'losing-the-thread', suggested: event.to,
        response: { reflection: 'Narrowed.', wayToLook: '', scopeNamed: event.to, invitation: `Read ${event.to.kind}?`, nextMoves: ['Yes', 'Not now', 'Keep writing'] } };
    }
    if (event.type === 'DECLINE') return { name: 'DECLINED', place, nextMoves: ['Keep writing', 'Ask about a specific passage'] };
    if (event.type === 'AUTHORIZE_READING' && state.name === 'SCOPE_PROPOSED') {
      /* ⭐ duplicate permission is one act */
      if (this.seenClicks.has(event.clickId)) return state;
      this.seenClicks.add(event.clickId);
      const authorized = event.scope; /* ⭐ what the member said — never the suggestion */
      const requestId = `req-${++this.seq}`;
      this.log.push({ requestId, scope: authorized, authorizedBy: 'AUTHORIZE_READING' });
      return { name: 'READ_PENDING', place, authorized, requestId };
    }
    if (event.type === 'READ_COMPLETE' && state.name === 'READ_PENDING' && event.requestId === state.requestId) {
      const copy = event.admitted > 0 ? 'Here is what MAIA noticed.'
        : 'MAIA read this chapter for the question you asked and didn’t find something she could support with evidence.';
      return { name: 'DISCOVERY_PRESENTED', place, discovery: null, copy,
        nextMoves: event.admitted > 0 ? ['Show me', 'Keep writing'] : ['Keep writing', 'Try another way of looking', 'Ask about a specific passage'] };
    }
    if (event.type === 'READ_FAILED' && state.name === 'READ_PENDING') {
      return { name: 'DECLINED', place, nextMoves: ['Try again', 'Choose a smaller scope', 'Keep writing'] };
    }
    return state;
  }
}

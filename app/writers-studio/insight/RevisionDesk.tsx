'use client';
import { useEffect, useRef, useState } from 'react';
import MaiaListen from './MaiaListen';
import EditorialApproaches from './EditorialApproaches';
import { selectedProposalText, alternativeLabel, passageContext } from '@/lib/writersStudio/editorialApproaches';
import type { RebuildEditorialThread, RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import { editorialSegments } from '@/lib/writersStudio/editorialDiff';
import { DEPTH_CHOICES, type EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { EditorialLatitude } from '@/lib/manuscript/editorialScope/contract';
/* ⭐ ONE control, shared with the canvas surface. ⛔ Not re-declared here — a
   second copy is a second place the protective default can drift. */
import EditingLatitude from './EditingLatitude';

export interface MemberRevisionDraft {
  threadId: string; sectionId: string; supersedes: string | null; text: string; purpose?: string;
}
export default function RevisionDesk({
  active = true, inline = false, onPreview, onEditOriginal, onReadContext, composedText, depth, onDepth, openDraftNonce, showInspiration = true, scopeKey = 'passage', manuscriptId, title, currentText, thread, version, instruction, onInstruction, onSend, onSelectVersion,
  onApply, onSaveMember, busy, message, response, onKeep, sectionBody, appliedVersionId, onUndo, undoMessage,
  latitude = 1, onLatitude, mayRemoveParagraphs = false, onMayRemoveParagraphs, voiceNotice,
  mayProposeImmediately = false, onMayProposeImmediately,
}: {
  onEditOriginal?: () => void; onReadContext?: () => void;
  /** ⭐ C6R4 — what the writer wants of MAIA next. ⛔ Never what MAIA has
   *  concluded about the writer. */
  depth?: EditorialDepth;
  onDepth?: (depth: EditorialDepth) => void;
  /**
   * ⭐⭐ C6R7 — `Change it` on a mark must OPEN the writer's draft, not point at
   * a control they have to find. Each increment is one request from the page to
   * open the current composition for rewriting.
   * ⚠️ A nonce rather than a boolean: the writer may press `Change it`, close
   * the draft, and press it again on the same mark, and a boolean would already
   * be true the second time and do nothing.
   */
  openDraftNonce?: number;
  /** ⭐ C6R2 — the current composition of taken marks, when there is one. */
  composedText?: string | null;
  active?: boolean; inline?: boolean; onPreview?: (preview: { original: string; wording: string; changes: boolean } | null) => void;
  scopeKey?: string; showInspiration?: boolean; manuscriptId: string; title: string; currentText: string; thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null; instruction: string;
  onInstruction: (text: string) => void; onSend: (text?: string) => void;
  onSelectVersion: (id: string) => void; onApply: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  sectionBody?: string; appliedVersionId?: string | null; onUndo?: () => void; undoMessage?: string | null;
  busy: boolean; message: string | null; response: string | null; onKeep: () => void;
  /** ⭐ The author's editing latitude. ⛔ Defaults to the most protective value. */
  latitude?: EditorialLatitude; onLatitude?: (v: EditorialLatitude) => void;
  mayRemoveParagraphs?: boolean; onMayRemoveParagraphs?: (v: boolean) => void;
  /** ⭐ The per-Work release of the discuss-first order, at latitude 1. */
  mayProposeImmediately?: boolean; onMayProposeImmediately?: (v: boolean) => void;
  /**
   * ⭐ What this suggestion brought in that is not the writer's, or `null`.
   * ⛔ Shown BESIDE the proposal, never after the writer has accepted it.
   */
  voiceNotice?: string | null;
}) {
  const [openTool, setOpenTool] = useState<string | null>(null);
  useEffect(() => { setOpenTool(null); }, [scopeKey]);
  const [editorialQuestion, setEditorialQuestion] = useState('');
  const [reasonQuestion, setReasonQuestion] = useState('');
  useEffect(() => { setReasonQuestion(''); }, [scopeKey, version?.id]);
  const [directionContext, setDirectionContext] = useState('');
  const [reviewed, setReviewed] = useState<string | null>(null);
  const [purpose, setPurpose] = useState('');
  const previewKey = JSON.stringify([scopeKey, version?.id, version?.wording, currentText, sectionBody]);
  const context = passageContext(sectionBody ?? currentText, currentText);
  const versionLabel = version ? alternativeLabel(version, thread?.versions.findIndex(v => v.id === version.id) ?? 0) : '';
  const discuss = () => {
    const question = [editorialQuestion, reasonQuestion, instruction.trim()].filter(Boolean).join('\n');
    /* ⭐⭐ THE SECTION IS NO LONGER PASTED INTO THE WRITER'S OWN MESSAGE.
     *
     * ⚠️ It used to travel here as "Current section context (reference only)",
     * which made the difference between MATERIAL MAIA MAY READ and WORDS SHE
     * MAY CHANGE a parenthetical inside something the writer said. ⛔ It was
     * not something the writer said. The server now retrieves the surround
     * itself, as its own governed producer with its own stated permission
     * (`retrieved.writer_editorial_surround`).
     *
     * ⛔ Do not reintroduce it here. Two copies would reach cognition with two
     * different provenances, and the one wearing the writer's voice is the one
     * that caused the 2026-09-19 rewrite. */
    const text = [directionContext, question ? 'My question:\n' + question : '',
      version ? 'Discussing saved alternative ' + versionLabel + ':\n' + version.wording : '',
      draft && draft.threadId === thread?.threadId ? 'My unsaved working revision (for discussion, do not apply):\n' + draft.text : '',
      'First respond to my question and intention. My explanation may change your interpretation: acknowledge that explicitly when it does. Do not assume a noticed pattern is a defect or that agreement is required. If a concern remains, identify the supplied words behind it and explain a possible reader effect, not a proven one. Consider the strongest case for the original, ask one useful question when needed, and offer a manageable next step. Do not invent evidence from unseen parts of the work.',
      'If offering replacement wording, begin its rationale with "Editorial purpose: <short descriptive name>". Distinguish meaning changes from style and treat reader benefits as hypotheses. Explain the editorial rationale using supplied wording: what you notice, the craft principle, the possible reader benefit, what could be lost, and a case for keeping the original. Ask where the author’s intention is unclear.'
    ].filter(Boolean).join('\n\n');
    setLocalMessage(null); onSend(text);
  };
  const [showProposal, setShowProposal] = useState(true);
  const [changes, setChanges] = useState(inline);
  const [draft, setDraft] = useState<MemberRevisionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const blocked = busy || saving;
  const [part, setPart] = useState<{ versionId: string; text: string } | null>(null);
  useEffect(() => { setPart(null); setLocalMessage(null); }, [scopeKey]);
  useEffect(() => { if (version) setShowProposal(true); }, [version?.id]);
  useEffect(() => { setPurpose(''); setEditorialQuestion(''); }, [scopeKey]);
  const workingRange = useRef({ start: 0, end: 0 });
  const draftMatches = Boolean(draft && draft.threadId === thread?.threadId && draft.sectionId === thread?.targetSectionId);
  const usablePart = part?.versionId === version?.id ? part : null;
  const startFromCurrent = () => {
    if (!thread?.targetSectionId || !version || draft || blocked) return;
    setDraft({ threadId: thread.threadId, sectionId: thread.targetSectionId,
      supersedes: version.id, text: currentText });
    workingRange.current = { start: currentText.length, end: currentText.length };
    setLocalMessage('Your working revision starts with the current wording. Select words in the proposal, then choose where to insert them in your working revision.');
  };
  const insertPart = () => {
    if (!draft || !draftMatches || !usablePart || blocked) return;
    const { start, end } = workingRange.current;
    if (start < 0 || end > draft.text.length) return;
    setDraft({ ...draft, text: draft.text.slice(0, start) + usablePart.text + draft.text.slice(end) });
    workingRange.current = { start: start + usablePart.text.length, end: start + usablePart.text.length };
    setLocalMessage('Selected words added to your working revision only. Review and save a version before applying.');
  };
  useEffect(() => {
    if (!draft) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft]);
  const matchesLocus = Boolean(thread && thread.locusText === currentText);
  useEffect(() => {
    onPreview?.((inline ? showProposal : showProposal && reviewed === previewKey) && matchesLocus && version && version.id !== appliedVersionId ? { original: currentText, wording: version.wording, changes } : null);
  }, [onPreview, showProposal, reviewed, previewKey, currentText, version, changes, inline, matchesLocus, appliedVersionId]);
  const revealedVersion = useRef<string | null>(null);
  useEffect(() => {
    if (!inline || !active || !version || !matchesLocus || version.id === appliedVersionId || revealedVersion.current === version.id) return;
    revealedVersion.current = version.id;
    // Reveal the marked paragraph without counting it as author review or approval.
    const frame = window.requestAnimationFrame(() => onReadContext?.());
    return () => window.cancelAnimationFrame(frame);
  }, [inline, active, version?.id, matchesLocus, appliedVersionId, onReadContext]);
  /* ⭐ C6R1 — the same word-level segments the manuscript now shows, so the
     secondary full-proposal view and the marked page cannot disagree about
     what changed. ⛔ This view is SECONDARY: the page carries the editing. */
  const diff = thread && version ? editorialSegments(thread.locusText, version.wording) : null;
  const edit = () => {
    if (!thread?.targetSectionId || !version || draft) return;
    /* ⭐ C6R2 — the writer adjusts WHAT THE PAGE IS SHOWING THEM: the marks they
       have taken so far. ⛔ Not MAIA's whole proposal, which they may never have
       accepted entire. Falls back to her wording when nothing is composed. */
    const base = composedText ?? version.wording;
    setDraft({ threadId: thread.threadId, sectionId: thread.targetSectionId,
      supersedes: version.id, text: base });
    workingRange.current = { start: base.length, end: base.length };
    setLocalMessage(null);
  };
  /* ⭐ The page asked for the draft. ⛔ `edit()` itself still refuses when there
     is no version to revise or a draft is already open, so this opens nothing
     that the desk's own control would not. */
  const openedFor = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (openDraftNonce === undefined || openedFor.current === openDraftNonce) return;
    openedFor.current = openDraftNonce;
    edit();
  }, [openDraftNonce]);

  const save = async () => {
    if (!draft || blocked || draft.threadId !== thread?.threadId) return;
    setSaving(true); setLocalMessage(null);
    try {
      if (await onSaveMember({ ...draft, ...(purpose.trim() ? { purpose: purpose.trim() } : {}) })) {
        setDraft(null);
        setLocalMessage('Your revision is saved in this conversation. Review it, then apply it when ready.');
      }
    } finally { setSaving(false); }
  };

  // The inline workspace has its own reading-first presentation. The state,
  // exact-locus checks and persistence callbacks above are shared with the desk.
  if (inline) {
    const latest = [...(thread?.turns ?? [])].reverse().find(t => t.speaker !== 'author');
    const explanation = latest?.body || response || version?.rationale || '';
    const previewing = Boolean(version && showProposal && matchesLocus && version.id !== appliedVersionId);
    const previewReviewed = previewing && reviewed === previewKey;
    const toggleTool = (name: string) => setOpenTool(openTool === name ? null : name);
    const keep = () => { setShowProposal(false); setLocalMessage(null); onKeep(); };
    return <section data-revision-desk data-inline className="wsi-page-conversation" aria-label="Explore this passage with MAIA">
      {showInspiration && <WorkInspiration manuscriptId={manuscriptId}
        onBringToQuestion={text => onInstruction([instruction, 'The direction for this Work:\n' + text].filter(Boolean).join('\n\n'))} />}
      {busy && <p role="status" aria-live="polite">MAIA is working on your request. Your manuscript is unchanged.</p>}
      {message && <p role="alert" className="wsi-request-error">{message}</p>}
      {previewing && <p role="status" aria-live="polite">Proposed changes are marked in the passage above: <ins>added words</ins> · <del>removed words</del>. Nothing is applied yet.</p>}
      <div className="wsi-conversation-path" aria-label="Passage editing path">
        <p>{version ? 'See what changed, then decide.' : 'Understand it before changing it.'}</p>
        <ol>
          <li data-state="complete">Notice</li>
          <li data-state={version ? 'complete' : 'current'}>Discuss</li>
          <li data-state={version ? 'complete' : 'next'}>Try</li>
          <li data-state={version ? 'current' : 'next'}>Decide</li>
        </ol>
      </div>
      <div className="wsi-page-voice"><strong>MAIA</strong>
        {explanation && <MaiaListen text={explanation} active={active} />}
        {version && <span className="wsi-purpose-label">{versionLabel}</span>}
      </div>
      {explanation ? <div className="wsi-page-response">
        <p>{explanation.length > 420 && openTool !== 'explanation' ? explanation.slice(0, explanation.lastIndexOf(' ', 420)) + '…' : explanation}</p>
        {explanation.length > 420 && <button className="wsi-text-button" onClick={() => toggleTool('explanation')} aria-expanded={openTool === 'explanation'}>{openTool === 'explanation' ? 'Show less' : 'Continue reading'}</button>}
      </div> : <p className="wsi-page-welcome">What are you hoping to say here? We can explore it together.</p>}
      {/* ⭐⭐ C6R4 — THE DEPTH DIAL, WHERE THE ANSWER IS.
          ⭐ `That makes sense` asks for nothing: understanding is allowed to be
          enough, and the Studio may not require a craft lesson or a
          deliberation the writer did not ask for.
          ⛔ No option names a level of skill — each names what the writer wants
          MAIA to do next. */}
      {explanation && onDepth && <div className="wsi-depth-choices" aria-label="How should MAIA explain this?">
        {DEPTH_CHOICES.map(({ label, depth: d }) =>
          <button type="button" key={label} disabled={blocked}
            aria-pressed={d !== null && d === depth}
            onClick={() => { if (d === null) { setOpenTool(null); return; }
              onDepth(d); }}>{label}</button>)}
      </div>}
      {!version && <div className="wsi-page-actions" aria-label="Explore before revising">
        {[
          ['Help me understand', 'Teach me the craft principle this observation raises, using only the supplied passage and observation. First show me the exact words you noticed. Explain in plain language what they may do for a reader, why that may matter, and when the same choice could be intentional or effective. Distinguish evidence from interpretation. Do not test me, infer anything about my ability, or propose replacement wording yet. End by asking what I intended.'],
          ['Explain what I meant', 'What I want this passage to do is '],
          ['Explore another approach', 'Help me explore two possible approaches to this passage, including keeping it as it is. Explain what each could gain or lose in relation to my intention and voice. Ask me about my intention if you need it before recommending an approach. Do not rewrite yet.'],
        ].map(([label, question]) => <button type="button" key={label} disabled={blocked} onClick={() => {
          onInstruction(instruction.trim() ? instruction + '\n\n' + question : question);
        }}>{label}</button>)}
      </div>}
      <form className="wsi-page-reply" onSubmit={e => { e.preventDefault(); discuss(); }}>
        <textarea aria-label="Discuss this passage" rows={1} value={instruction}
          onChange={e => onInstruction(e.target.value)} disabled={blocked}
          placeholder="Tell MAIA what you mean, ask about her concern, or explore another approach…"/>
        <button type="submit" disabled={blocked || (!instruction.trim() && !directionContext.trim() && !editorialQuestion && !reasonQuestion.trim()) || Boolean(draft && !draftMatches)}>{busy ? 'Thinking…' : 'Talk about it'}</button>
      </form>
      {onLatitude && onMayRemoveParagraphs && <EditingLatitude
        latitude={latitude} onLatitude={onLatitude}
        mayRemoveParagraphs={mayRemoveParagraphs} onMayRemoveParagraphs={onMayRemoveParagraphs}
        mayProposeImmediately={mayProposeImmediately} onMayProposeImmediately={onMayProposeImmediately}
        disabled={blocked} />}
      <div className="wsi-page-actions">
        {!version && <>
          <button type="button" className="wsi-primary" disabled={blocked || Boolean(draft)} onClick={() => onSend([
            directionContext,
            instruction.trim() ? 'My intention: ' + instruction.trim() : '',
            'Offer one possible revision of this selected passage in response to the observation. Preserve my voice, style, subject, and intentional ambiguity. Begin the rationale with "Editorial purpose: <short descriptive name>". Explain what changes, what might be lost, and why I might keep the original. Do not invent experiences or facts. Return replacement wording only if a revision is warranted; otherwise explain why. Nothing is to be applied automatically.'
          ].filter(Boolean).join('\n\n'))}>{busy ? 'Exploring…' : 'Try a revision'}</button>
          {onEditOriginal && <button type="button" disabled={blocked} onClick={onEditOriginal}>Edit my words</button>}
          <button type="button" disabled={blocked} onClick={keep}>Keep my wording</button>
        </>}
        {version && <div className="wsi-reading-switch" role="group" aria-label="Read passage">
          <button aria-pressed={!previewing} onClick={() => setShowProposal(false)}>Original</button>
          <button aria-pressed={previewReviewed} disabled={blocked || Boolean(draft) || !context || !matchesLocus || version?.id === appliedVersionId} onClick={() => { setShowProposal(true); setReviewed(previewKey); onReadContext?.(); }}>Read in context</button>
        </div>}
        {version && <button type="button" aria-pressed={changes} onClick={() => setChanges(!changes)}>{changes ? 'Show clean proposal' : 'Show changes'}</button>}
        {version && thread && <>
          <button disabled={blocked || Boolean(draft) || thread.legacyLocus} onClick={edit}>Change it</button>
          <button disabled={blocked} onClick={keep}>Keep mine</button>
          <button className="wsi-primary" onClick={() => { setLocalMessage(null); onApply(); }}
            disabled={blocked || thread.legacyLocus || Boolean(draft) || !previewReviewed || version.id === appliedVersionId}>Use this revision</button>
        </>}
      </div>
      {voiceNotice && version && <p className="wsi-voice-notice" role="note">{voiceNotice}</p>}
      <div className="wsi-page-foot">
        <span>{draft ? 'Your draft · not applied' : version && version.id === appliedVersionId ? 'Applied to this passage' : previewing ? 'Proposed changes · not applied. Read in context before applying.' : version ? 'Original wording' : 'Highlighted text is the passage we are discussing. No edit proposed yet.'}</span>
        <button className="wsi-text-button" aria-expanded={openTool === 'tools'} onClick={() => toggleTool('tools')}>{version ? 'Why this edit? · More options' : 'Intention, voice & history'}</button>
      </div>
      {draft && <section className="wsi-page-draft" aria-label="Your working revision">
        <label>Your words<textarea className="wsi-revision" value={draft.text} disabled={saving || !draftMatches}
          onSelect={e => { workingRange.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }; }}
          onChange={e => setDraft({ ...draft, text: e.target.value })}/></label>
        <label>Name this version <input maxLength={80} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="A quieter ending"/></label>
        {draftMatches && draft.supersedes !== thread?.headVersionId && <div role="status"><p>A new possibility arrived. Your draft is still here.</p>
          <button disabled={blocked} onClick={() => setDraft({ ...draft, supersedes: thread!.headVersionId })}>Continue with my draft</button></div>}
        {!draftMatches && <p role="status">This draft belongs to the previous passage. Return there to save it.</p>}
        <div className="wsi-page-actions"><button disabled={blocked || !draftMatches || draft.supersedes !== thread?.headVersionId} onClick={() => void save()}>Save this version</button><button disabled={blocked} onClick={() => setDraft(null)}>Discard draft</button></div>
        <p className="wsi-muted">You can keep talking while you write. Save this version before leaving the page.</p>
      </section>}
      <div hidden={openTool !== 'tools'} className="wsi-page-tools">
        <details><summary>My intention and voice</summary><EditorialApproaches scopeKey={scopeKey} onContext={setDirectionContext} busy={blocked}/></details>
        <details><summary>Understand the suggestion</summary>
          {version?.rationale && <p className="wsi-prose">{version.rationale}</p>}
          <div className="wsi-page-actions">{[
            ['What could be lost?', 'What voice, ambiguity, rhythm, or meaning could be lost in this suggestion?'],
            ['Why keep my original?', 'Make the strongest case for keeping my original wording. Do not assume revision is improvement.'],
            ['Show another possibility', 'Offer another possibility that preserves my intention and voice. Explain meaning changes and stylistic changes separately.']
          ].map(([label, question]) => <button key={label} disabled={blocked} onClick={() => onInstruction(question)}>{label}</button>)}</div>
          <label>Explore a question<select value={editorialQuestion} onChange={e => setEditorialQuestion(e.target.value)}><option value="">Choose a question…</option>{EDITORIAL_QUESTIONS.map(q => <option key={q.id} value={q.question}>{q.label}</option>)}</select></label>
          <p className="wsi-muted">Choose a question, make it your own, then Send.</p>
        </details>
        {version && <details><summary>Compare or borrow words</summary>
          <button aria-pressed={changes} onClick={() => setChanges(!changes)}>{changes ? 'Hide changes' : 'Show additions and removals in the page'}</button>
          <label>Select words from this proposal<textarea readOnly value={version.wording} onSelect={e => { const t=e.currentTarget; const text=selectedProposalText(version.wording,t.selectionStart,t.selectionEnd); setPart(text ? {versionId:version.id,text}:null); }}/></label>
          <div className="wsi-page-actions"><button disabled={blocked || Boolean(draft) || thread?.legacyLocus} onClick={startFromCurrent}>Start with my original</button><button disabled={blocked || !draftMatches || !usablePart} onClick={insertPart}>Add selected words to my draft</button></div>
        </details>}
        {thread && <details><summary>Our conversation and versions</summary>
          {thread.versions.length > 0 && <select aria-label="Version history" value={version?.id ?? ''} onChange={e => onSelectVersion(e.target.value)} disabled={blocked}>{thread.versions.map((v,i) => <option key={v.id} value={v.id}>{alternativeLabel(v,i)}</option>)}</select>}
          {thread.turns.map(turn => <article key={turn.turnIndex}><strong>{turn.speaker === 'author' ? 'You' : 'MAIA'}</strong><p className="wsi-prose">{turn.body}</p></article>)}
        </details>}
      </div>
      {version && !context && <p role="status">This passage has moved or changed. Reopen it to preview and apply safely.</p>}
      {appliedVersionId && <div className="wsi-page-applied"><span>Applied: {thread?.versions.find(v => v.id === appliedVersionId) ? alternativeLabel(thread.versions.find(v => v.id === appliedVersionId)!, thread.versions.findIndex(v => v.id === appliedVersionId)) : appliedVersionId}</span>
        {onUndo && <button disabled={blocked} onClick={onUndo}>Undo this change</button>}</div>}
      {(localMessage || undoMessage) && <p role="status" aria-live="polite">{localMessage}{undoMessage && ' ' + undoMessage}</p>}
    </section>;
  }

  return <section data-revision-desk data-inline={inline}>
    {showInspiration && <WorkInspiration manuscriptId={manuscriptId} onBringToQuestion={text => onInstruction([instruction, 'Work inspiration and intention:\n' + text].filter(Boolean).join('\n\n'))} />}
    {!inline && <><span className="wsi-eyebrow">Passage Work</span><h3>{title}</h3></>}
    {onLatitude && onMayRemoveParagraphs && <EditingLatitude
      latitude={latitude} onLatitude={onLatitude}
      mayRemoveParagraphs={mayRemoveParagraphs} onMayRemoveParagraphs={onMayRemoveParagraphs}
      mayProposeImmediately={mayProposeImmediately} onMayProposeImmediately={onMayProposeImmediately}
      disabled={blocked} />}
    <details className="wsi-setup">
      <summary>Direction, intention, and voice</summary>
      <EditorialApproaches scopeKey={scopeKey} onContext={setDirectionContext} busy={blocked} />
    </details>
    <div className="wsi-conversation-layout"><div className="wsi-revision-controls">
    <div className="wsi-bar">
      <button type="button" disabled={blocked} onClick={() => { setShowProposal(false); setLocalMessage(null); onKeep(); }}>Keep current wording</button>
      <label><input type="checkbox" checked={showProposal} onChange={e => setShowProposal(e.target.checked)} /> Proposed wording</label>
      {version && <button type="button" aria-pressed={changes} onClick={() => setChanges(v => !v)}>{changes ? 'Clean proposal' : 'Show additions and removals'}</button>}
      {thread && thread.versions.length > 1 && <details><summary>Version history</summary><label>Version to compare <select value={version?.id ?? ''}
        onChange={e => onSelectVersion(e.target.value)} disabled={blocked}>
        <option value="" disabled>Choose a version</option>
        {thread.versions.map((v, i) => <option key={v.id} value={v.id}>{alternativeLabel(v, i)}</option>)}
      </select></label></details>}
    </div>
    <details className="wsi-proposal-details" open={inline ? undefined : true}><summary>Proposal text and selected words</summary><div className="wsi-grid">
      {!inline && <div><span className="wsi-eyebrow">Current manuscript · {title}</span><div className="wsi-current wsi-prose">{currentText}</div></div>}
      {showProposal && version && thread ? <div>
        <span className="wsi-eyebrow">{version.author === 'member' ? 'Your saved revision' : 'MAIA proposal'} · not automatically applied</span>
        {changes && diff ? <div className="wsi-proposed wsi-prose">
          {diff.map((seg, i) => seg.kind === 'same' ? <span key={i}>{seg.text}</span>
            : seg.protectedSpan ? (seg.kind === 'del'
              ? <span key={i} className="ws-protected-quote" data-protected-quote>{seg.text}</span> : null)
            : seg.kind === 'del' ? <del key={i}>{seg.text}</del> : <ins key={i}>{seg.text}</ins>)}
        </div> : <div className="wsi-proposed wsi-prose">{version.wording || <em>Remove the selected passage.</em>}</div>}
        {changes && <p className="wsi-muted">Changes against the original passage held by this conversation. Underline = addition; strike-through = removal.</p>}
        {/* ⭐⭐ Placed with the PROPOSAL, not with the outcome. A writer who is
            still finding their voice needs to see this while deciding, not
            after. ⛔ It is a fact and a question, never a grade. */}
        {voiceNotice && <p className="wsi-voice-notice" role="note">{voiceNotice}</p>}
        {version.wording && <details><summary>Use selected words in my own revision</summary>
          <label>Select words from this proposal
            <textarea readOnly value={version.wording} aria-label="Select words from this proposal"
              onSelect={e => { const target = e.currentTarget;
                const text = selectedProposalText(version.wording, target.selectionStart, target.selectionEnd);
                setPart(text ? { versionId: version.id, text } : null);
              }} />
          </label>
          <p className="wsi-muted">Select with the keyboard or pointer. Start from your current wording, then place the cursor or select text in your working revision.</p>
          <button type="button" disabled={blocked || Boolean(draft) || thread.legacyLocus} onClick={startFromCurrent}>Build from current wording</button>
          <button type="button" disabled={blocked || !draftMatches || !usablePart} onClick={insertPart}>Insert selected words into my working revision</button>
          {usablePart && <p className="wsi-muted">Selected: {usablePart.text}</p>}
        </details>}

      </div> : <p className="wsi-muted">{version ? 'Proposed wording is hidden.' : 'Ask for a possibility below. Your manuscript remains unchanged while you explore.'}</p>}
    </div></details>
    {version && thread && <details className="wsi-teaching"><summary>Why this suggestion?</summary>        <section className="wsi-reasoning" aria-label="Editorial explanation">

          {version.rationale ? <><p className="wsi-observation">{version.rationale}</p><MaiaListen text={version.rationale} active={active} /></> : <p>Ask MAIA to explain this alternative before choosing it.</p>}
          <p className="wsi-muted">Explore the craft, test the interpretation, and weigh what this version gains or loses.</p>
          <div className="wsi-bar">
            {[
              ['Explain the craft', 'Explain the craft principle behind this suggestion using the supplied original and proposed wording. Show what changed in meaning versus style, and when this technique might not fit.'],
              ['What could be lost?', 'What voice, ambiguity, rhythm, or meaning could be lost in this suggestion? Treat reader effects as hypotheses and identify what more context would be needed.'],
              ['Make the case for my original', 'Make the strongest case for keeping my original wording. What may it accomplish that this alternative does not? Do not assume that revision is improvement.'],
              ['Try another direction', 'Offer a different editorial direction that preserves my stated intention. Explain its tradeoffs before proposing wording; do not invent personal experience or sources.'],
            ].map(([label, question]) => <button type="button" key={label} disabled={blocked} aria-pressed={reasonQuestion === question}
              onClick={() => setReasonQuestion(question)}>{label}</button>)}
          </div>
          {reasonQuestion && <label>Question for MAIA<textarea value={reasonQuestion} onChange={event => setReasonQuestion(event.target.value)} /></label>}
          <p className="wsi-muted">Choose or edit a question, then use Discuss this below. Your working revision stays here.</p>
        </section></details>}
    {version && thread && <section aria-label="Review in context">
      <button type="button" disabled={blocked || Boolean(draft) || !context} onClick={() => setReviewed(previewKey)}>Read in context</button>
      {inline && reviewed === previewKey && context && <p role="status">Preview shown in the highlighted manuscript passage above. Not applied.</p>}
      {!context && <p role="status">The passage cannot be located uniquely in the current section. Reopen it before applying.</p>}
      {!inline && reviewed === previewKey && context && <div className="wsi-current wsi-prose">
        <p className="wsi-muted">Section context · proposed passage is marked. Surrounding wording is unchanged.</p>
        {context.before}<mark>{version.wording || <em>Selected passage removed</em>}</mark>{context.after}
      </div>}
    </section>}
    {version && thread && <div className="wsi-bar">
      <button type="button" onClick={edit} disabled={blocked || Boolean(draft) || thread.legacyLocus}>Adjust this wording</button>
      <button type="button" className="wsi-primary" onClick={() => { setLocalMessage(null); onApply(); }} disabled={blocked || thread.legacyLocus || Boolean(draft) || reviewed !== previewKey || version.id === appliedVersionId}>
        {busy ? 'Working…' : version.author === 'member' ? 'Apply your saved revision' : 'Apply this proposal'}
      </button>
    </div>}
    {draft && <section>
      {draftMatches && draft.supersedes !== thread?.headVersionId && <div role="status">
        <p>A newer alternative arrived. Your working words are preserved. Choose whether to continue them after that alternative.</p>
        <button type="button" disabled={blocked} onClick={() => setDraft({ ...draft, supersedes: thread!.headVersionId })}>Continue my draft after the latest alternative</button>
      </div>}
      <label>Purpose of this alternative<input maxLength={80} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="For example: More embodied, Quieter ending" /></label>
      <label>Your working revision<textarea className="wsi-revision" value={draft.text}
        disabled={saving || !draftMatches}
        onSelect={e => { workingRange.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }; }}
        onChange={e => setDraft({ ...draft, text: e.target.value })} /></label>
      <p className="wsi-muted">Held on this page, including when you return to the manuscript. Save as a version before leaving the page. Saving a version does not apply it.</p>
      {draft.threadId !== thread?.threadId && <p role="status">This revision belongs to your previous passage conversation. Reopen that conversation to save it; its text is still here.</p>}
      <div className="wsi-bar">
        <button type="button" onClick={() => void save()} disabled={blocked || !draftMatches || draft.supersedes !== thread?.headVersionId}>Save your revision as a version</button>
        <button type="button" disabled={blocked} onClick={() => setDraft(null)}>Discard working revision</button>
      </div>
    </section>}
    </div><aside className="wsi-discussion">
    {thread && thread.turns.length > 0 ? <section aria-label="Passage conversation">
      <details className="wsi-history"><summary>Conversation history · {thread.turns.length} turns</summary>{thread.turns.slice(0, -1).map(turn => <article key={turn.turnIndex}><strong>{turn.speaker === 'author' ? 'You' : 'MAIA'}</strong><p className="wsi-observation">{turn.body}</p></article>)}</details>{thread.turns.slice(-1).map(turn => <article key={turn.turnIndex}>
        <strong>{turn.speaker === 'author' ? 'You' : 'MAIA'}</strong>
        {turn.speaker !== 'author' && <MaiaListen text={turn.body} active={active} />}
        {turn.speaker === 'author' && turn.body.includes('If offering replacement wording,') ? <>
          <p className="wsi-observation">{turn.body.match(/My question:\n([\s\S]*?)(?=\n\n(?:Current section context|Discussing saved alternative|My unsaved working revision|If offering replacement wording)|$)/)?.[1]
            ?? turn.body.match(/My intention: ([^\n]+)/)?.[1]
            ?? turn.body.match(/Direction I want to explore: ([^\n]+)/)?.[1] ?? 'Discuss this passage'}</p>
          <details><summary>Context sent with this question</summary><p className="wsi-observation">{turn.body}</p></details>
        </> : <p className="wsi-observation">{turn.body}</p>}
      </article>)}
    </section> : response && <div><MaiaListen text={response} active={active} /><p className="wsi-observation">{response}</p></div>}
    <details className="wsi-question-options"><summary>Explore an editorial question</summary><label>Add an editorial question <select value={editorialQuestion} disabled={blocked} onChange={e => setEditorialQuestion(e.target.value)}>
      <option value="">Choose a question…</option>
      {EDITORIAL_QUESTIONS.map(q => <option key={q.id} value={q.question}>{q.label}</option>)}
    </select></label></details>
    <label>Discuss this passage
      <textarea rows={2} value={instruction} onChange={e => onInstruction(e.target.value)} disabled={blocked}
        placeholder="Explain what you intend, what matters to the reader, and what you want to preserve, deepen, redirect, or try differently." />
    </label>
    <details className="wsi-disclosure"><summary>What MAIA receives</summary><p className="wsi-muted">Your question, selected direction, intention, included voice notes, section context, and working revision. Discussing does not apply wording.</p></details>
    <div className="wsi-bar">
      <button type="button" onClick={discuss} disabled={blocked || (!instruction.trim() && !directionContext.trim() && !editorialQuestion && !reasonQuestion.trim()) || Boolean(draft && !draftMatches)}>{busy ? 'MAIA is working…' : 'Discuss this'}</button>
    </div>
    {undoMessage && !appliedVersionId && <p role="status">{undoMessage}</p>}
    {appliedVersionId && <section aria-label="Applied revision">
      <p>Applied revision: {thread?.versions.findIndex(v => v.id === appliedVersionId)! >= 0
        ? alternativeLabel(thread!.versions.find(v => v.id === appliedVersionId)!, thread!.versions.findIndex(v => v.id === appliedVersionId)) : appliedVersionId}.</p>
      {onUndo && <button type="button" disabled={blocked} onClick={onUndo}>Undo that application</button>}
      {undoMessage && <p role="status">{undoMessage}</p>}
    </section>}
    <p role="status" aria-live="polite">{draft ? (localMessage ?? 'Working revision · not applied. Discussing preserves this draft.') : localMessage ?? message ?? 'Comparing and drafting do not change the manuscript.'}</p>
    </aside></div>
  </section>;
}

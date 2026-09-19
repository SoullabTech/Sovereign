'use client';
import { useEffect, useRef, useState } from 'react';
import MaiaListen from './MaiaListen';
import EditorialApproaches from './EditorialApproaches';
import { selectedProposalText, alternativeLabel, passageContext } from '@/lib/writersStudio/editorialApproaches';
import type { RebuildEditorialThread, RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import { comparisonSpan } from '@/lib/writersStudio/insightComparison';

export interface MemberRevisionDraft {
  threadId: string; sectionId: string; supersedes: string | null; text: string; purpose?: string;
}
export default function RevisionDesk({
  active = true, inline = false, onPreview, showInspiration = true, scopeKey = 'passage', manuscriptId, title, currentText, thread, version, instruction, onInstruction, onSend, onSelectVersion,
  onApply, onSaveMember, busy, message, response, onKeep, sectionBody, appliedVersionId, onUndo, undoMessage,
}: {
  active?: boolean; inline?: boolean; onPreview?: (preview: { original: string; wording: string; changes: boolean } | null) => void;
  scopeKey?: string; showInspiration?: boolean; manuscriptId: string; title: string; currentText: string; thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null; instruction: string;
  onInstruction: (text: string) => void; onSend: (text?: string) => void;
  onSelectVersion: (id: string) => void; onApply: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  sectionBody?: string; appliedVersionId?: string | null; onUndo?: () => void; undoMessage?: string | null;
  busy: boolean; message: string | null; response: string | null; onKeep: () => void;
}) {
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
    const text = [directionContext, question ? 'My question:\n' + question : '',
      sectionBody && sectionBody !== currentText ? 'Current section context (reference only):\n' + sectionBody : '',
      version ? 'Discussing saved alternative ' + versionLabel + ':\n' + version.wording : '',
      draft && draft.threadId === thread?.threadId ? 'My unsaved working revision (for discussion, do not apply):\n' + draft.text : '',
      'If offering replacement wording, begin its rationale with "Editorial purpose: <short descriptive name>". Distinguish meaning changes from style and treat reader benefits as hypotheses. Explain the editorial rationale using supplied wording: what you notice, the craft principle, the possible reader benefit, what could be lost, and a case for keeping the original. Ask where the author’s intention is unclear.'
    ].filter(Boolean).join('\n\n');
    setLocalMessage(null); onSend(text);
  };
  const [showProposal, setShowProposal] = useState(true);
  const [changes, setChanges] = useState(false);
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
  useEffect(() => {
    onPreview?.(showProposal && reviewed === previewKey && version ? { original: currentText, wording: version.wording, changes } : null);
  }, [onPreview, showProposal, reviewed, previewKey, currentText, version, changes]);
  const diff = thread && version ? comparisonSpan(thread.locusText, version.wording) : null;
  const edit = () => {
    if (!thread?.targetSectionId || !version || draft) return;
    setDraft({ threadId: thread.threadId, sectionId: thread.targetSectionId,
      supersedes: version.id, text: version.wording });
    workingRange.current = { start: version.wording.length, end: version.wording.length };
    setLocalMessage(null);
  };
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
  return <section data-revision-desk data-inline={inline}>
    {showInspiration && <WorkInspiration manuscriptId={manuscriptId} onBringToQuestion={text => onInstruction([instruction, 'Work inspiration and intention:\n' + text].filter(Boolean).join('\n\n'))} />}
    <span className="wsi-eyebrow">Passage Work</span><h3>{title}</h3>
    <details className="wsi-setup" open={inline ? undefined : !version}>
      <summary>Direction, intention, and voice</summary>
      <EditorialApproaches scopeKey={scopeKey} onContext={setDirectionContext} busy={blocked} />
    </details>
    <div className="wsi-conversation-layout"><div>
    <div className="wsi-bar">
      <button type="button" disabled={blocked} onClick={() => { setShowProposal(false); setLocalMessage(null); onKeep(); }}>Keep current wording</button>
      <label><input type="checkbox" checked={showProposal} onChange={e => setShowProposal(e.target.checked)} /> Proposed wording</label>
      {version && <button type="button" aria-pressed={changes} onClick={() => setChanges(v => !v)}>{changes ? 'Clean proposal' : 'Show additions and removals'}</button>}
      {thread && thread.versions.length > 1 && <label>Version to compare <select value={version?.id ?? ''}
        onChange={e => onSelectVersion(e.target.value)} disabled={blocked}>
        <option value="" disabled>Choose a version</option>
        {thread.versions.map((v, i) => <option key={v.id} value={v.id}>{alternativeLabel(v, i)}</option>)}
      </select></label>}
    </div>
    <div className="wsi-grid">
      {!inline && <div><span className="wsi-eyebrow">Current manuscript · {title}</span><div className="wsi-current wsi-prose">{currentText}</div></div>}
      {showProposal && version && thread ? <div>
        <span className="wsi-eyebrow">{version.author === 'member' ? 'Your saved revision' : 'MAIA proposal'} · not automatically applied</span>
        {changes && diff ? <div className="wsi-proposed wsi-prose">
          {diff.before}<del>{diff.removed}</del><ins>{diff.added}</ins>{diff.after}
        </div> : <div className="wsi-proposed wsi-prose">{version.wording || <em>Remove the selected passage.</em>}</div>}
        {changes && <p className="wsi-muted">Changes against the original passage held by this conversation. Underline = addition; strike-through = removal.</p>}
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
        <section className="wsi-reasoning" aria-label="Editorial explanation">
          <h4>Why this suggestion?</h4>
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
        </section>
      </div> : <p className="wsi-muted">{version ? 'Proposed wording is hidden.' : 'Ask for a possibility below. Your manuscript remains unchanged while you explore.'}</p>}
    </div>
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
      <h3>Our conversation</h3>{thread.turns.map(turn => <article key={turn.turnIndex}>
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
    <label>Add an editorial question <select value={editorialQuestion} disabled={blocked} onChange={e => setEditorialQuestion(e.target.value)}>
      <option value="">Choose a question…</option>
      {EDITORIAL_QUESTIONS.map(q => <option key={q.id} value={q.question}>{q.label}</option>)}
    </select></label>
    <label>Discuss this passage
      <textarea value={instruction} onChange={e => onInstruction(e.target.value)} disabled={blocked}
        placeholder="Explain what you intend, what matters to the reader, and what you want to preserve, deepen, redirect, or try differently." />
    </label>
    <p className="wsi-muted">Discuss sends your question, selected direction, intention, included voice notes, section context, and any working revision in this conversation. It does not apply wording.</p>
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

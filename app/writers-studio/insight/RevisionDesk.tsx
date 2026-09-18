'use client';
import { useEffect, useRef, useState } from 'react';
import EditorialApproaches from './EditorialApproaches';
import { selectedProposalText } from '@/lib/writersStudio/editorialApproaches';
import type { RebuildEditorialThread, RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import { comparisonSpan } from '@/lib/writersStudio/insightComparison';

export interface MemberRevisionDraft {
  threadId: string; sectionId: string; supersedes: string | null; text: string;
}
export default function RevisionDesk({
  showInspiration = true, scopeKey = 'passage', manuscriptId, title, currentText, thread, version, instruction, onInstruction, onSend, onSelectVersion,
  onApply, onSaveMember, busy, message, response, onKeep,
}: {
  scopeKey?: string; showInspiration?: boolean; manuscriptId: string; title: string; currentText: string; thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null; instruction: string;
  onInstruction: (text: string) => void; onSend: () => void;
  onSelectVersion: (id: string) => void; onApply: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  busy: boolean; message: string | null; response: string | null; onKeep: () => void;
}) {
  const [showProposal, setShowProposal] = useState(true);
  const [changes, setChanges] = useState(false);
  const [draft, setDraft] = useState<MemberRevisionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const blocked = busy || saving;
  const [part, setPart] = useState<{ versionId: string; text: string } | null>(null);
  useEffect(() => { setPart(null); setLocalMessage(null); }, [scopeKey]);
  useEffect(() => { if (version) setShowProposal(true); }, [version?.id]);
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
      if (await onSaveMember(draft)) {
        setDraft(null);
        setLocalMessage('Your revision is saved in this conversation. Review it, then apply it when ready.');
      }
    } finally { setSaving(false); }
  };
  return <section data-revision-desk>
    {showInspiration && <WorkInspiration manuscriptId={manuscriptId} onBringToQuestion={text => onInstruction([instruction, 'Work inspiration and intention:\n' + text].filter(Boolean).join('\n\n'))} />}
    <span className="wsi-eyebrow">Passage Work</span><h3>{title}</h3>
    <EditorialApproaches scopeKey={scopeKey} instruction={instruction} onInstruction={onInstruction} busy={blocked} />
    <div className="wsi-bar">
      <button type="button" disabled={blocked} onClick={() => { setShowProposal(false); setLocalMessage(null); onKeep(); }}>Keep current wording</button>
      <label><input type="checkbox" checked={showProposal} onChange={e => setShowProposal(e.target.checked)} /> Proposed wording</label>
      {version && <button type="button" aria-pressed={changes} onClick={() => setChanges(v => !v)}>{changes ? 'Side by side' : 'Show additions and removals'}</button>}
      {thread && thread.versions.length > 1 && <label>Version to compare <select value={version?.id ?? ''}
        onChange={e => onSelectVersion(e.target.value)} disabled={blocked}>
        <option value="" disabled>Choose a version</option>
        {thread.versions.map((v, i) => <option key={v.id} value={v.id}>{i + 1} · {v.author === 'member' ? 'Your revision' : 'MAIA proposal'}</option>)}
      </select></label>}
    </div>
    <div className="wsi-grid">
      <div><span className="wsi-eyebrow">Current manuscript · {title}</span><div className="wsi-current wsi-prose">{currentText}</div></div>
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
        {version.rationale && <p className="wsi-muted">{version.rationale}</p>}
      </div> : <p className="wsi-muted">{version ? 'Proposed wording is hidden.' : 'Ask for a possibility below. Your manuscript remains unchanged while you explore.'}</p>}
    </div>
    {version && thread && <div className="wsi-bar">
      <button type="button" onClick={edit} disabled={blocked || Boolean(draft) || thread.legacyLocus}>Adjust this wording</button>
      <button type="button" className="wsi-primary" onClick={() => { setLocalMessage(null); onApply(); }} disabled={blocked || thread.legacyLocus || Boolean(draft)}>
        {busy ? 'Working…' : version.author === 'member' ? 'Apply your saved revision' : 'Apply this proposal'}
      </button>
    </div>}
    {draft && <section>
      <label>Your working revision<textarea className="wsi-revision" value={draft.text}
        disabled={saving || !draftMatches}
        onSelect={e => { workingRange.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }; }}
        onChange={e => setDraft({ ...draft, text: e.target.value })} /></label>
      <p className="wsi-muted">Held on this page, including when you return to the manuscript. Save as a version before leaving the page. Saving a version does not apply it.</p>
      {draft.threadId !== thread?.threadId && <p role="status">This revision belongs to your previous passage conversation. Reopen that conversation to save it; its text is still here.</p>}
      <div className="wsi-bar">
        <button type="button" onClick={() => void save()} disabled={blocked || draft.threadId !== thread?.threadId}>Save your revision as a version</button>
        <button type="button" disabled={blocked} onClick={() => setDraft(null)}>Discard working revision</button>
      </div>
    </section>}
    {response && <details><summary>MAIA’s response</summary><p className="wsi-observation">{response}</p></details>}
    <label>Add an editorial question <select value="" disabled={blocked} onChange={e => { if (e.target.value) onInstruction([instruction, e.target.value].filter(Boolean).join('\n\n')); }}>
      <option value="">Choose a question…</option>
      {EDITORIAL_QUESTIONS.map(q => <option key={q.id} value={q.question}>{q.label}</option>)}
    </select></label>
    <label>Explore an approach with MAIA
      <textarea value={instruction} onChange={e => onInstruction(e.target.value)} disabled={blocked}
        placeholder="Explain what you intend, what matters to the reader, and what you want to preserve, deepen, redirect, or try differently." />
    </label>
    <div className="wsi-bar">
      <button type="button" onClick={() => { setLocalMessage(null); onSend(); }} disabled={blocked || !instruction.trim() || Boolean(draft)}>{busy ? 'MAIA is working…' : 'Explore a revision with MAIA'}</button>
    </div>
    <p role="status" aria-live="polite">{message ?? localMessage ?? 'Comparing and drafting do not change the manuscript.'}</p>
  </section>;
}

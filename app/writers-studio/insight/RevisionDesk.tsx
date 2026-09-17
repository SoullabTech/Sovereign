'use client';
import { useEffect, useState } from 'react';
import type { RebuildEditorialThread, RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import WorkInspiration from './WorkInspiration';
import { EDITORIAL_QUESTIONS } from '@/lib/writersStudio/editorialQuestions';
import { comparisonSpan } from '@/lib/writersStudio/insightComparison';

export interface MemberRevisionDraft {
  threadId: string; sectionId: string; supersedes: string | null; text: string;
}
export default function RevisionDesk({
  showInspiration = true, manuscriptId, title, currentText, thread, version, instruction, onInstruction, onSend, onSelectVersion,
  onApply, onSaveMember, busy, message, response, onKeep,
}: {
  showInspiration?: boolean; manuscriptId: string; title: string; currentText: string; thread: RebuildEditorialThread | null;
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
    <div className="wsi-bar">
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
        {version.rationale && <p className="wsi-muted">{version.rationale}</p>}
      </div> : <p className="wsi-muted">{version ? 'Proposed wording is hidden.' : 'Ask for a possibility below. Your manuscript remains unchanged while you explore.'}</p>}
    </div>
    {version && thread && <div className="wsi-bar">
      <button type="button" onClick={edit} disabled={blocked || Boolean(draft) || thread.legacyLocus}>Adjust this wording</button>
      <button type="button" className="wsi-primary" onClick={onApply} disabled={blocked || thread.legacyLocus || Boolean(draft)}>
        {busy ? 'Working…' : version.author === 'member' ? 'Apply your saved revision' : 'Apply this proposal'}
      </button>
      <button type="button" disabled={blocked} onClick={() => { setShowProposal(false); onKeep(); }}>Keep current wording</button>
    </div>}
    {draft && <section>
      <label>Your working revision<textarea className="wsi-revision" value={draft.text}
        disabled={saving} onChange={e => setDraft({ ...draft, text: e.target.value })} /></label>
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
      <button type="button" onClick={onSend} disabled={blocked || !instruction.trim() || Boolean(draft)}>{busy ? 'MAIA is working…' : 'Explore a revision with MAIA'}</button>
    </div>
    <p role="status" aria-live="polite">{message ?? localMessage ?? 'Comparing and drafting do not change the manuscript.'}</p>
  </section>;
}

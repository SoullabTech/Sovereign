'use client';
/** Synthetic, local-only harness of the real RevisionDesk. No backend or model calls. */
import { useRef, useState } from 'react';
import RevisionDesk from './RevisionDesk';
import type { RebuildEditorialThread, RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';
const samples = [
  { title: 'The first fire', text: 'I learned the names of the flames before I learned to sit beside them. Knowledge gave me a map; the evening asked me to stay.' },
  { title: 'Returning to the fire', text: 'Years later I returned to the fire. The names were familiar, but grief had changed the person listening. I began to understand what the map could not show.' },
  { title: 'Carrying the warmth', text: 'When the fire settled, I carried its warmth into a conversation I had avoided. The teaching became real in the attention I could offer another person.' },
];
export default function AuthorAgencyPreview() {
  const [place, setPlace] = useState(0);
  const [texts, setTexts] = useState(samples.map(s => s.text));
  const [questions, setQuestions] = useState<Record<number, string>>({});
  const [versions, setVersions] = useState<Record<number, RebuildEditorialVersion[]>>({});
  const [selected, setSelected] = useState<Record<number, string | null>>({});
  const [applications, setApplications] = useState<Record<number, { id: string; before: string }>>({});
  const [turns, setTurns] = useState<Record<number, RebuildEditorialThread['turns']>>({});
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(0);
  const rows = versions[place] ?? [];
  const version = rows.find(v => v.id === selected[place]) ?? null;
  const thread: RebuildEditorialThread = { threadId: 'preview-' + place, chainId: 'chain-' + place,
    locusText: samples[place].text, targetSectionId: 'section-' + place, sectionLabel: samples[place].title,
    legacyLocus: false, turns: turns[place] ?? [], versions: rows, headVersionId: rows.at(-1)?.id ?? null };
  const add = (wording: string, author: 'maia' | 'member', supersedes: string | null, purpose?: string) => {
    const v = { id: 'preview-v' + ++nextId.current, wording, author, supersedes,
      rationale: purpose ? 'Editorial purpose: ' + purpose : author === 'maia' ? 'Editorial purpose: An open ending. Illustrative candidate only.' : null };
    setVersions(all => ({ ...all, [place]: [...(all[place] ?? []), v] }));
    setSelected(all => ({ ...all, [place]: v.id }));
  };
  return <main className="ws-insight" style={{ display: 'block', margin: '20px auto', height: 'auto', maxHeight: 'none' }}>
    <header className="wsi-header"><div><span className="wsi-eyebrow">Synthetic interaction preview</span><h2>Author-led revision</h2></div></header>
    <div className="wsi-scroll">
      <p role="note">This uses the actual revised editor with invented passages. Requests return a fixed example; saves and applications are in memory only. Refresh resets everything. The undo here is also in memory. Separate integration tests exercise the server and actual MAIA; this page demonstrates interaction only.</p>
      <nav className="wsi-bar" aria-label="Example passages">{samples.map((s, i) =>
        <button key={s.title} aria-pressed={place === i} onClick={() => { setPlace(i); setMessage(null); }}>{s.title}</button>)}</nav>
      <RevisionDesk showInspiration={false} scopeKey={'preview-' + place} manuscriptId="synthetic-preview"
        title={samples[place].title} currentText={texts[place]} thread={thread} version={version}
        instruction={questions[place] ?? ''} onInstruction={text => setQuestions(all => ({ ...all, [place]: text }))}
        onSend={text => { setTurns(all => ({ ...all, [place]: [...(all[place] ?? []), { turnIndex: (all[place]?.length ?? 0), speaker: 'author', body: text ?? '', at: new Date().toISOString() }, { turnIndex: (all[place]?.length ?? 0) + 1, speaker: 'maia', body: 'Fixed demonstration: consider leaving the passage with an open question. This is not a live MAIA response.', at: new Date().toISOString() }] })); add(samples[place].text + ' What might this ask of me now?', 'maia', thread.headVersionId); setMessage('Fixed example loaded; no model was called.'); }}
        onSelectVersion={id => setSelected(all => ({ ...all, [place]: id }))}
        onSaveMember={async draft => { add(draft.text, 'member', draft.supersedes, draft.purpose); return true; }}
        onApply={() => { if (version) { setApplications(all => ({ ...all, [place]: { id: version.id, before: texts[place] } })); setTexts(all => all.map((t, i) => i === place ? version.wording : t)); setMessage('Applied in this preview only.'); } }}
        onKeep={() => { setSelected(all => ({ ...all, [place]: null })); setMessage('Current wording retained.'); }}
        sectionBody={texts[place]} appliedVersionId={applications[place]?.id ?? null}
        onUndo={applications[place] ? () => {
          setTexts(all => all.map((t, i) => i === place ? applications[place].before : t));
          setApplications(all => { const next = { ...all }; delete next[place]; return next; });
          setMessage('Application undone in this preview only.');
        } : undefined}
        busy={false} message={message} response={null} />
    </div>
  </main>;
}

'use client';

import { useMemo, useRef, useState, type DragEvent } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { writeLocalReviewManuscript } from '@/lib/writersStudio/localReviewManuscript';

const ACCEPT = '.docx,.pdf,.epub,.txt,.md,.markdown';
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

type HeadingDepth = 1 | 2 | 3 | null;
type HeadingSignal = 'markdown' | 'chapter' | 'caps' | 'member' | null;

type ImportSection = {
  position: number;
  heading: string | null;
  body: string;
  headingDepth?: HeadingDepth;
  headingSignal?: HeadingSignal;
};

type ImportPhase = 'source' | 'structure';
type Busy = 'reading' | 'previewing' | 'saving' | null;

export type P4R1ImportManuscriptProps = {
  localReview: boolean;
  onCancel: () => void;
  onComplete: (manuscriptId: string) => void;
};

function fileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function errorFrom(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const error = (body as { error?: unknown }).error;
  return typeof error === 'string' && error.trim() ? error : fallback;
}

function renumber(sections: readonly ImportSection[]): ImportSection[] {
  return sections.map((section, position) => ({ ...section, position }));
}

export default function P4R1ImportManuscript({
  localReview,
  onCancel,
  onComplete,
}: P4R1ImportManuscriptProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ImportPhase>('source');
  const [busy, setBusy] = useState<Busy>(null);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [filename, setFilename] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sourceArrivalId, setSourceArrivalId] = useState<string | null>(null);
  const [sections, setSections] = useState<ImportSection[]>([]);
  const [splitOpen, setSplitOpen] = useState<number | null>(null);

  const textStats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words, characters: text.length };
  }, [text]);

  const readFile = async (file: File) => {
    setError(null);
    setWarnings([]);
    setSourceArrivalId(null);
    setFilename(file.name);
    if (file.size === 0) {
      setError('That file is empty.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`That file is ${fileSize(file.size)}. The review limit is ${fileSize(MAX_UPLOAD_BYTES)}.`);
      return;
    }

    setBusy('reading');
    try {
      const form = new FormData();
      form.append('file', file);
      const endpoint = localReview
        ? '/api/writers-studio/local-review/import'
        : '/api/sovereign/manuscripts/ingest';
      const response = await apiFetch(endpoint, { method: 'POST', body: form });
      const body = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok) {
        if (response.status === 423) {
          setError('Original-file import is still held for member accounts. Paste import remains available while custody and recovery acceptance are completed.');
        } else {
          setError(errorFrom(body, 'We could not read that file.'));
        }
        return;
      }
      const extracted = typeof body?.text === 'string' ? body.text : '';
      setText(extracted);
      setFormat(typeof body?.format === 'string' ? body.format : null);
      setWarnings(Array.isArray(body?.warnings)
        ? body!.warnings.filter((item): item is string => typeof item === 'string')
        : []);
      setSourceArrivalId(typeof body?.sourceArrivalId === 'string' ? body.sourceArrivalId : null);
      if (!title.trim() && typeof body?.title === 'string') setTitle(body.title);
      if (!extracted.trim()) {
        setError('No editable text was found. A scanned PDF needs a text layer or an original Word/text file.');
      }
    } catch {
      setError('The file could not be read in this review session.');
    } finally {
      setBusy(null);
    }
  };

  const previewStructure = async () => {
    if (!title.trim() || !text.trim() || busy) return;
    setError(null);
    setBusy('previewing');
    try {
      const response = await apiFetch('/api/sovereign/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), text }),
      });
      const body = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok) throw new Error(errorFrom(body, 'The structure preview could not be created.'));
      if (body?.lossless === false) {
        setError('The preview could not account for every character, so nothing has moved forward.');
        return;
      }
      const next = Array.isArray(body?.preview)
        ? body!.preview.filter((item): item is ImportSection => Boolean(
            item && typeof item === 'object' && typeof (item as ImportSection).body === 'string',
          ))
        : [];
      if (!next.length) {
        setError('No non-empty writing was found to preview.');
        return;
      }
      setSections(renumber(next));
      setPhase('structure');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The structure preview could not be created.');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!sections.length || busy) return;
    setError(null);
    setBusy('saving');
    try {
      const response = await apiFetch('/api/sovereign/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          sections,
          ...(sourceArrivalId && !localReview
            ? { sourceArrivalId }
            : { confirmedText: text }),
        }),
      });
      const body = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok) throw new Error(errorFrom(body, 'The manuscript could not be opened.'));
      const id = typeof body?.id === 'string' ? body.id : null;
      if (!id) throw new Error('The manuscript opened without an identity. Nothing further was changed.');
      if (localReview) {
        const held = writeLocalReviewManuscript({
          manuscriptId: id,
          title: title.trim(),
          author: null,
          sections,
        });
        if (!held) {
          throw new Error('The temporary local manuscript could not be held for the next room. Nothing was persisted.');
        }
      }
      onComplete(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The manuscript could not be opened.');
    } finally {
      setBusy(null);
    }
  };

  const mergeUp = (index: number) => {
    if (index <= 0) return;
    setSections((current) => {
      const next = [...current];
      const section = next[index]!;
      const restoredHeading = section.heading ? `${section.heading}\n` : '';
      next[index - 1] = {
        ...next[index - 1]!,
        body: `${next[index - 1]!.body}\n\n${restoredHeading}${section.body}`,
      };
      next.splice(index, 1);
      return renumber(next);
    });
    setSplitOpen(null);
  };

  const splitAt = (sectionIndex: number, lineIndex: number) => {
    setSections((current) => {
      const section = current[sectionIndex];
      if (!section) return current;
      const lines = section.body.split('\n');
      const heading = lines[lineIndex]?.trim() ?? '';
      const before = lines.slice(0, lineIndex).join('\n');
      const after = lines.slice(lineIndex + 1).join('\n');
      if (!heading || !before.trim() || !after.trim()) return current;
      const next = [...current];
      next.splice(sectionIndex, 1,
        { ...section, body: before },
        {
          position: sectionIndex + 1,
          heading,
          body: after,
          headingDepth: null,
          headingSignal: 'member',
        });
      return renumber(next);
    });
    setSplitOpen(null);
  };

  const dropped = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  return (
    <main className="p4r1-import" data-writer-import data-local-review={localReview ? 'true' : 'false'}>
      <header className="p4r1-import-head">
        <button type="button" className="p4r1-import-back" onClick={onCancel}>← Home</button>
        <div>
          <p className="p4r1-eyebrow">Bring a manuscript</p>
          <h1>Your words first. Structure stays yours.</h1>
          <p>
            {localReview
              ? 'Bring a PDF, EPUB, Word document, Markdown or plain-text manuscript. You will see the extracted words and confirm every proposed section before anything becomes a manuscript.'
              : 'Paste writing you already have and confirm every proposed section before anything becomes a manuscript. PDF and EPUB file import is in founder-local review while protected Source custody remains held.'}
          </p>
        </div>
        {localReview ? <span className="p4r1-import-local">Local review · not retained</span> : null}
      </header>

      <ol className="p4r1-import-steps" aria-label="Import progress">
        <li data-active={phase === 'source' ? 'true' : undefined}><b>1</b><span>Source</span></li>
        <li data-active={phase === 'structure' ? 'true' : undefined}><b>2</b><span>Structure</span></li>
        <li><b>3</b><span>Open in Write</span></li>
      </ol>

      {phase === 'source' ? (
        <section className="p4r1-import-source">
          {localReview ? (
            <>
              <div
                className="p4r1-import-drop"
                data-dragging={dragging ? 'true' : undefined}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={dropped}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) void readFile(file);
                    event.currentTarget.value = '';
                  }}
                />
                <span className="p4r1-import-glyph" aria-hidden="true">⇧</span>
                <div>
                  <b>{busy === 'reading' ? 'Reading the manuscript…' : 'Choose a manuscript or drop it here'}</b>
                  <span>PDF · EPUB · DOCX · TXT · Markdown · up to 25 MB</span>
                </div>
                <button type="button" disabled={busy !== null} onClick={() => inputRef.current?.click()}>
                  Choose file
                </button>
              </div>

              {filename ? (
                <div className="p4r1-import-file" role="status">
                  <span>{filename}</span>
                  <span>{format ? format.toUpperCase() : 'FILE'} · {textStats.words.toLocaleString()} words</span>
                </div>
              ) : null}
              <div className="p4r1-import-or"><span>or paste writing</span></div>
            </>
          ) : (
            <div className="p4r1-import-held" role="note">
              <b>File import is in founder-local review.</b>
              <p>PDF, EPUB and Word files are not accepted from member accounts yet. Paste your writing below; nothing is sent until you review its proposed structure.</p>
            </div>
          )}

          <label className="p4r1-import-field">
            <span>Manuscript title</span>
            <input value={title} onChange={(event) => setTitle(event.currentTarget.value)}
              placeholder="Title of the Work" />
          </label>
          <label className="p4r1-import-field">
            <span>Extracted or pasted writing</span>
            <textarea value={text} onChange={(event) => {
              setText(event.currentTarget.value);
              if (!filename) setSourceArrivalId(null);
            }} rows={13} placeholder="Paste your manuscript here…" />
            <small>{textStats.characters.toLocaleString()} characters · {textStats.words.toLocaleString()} words</small>
          </label>

          {warnings.length ? (
            <div className="p4r1-import-notices" role="note">
              {warnings.map((warning, index) => <p key={index}>{warning}</p>)}
            </div>
          ) : null}
          {error ? <p className="p4r1-import-error" role="alert">{error}</p> : null}

          <footer className="p4r1-import-actions">
            <p>
              {localReview
                ? 'This review session keeps the file and extracted manuscript in memory only. Closing the dedicated window clears it.'
                : 'The original file remains separate from the editable Working Draft. Nothing is interpreted or rewritten by MAIA during import.'}
            </p>
            <button type="button" className="p4r1-import-primary" disabled={busy !== null || !title.trim() || !text.trim()}
              onClick={() => void previewStructure()}>
              {busy === 'previewing' ? 'Preparing structure…' : 'Review structure'}
            </button>
          </footer>
        </section>
      ) : (
        <section className="p4r1-import-structure">
          <div className="p4r1-import-structure-head">
            <div>
              <p className="p4r1-eyebrow">Author confirmation</p>
              <h2>{sections.length} proposed section{sections.length === 1 ? '' : 's'}</h2>
              <p>Edit a heading, merge a false boundary, or cut where a heading was missed. No cut is accepted without your final gesture.</p>
            </div>
            <button type="button" onClick={() => { setPhase('source'); setSplitOpen(null); }}>Back to source</button>
          </div>

          <div className="p4r1-import-section-list">
            {sections.map((section, index) => (
              <article key={`${index}:${section.heading ?? ''}`} className="p4r1-import-section">
                <div className="p4r1-import-section-row" style={{ paddingLeft: section.headingDepth ? (section.headingDepth - 1) * 14 : 0 }}>
                  <span className="p4r1-import-section-number">{index + 1}</span>
                  {section.headingDepth ? <span className="p4r1-import-depth">H{section.headingDepth}</span> : null}
                  <input
                    aria-label={`Section ${index + 1} heading`}
                    value={section.heading ?? ''}
                    placeholder="Untitled section"
                    onChange={(event) => {
                      const nextHeading = event.currentTarget.value;
                      setSections((current) => current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, heading: nextHeading || null } : item,
                      ));
                    }}
                  />
                  <span>{section.body.length.toLocaleString()} chars</span>
                  <button type="button" aria-expanded={splitOpen === index}
                    onClick={() => setSplitOpen((open) => open === index ? null : index)}>
                    {splitOpen === index ? 'Close cuts' : 'Add cut'}
                  </button>
                  {index > 0 ? <button type="button" onClick={() => mergeUp(index)}>Merge ↑</button> : null}
                </div>
                <p className="p4r1-import-excerpt">{section.body.slice(0, 230)}{section.body.length > 230 ? '…' : ''}</p>
                {splitOpen === index ? (
                  <div className="p4r1-import-cut-list">
                    <p>Choose the authored line that should become the next section heading.</p>
                    {section.body.split('\n').map((line, lineIndex, lines) => {
                      const label = line.trim();
                      if (!label) return null;
                      const valid = Boolean(
                        lines.slice(0, lineIndex).join('').trim()
                        && lines.slice(lineIndex + 1).join('').trim(),
                      );
                      return (
                        <button key={lineIndex} type="button" disabled={!valid}
                          onClick={() => splitAt(index, lineIndex)}>{label}</button>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {error ? <p className="p4r1-import-error" role="alert">{error}</p> : null}
          <footer className="p4r1-import-actions">
            <p>
              {localReview
                ? 'Open in Write creates a temporary fictional manuscript for this dedicated review window.'
                : 'Open in Write saves only the sections you confirm. The original remains separately held as Source.'}
            </p>
            <button type="button" className="p4r1-import-primary" disabled={busy !== null || !sections.length}
              onClick={() => void save()}>
              {busy === 'saving' ? 'Opening manuscript…' : 'Confirm and open in Write'}
            </button>
          </footer>
        </section>
      )}
    </main>
  );
}

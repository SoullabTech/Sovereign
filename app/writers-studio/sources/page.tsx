'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { useLivingWorks, type LivingWork } from '../useLivingWorks';
import { useStudioSources, type StudioSource } from '../useStudioSources';

interface SourceDetail extends StudioSource {
  transcriptionDraft: string | null;
  transcriptionReviewed: string | null;
}

const ACCEPT = '.txt,.md,.markdown,.docx,.pdf,.jpg,.jpeg,.png,.heic,.heif,.tif,.tiff,.webp';

function SourceCard({ source, works, onChanged }: { source: StudioSource; works: LivingWork[]; onChanged: () => void }) {
  const [detail, setDetail] = useState<SourceDetail | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [workId, setWorkId] = useState(() => (works.length === 1 ? works[0].id : ''));
  const [sentence, setSentence] = useState('');

  const alreadyFeeds = works.filter((w) =>
    w.materials.some((m) => m.materialType === 'source_upload' && m.materialId === source.id),
  );

  const openReview = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/writers-studio/sources/${source.id}`);
      if (!res.ok) throw new Error('read');
      const body = await res.json();
      const next = body.source as SourceDetail;
      setDetail(next);
      setText(next.transcriptionReviewed ?? next.transcriptionDraft ?? '');
    } catch {
      setMessage('Could not open this transcription just now.');
    } finally {
      setBusy(false);
    }
  };

  const acceptReview = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/writers-studio/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text }),
      });
      if (!res.ok) throw new Error('review');
      setMessage('Transcription accepted. The original page is still preserved.');
      setDetail(null);
      onChanged();
    } catch {
      setMessage('Could not save that transcription. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const bringToWork = async () => {
    if (!workId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType: 'source_upload', materialId: source.id, sentence }),
      });
      if (!res.ok) throw new Error('bring');
      setSentence('');
      setMessage('Brought to the Work. It remains source material, not manuscript text.');
      onChanged();
    } catch {
      setMessage('Could not bring that source to the Work just now.');
    } finally {
      setBusy(false);
    }
  };

  const isImage = source.mimeType.startsWith('image/');
  const isPdf = source.mimeType === 'application/pdf' || source.originalName.toLowerCase().endsWith('.pdf');

  return (
    <article className="border p-5" style={{ borderColor: PRESS.ruleSoft }}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5 opacity-55">{isImage ? <ImageIcon size={18} /> : <FileText size={18} />}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] break-words" style={{ fontFamily: SERIF }}>{source.originalName}</h2>
          <p className="text-[12px] opacity-45 mt-1">
            {source.sourceKind.replaceAll('_', ' ')} · {source.transcriptionStatus}
          </p>
        </div>
      </div>

      {source.transcriptionStatus === 'draft' ? (
        <div className="mt-4">
          <button onClick={() => void openReview()} disabled={busy} className="text-[13px] underline underline-offset-4 disabled:opacity-40">
            {busy ? 'Opening…' : 'Review transcription'}
          </button>
        </div>
      ) : source.transcriptionStatus === 'reviewed' ? (
        <div className="mt-4 space-y-3">
          <p className="text-[12.5px] opacity-65 flex items-center gap-2"><CheckCircle2 size={14} /> Reviewed and ready to use.</p>
          {alreadyFeeds.length > 0 ? (
            <p className="text-[12px] opacity-50">Feeds: {alreadyFeeds.map((w) => w.title ?? 'Untitled work').join(', ')}</p>
          ) : works.length > 0 ? (
            <div className="grid gap-2 max-w-xl">
              <select value={workId} onChange={(e) => setWorkId(e.target.value)} className="bg-transparent border px-3 py-2 text-[13px]" style={{ borderColor: PRESS.rule }}>
                <option value="">Choose a Work…</option>
                {works.map((w) => <option key={w.id} value={w.id}>{w.title ?? 'Untitled work'}</option>)}
              </select>
              <textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={2} placeholder="What does this feed? In your words — or leave it unwritten." className="bg-transparent border px-3 py-2 text-[13px] leading-relaxed" style={{ borderColor: PRESS.rule }} />
              <button onClick={() => void bringToWork()} disabled={!workId || busy} className="justify-self-start text-[13px] underline underline-offset-4 disabled:opacity-35">
                Bring this to the Work
              </button>
            </div>
          ) : (
            <p className="text-[12px] opacity-50">Begin a Work first, then you can bring this material into it.</p>
          )}
        </div>
      ) : source.transcriptionStatus === 'error' ? (
        <div className="mt-4">
          <p className="text-[12px] opacity-60 mb-2">Studio could not transcribe this source. The original remains preserved.</p>
          <button onClick={() => void openReview()} disabled={busy} className="text-[13px] underline underline-offset-4 disabled:opacity-40">Enter transcription manually</button>
        </div>
      ) : (
        <p className="mt-4 text-[12px] opacity-50">Reading this source…</p>
      )}

      {detail ? (
        <div className="mt-5 grid lg:grid-cols-2 gap-5">
          <div className="min-h-[320px] border overflow-hidden flex items-center justify-center" style={{ borderColor: PRESS.ruleSoft }}>
            {isImage ? (
              <img src={`/api/writers-studio/sources/${source.id}/file`} alt={`Original ${source.originalName}`} className="max-h-[560px] w-full object-contain" />
            ) : isPdf ? (
              <iframe src={`/api/writers-studio/sources/${source.id}/file`} title={`Original ${source.originalName}`} className="w-full h-[560px]" />
            ) : (
              <a href={`/api/writers-studio/sources/${source.id}/file`} target="_blank" rel="noreferrer" className="text-[13px] underline underline-offset-4">Open original file</a>
            )}
          </div>
          <div>
            <label htmlFor={`transcription-${source.id}`} className="block text-[12px] opacity-55 mb-2">Transcription — correct anything Studio misread.</label>
            <textarea id={`transcription-${source.id}`} value={text} onChange={(e) => setText(e.target.value)} rows={22} className="w-full bg-transparent border p-3 text-[14px] leading-relaxed" style={{ borderColor: PRESS.rule, fontFamily: SERIF }} />
            <div className="flex gap-4 mt-3">
              <button onClick={() => void acceptReview()} disabled={busy} className="text-[13px] underline underline-offset-4 disabled:opacity-40">Accept transcription</button>
              <button onClick={() => setDetail(null)} className="text-[13px] opacity-50 hover:opacity-80">Close</button>
            </div>
          </div>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-[12px] opacity-65">{message}</p> : null}
    </article>
  );
}

export default function WriterSourcesPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { phase, sources, reload } = useStudioSources();
  const { works, reload: reloadWorks } = useLivingWorks();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ordered = useMemo(() => sources, [sources]);

  const uploadFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    setMessage(null);
    try {
      for (const file of Array.from(list)) {
        setMessage(`Bringing in ${file.name}…`);
        const form = new FormData();
        form.append('file', file);
        const res = await apiFetch('/api/writers-studio/sources', { method: 'POST', body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Could not bring in ${file.name}`);
        }
      }
      setMessage('Source material received. Review any transcription marked draft.');
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not bring that material in.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const changed = async () => {
    await Promise.all([reload(), reloadWorks()]);
  };

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 md:py-14" style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/writers-studio" className="text-[12px] opacity-50 hover:opacity-80">← Studio Home</Link>
        <div className="mt-8 mb-10 max-w-2xl">
          <h1 className="text-[34px] md:text-[42px] leading-tight">Bring source material</h1>
          <p className="mt-4 text-[15px] leading-relaxed opacity-65">
            Notebook pages, scans, notes, drafts, and reference material can live beside a Work without becoming the manuscript. Handwritten and scanned pages are transcribed locally, then wait for your review.
          </p>
        </div>

        <section className="border border-dashed p-6 mb-10" style={{ borderColor: PRESS.rule }}>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 text-[14px] disabled:opacity-40">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Bringing material in…' : 'Choose files or photographed pages'}
          </button>
          <input ref={inputRef} type="file" multiple accept={ACCEPT} onChange={(e) => void uploadFiles(e.target.files)} className="hidden" />
          <p className="text-[11.5px] opacity-40 mt-2">.docx · .pdf · .txt · .md · JPG/PNG/HEIC/TIFF/WebP · up to 50 MB each</p>
          {message ? <p className="text-[12.5px] mt-3 opacity-65">{message}</p> : null}
        </section>

        {phase === 'loading' ? <p className="text-[13px] opacity-45">Opening your sources…</p> : null}
        {phase === 'error' ? <p className="text-[13px] opacity-60">Studio could not read your source material just now.</p> : null}
        {phase === 'ready' && ordered.length === 0 ? <p className="text-[14px] opacity-55">Nothing has been brought in yet.</p> : null}
        <div className="grid gap-4">
          {ordered.map((source) => <SourceCard key={source.id} source={source} works={works} onChanged={() => void changed()} />)}
        </div>
      </div>
    </main>
  );
}

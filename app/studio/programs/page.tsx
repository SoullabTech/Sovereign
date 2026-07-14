'use client';

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMS — build courses, workshops, and trainings as simple outlines.
//
// A program is a titled outline of steps. Each step can carry a lesson:
// attached materials (only RATIFIED ones ever reach MAIA), a practice, a
// reflection prompt. Every save appends an immutable revision — nothing the
// practitioner changes erases what came before.
//
// What this page deliberately does NOT show: members, enrollments, positions,
// progress. That jurisdiction does not exist here (catalog spec §8) — the
// member's side of a program is theirs alone.
//
// Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
// Studio dark classes are UNCONDITIONAL. YPO-grade copy: function words lead.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { DoorOpen, ShieldCheck, Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Lesson {
  focal_point: string;
  purpose: string | null;
  material_ids: string[];
  practice: string | null;
  reflection_prompt: string | null;
}
interface Program {
  program_slug: string;
  kind: string;
  title: string;
  focal_points: string[];
  current_focal_point: string | null;
  lessons: Lesson[];
}
interface Material {
  id: string;
  title: string;
  review_status: string;
}

const KINDS = ['course', 'workshop', 'training', 'coaching', 'retreat'] as const;

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60';
const textareaCls = inputCls + ' resize-y';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newKind, setNewKind] = useState<string>('course');

  const load = useCallback(async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        apiFetch('/api/practitioner/programs'),
        apiFetch('/api/practitioner/materials'),
      ]);
      const pData = await pRes.json().catch(() => ({}));
      const mData = await mRes.json().catch(() => ({}));
      if (!pRes.ok) throw new Error(pData.error || 'Could not open your programs.');
      setPrograms(pData.programs ?? []);
      setMaterials(mData.materials ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = useCallback(async (fn: () => Promise<Response>, okNotice?: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not complete that.');
      if (okNotice) setNotice(okNotice);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [load]);

  const create = () =>
    act(
      () => apiFetch('/api/practitioner/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, kind: newKind }),
      }),
      'Program created — add its steps below.',
    ).then(() => setNewTitle(''));

  if (programs === null && !error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <DoorOpen className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-semibold">Programs</h1>
        </div>
        <p className="text-neutral-400 mb-6">
          Build your courses, workshops, and trainings as simple outlines: name the
          steps, attach materials, offer a practice. Arranging a clear outline —
          nothing more complicated than that.
        </p>

        <div className="flex gap-3 items-start bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-300">
            Every save is kept — <span className="text-neutral-100 font-medium">nothing you change erases what came before</span>.
            Who walks a program, and where they stand in it, stays theirs: this page holds your
            authoring only, never member activity.
          </p>
        </div>

        {/* ── Create ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200 mb-3">
            <Plus className="w-4 h-4 text-amber-400" /> Create a program
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input className={inputCls} placeholder="Title — e.g. Flourishing Foundations" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <select className={inputCls + ' sm:w-40'} value={newKind} onChange={(e) => setNewKind(e.target.value)}>
              {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <button
              onClick={create}
              disabled={busy || !newTitle.trim()}
              className="shrink-0 rounded-lg border border-amber-500/50 text-amber-300 px-4 py-2 text-sm hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        {error && <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>}
        {notice && (
          <p className="flex items-center gap-2 text-emerald-300 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" /> {notice}
          </p>
        )}

        {programs !== null && programs.length === 0 && (
          <p className="text-neutral-500 text-sm">
            No programs yet. Create your first one above — a title and a handful of steps is a complete start.
          </p>
        )}

        <div className="space-y-6">
          {(programs ?? []).map((p) => (
            <ProgramCard key={p.program_slug} program={p} materials={materials} busy={busy} act={act} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  materials,
  busy,
  act,
}: {
  program: Program;
  materials: Material[];
  busy: boolean;
  act: (fn: () => Promise<Response>, okNotice?: string) => Promise<void>;
}) {
  const [outline, setOutline] = useState(program.focal_points.join('\n'));
  const [openStep, setOpenStep] = useState<string | null>(null);

  const saveOutline = () =>
    act(
      () => apiFetch(`/api/practitioner/programs/${program.program_slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focalPoints: outline.split('\n').map((s) => s.trim()).filter(Boolean) }),
      }),
      'Outline saved.',
    );

  const setCurrent = (step: string) =>
    act(
      () => apiFetch(`/api/practitioner/programs/${program.program_slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentFocalPoint: step }),
      }),
      `Cohort focus set: ${step}.`,
    );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex flex-wrap items-baseline gap-3 mb-4">
        <h2 className="text-lg font-medium text-neutral-100">{program.title}</h2>
        <span className="text-neutral-500 text-xs uppercase tracking-wider">{program.kind}</span>
        {program.current_focal_point && (
          <span className="text-amber-300/80 text-xs">current focus: {program.current_focal_point}</span>
        )}
      </div>

      {/* Steps — one per line, like writing an outline */}
      <label className="block text-sm text-neutral-300 mb-1.5">Steps — one per line, in order</label>
      <textarea
        className={textareaCls}
        rows={Math.max(3, program.focal_points.length + 1)}
        value={outline}
        onChange={(e) => setOutline(e.target.value)}
        placeholder={'Arriving\nWhat matters now\nOne practice to live'}
      />
      <div className="mt-2 mb-4">
        <button
          onClick={saveOutline}
          disabled={busy}
          className="text-xs rounded-lg border border-amber-500/50 text-amber-300 px-3 py-1.5 hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
        >
          Save outline
        </button>
      </div>

      {program.focal_points.length > 0 && (
        <div className="border-t border-neutral-800 pt-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Each step — open it to attach materials and a practice</p>
          {program.focal_points.map((step) => {
            const lesson = program.lessons.find((l) => l.focal_point === step) ?? null;
            const open = openStep === step;
            return (
              <div key={step} className="border border-neutral-800 rounded-lg">
                <div className="flex items-center gap-3 px-3 py-2">
                  <button
                    onClick={() => setOpenStep(open ? null : step)}
                    className="text-sm text-neutral-200 hover:text-amber-300 transition-colors text-left flex-1"
                  >
                    {step}
                    {lesson && <span className="text-neutral-500 text-xs ml-2">· lesson attached</span>}
                  </button>
                  <button
                    onClick={() => setCurrent(step)}
                    disabled={busy || program.current_focal_point === step}
                    className="text-[11px] rounded border border-neutral-700 text-neutral-400 px-2 py-1 hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                    title="Where your cohort currently is — members still locate themselves"
                  >
                    {program.current_focal_point === step ? 'current focus' : 'Set as current'}
                  </button>
                </div>
                {open && (
                  <LessonEditor
                    programSlug={program.program_slug}
                    step={step}
                    lesson={lesson}
                    materials={materials}
                    busy={busy}
                    act={act}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LessonEditor({
  programSlug,
  step,
  lesson,
  materials,
  busy,
  act,
}: {
  programSlug: string;
  step: string;
  lesson: Lesson | null;
  materials: Material[];
  busy: boolean;
  act: (fn: () => Promise<Response>, okNotice?: string) => Promise<void>;
}) {
  const [purpose, setPurpose] = useState(lesson?.purpose ?? '');
  const [practice, setPractice] = useState(lesson?.practice ?? '');
  const [reflection, setReflection] = useState(lesson?.reflection_prompt ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(lesson?.material_ids ?? []));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = () =>
    act(
      () => apiFetch(`/api/practitioner/programs/${programSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focalPoint: step,
          purpose,
          practice,
          reflectionPrompt: reflection,
          materialIds: Array.from(selected),
        }),
      }),
      `Step saved: ${step}.`,
    );

  const active = materials.filter((m) => m.review_status !== 'archived');

  return (
    <div className="border-t border-neutral-800 px-3 py-3 space-y-3">
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Purpose — what this step is for, in plain words</label>
        <input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Landing: naming what actually matters right now" />
      </div>

      <div>
        <label className="block text-xs text-neutral-400 mb-1">
          Materials for this step {active.length === 0 && <span className="text-neutral-600">— add some in Materials first</span>}
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {active.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} className="accent-amber-500" />
              <span>{m.title}</span>
              {m.review_status !== 'ratified' && (
                <span className="text-neutral-600 text-[11px]">not ratified — won&apos;t reach MAIA until it is</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-neutral-400 mb-1">Practice — something to actually live between sessions</label>
        <textarea className={textareaCls} rows={2} value={practice} onChange={(e) => setPractice(e.target.value)} placeholder="e.g. Once a day, pause and name one thing that is going right" />
      </div>

      <div>
        <label className="block text-xs text-neutral-400 mb-1">Reflection prompt — a question this step offers</label>
        <input className={inputCls} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="e.g. Where did you notice ease this week?" />
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="text-xs rounded-lg border border-amber-500/50 text-amber-300 px-3 py-1.5 hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
      >
        Save step
      </button>
    </div>
  );
}

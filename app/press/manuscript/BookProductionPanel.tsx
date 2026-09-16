'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  PUBLICATION_MATTER_ROLES,
  type PublicationMatterRole,
} from '@/lib/manuscript/publicationPlan/roles';

const ACCENT = '#C9A227';
const RULE = '#4A4238';

interface WorkspaceSection {
  id: string;
  position: number;
  heading: string | null;
  preview: string;
  assignedRole: PublicationMatterRole | null;
  effectiveRole: string;
  frontMatter: boolean;
}

interface WorkspaceIssue {
  code: string;
  severity: 'blocker';
  sectionIndexes: number[];
  sectionIds: string[];
  message: string;
}
interface WorkspaceReady {
  status: 'ok';
  availability: 'ready';
  draftVersion: number;
  totalChars: number;
  sectionCount: number;
  bodyStartPosition: number | null;
  sections: WorkspaceSection[];
  placements: Array<{ role: PublicationMatterRole; sectionIds: string[] }>;
  issues: WorkspaceIssue[];
}

interface WorkspaceUnavailable {
  status: 'ok';
  availability: 'section_aware_draft_required';
  draftVersion: number | null;
  totalChars: 0;
  sectionCount: 0;
  bodyStartPosition: null;
  sections: [];
  placements: [];
  issues: [];
}

type Workspace = WorkspaceReady | WorkspaceUnavailable;
type Format = 'pdf' | 'epub';
type Stage = 'proof' | 'final';

const roleLabel = (role: PublicationMatterRole): string =>
  role === 'omit' ? 'Omit from book'
    : role.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
const selectionIsContiguous = (ids: string[], sections: WorkspaceSection[]): boolean => {
  if (ids.length < 2) return true;
  const selected = sections
    .filter((section) => ids.includes(section.id))
    .map((section) => section.position)
    .sort((a, b) => a - b);
  return selected.every((position, index) => index === 0 || position === selected[index - 1]! + 1);
};

export default function BookProductionPanel({
  manuscriptId,
  title,
}: {
  manuscriptId: string;
  title: string;
}) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [role, setRole] = useState<PublicationMatterRole>('title-page');
  const [roleBusy, setRoleBusy] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [rendering, setRendering] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setWorkspaceError(null);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/publication-plan`, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setWorkspace(await res.json() as Workspace);
    } catch {
      setWorkspace(null);
      setWorkspaceError('Book production details could not be reached just now. Your manuscript was not changed.');
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  useEffect(() => {
    setSelected([]);
    void loadWorkspace();
  }, [loadWorkspace]);

  const ready = workspace?.availability === 'ready' ? workspace : null;
  const frontMatter = useMemo(
    () => ready?.sections.filter((section) => section.frontMatter) ?? [],
    [ready],
  );
  const finalReady = Boolean(ready && ready.issues.length === 0);
  const contiguous = ready ? selectionIsContiguous(selected, ready.sections) : true;

  const toggleSection = (id: string) => {
    setRoleError(null);
    setSelected((current) => current.includes(id)
      ? current.filter((sectionId) => sectionId !== id)
      : [...current, id]);
  };

  const assignRole = async () => {
    if (!ready || selected.length === 0 || !contiguous) return;
    setRoleBusy(true);
    setRoleError(null);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/publication-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, sectionIds: selected }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { refusal?: string } | null;
        const message = body?.refusal === 'non_contiguous'
          ? 'Choose neighboring sections when one publication object spans more than one section.'
          : body?.refusal === 'section_already_assigned'
            ? 'One of those sections already belongs to another publication object. Clear that role first.'
            : body?.refusal === 'section_not_current'
              ? 'The manuscript changed while you were deciding. The production view has been refreshed.'
              : 'That publication role could not be assigned. Nothing was changed.';
        setRoleError(message);
        if (body?.refusal === 'section_not_current') await loadWorkspace();
        return;
      }
      setSelected([]);
      await loadWorkspace();
    } catch {
      setRoleError('That publication role could not be assigned just now. Nothing was changed.');
    } finally {
      setRoleBusy(false);
    }
  };

  const clearRole = async (clear: PublicationMatterRole) => {
    setRoleBusy(true);
    setRoleError(null);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/publication-plan`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: clear }),
      });
      if (!res.ok) {
        setRoleError('That publication role could not be cleared. Nothing was changed.');
        return;
      }
      setSelected([]);
      await loadWorkspace();
    } catch {
      setRoleError('That publication role could not be cleared just now. Nothing was changed.');
    } finally {
      setRoleBusy(false);
    }
  };

  const renderBook = async (format: Format, stage: Stage) => {
    if (stage === 'final' && !finalReady) return;
    setRenderError(null);
    setRendering(`${stage}:${format}`);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, stage }),
      });
      if (!res.ok) {
        if (res.status === 409 && stage === 'final') {
          setRenderError('Final is not available yet. The production decisions above need attention first.');
          await loadWorkspace();
        } else {
          setRenderError('Could not make your book just now. Please try again in a moment.');
        }
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = stage === 'proof' ? '-proof' : '';
      a.download = `${title || 'manuscript'}${suffix}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setRenderError('Could not make your book just now. Please try again in a moment.');
    } finally {
      setRendering(null);
    }
  };

  const bookChars = ready?.totalChars ?? 0;
  const bookSectionCount = ready?.sectionCount ?? 0;
  const pageEstimate = Math.max(1, Math.round(bookChars / 1800));
  const sectionById = new Map(ready?.sections.map((section) => [section.id, section]) ?? []);

  return (
    <div data-book-production-panel>
      <p className="text-[14px] opacity-70 mb-3 leading-relaxed">
        Your manuscript, set as a book — your words, your structure, and your publication decisions.
      </p>
      <p className="text-[12px] opacity-50 mb-8">
        {ready ? `${pageEstimate} pages · ${bookSectionCount} section${bookSectionCount === 1 ? '' : 's'}. ` : ''}A Proof is for inspection; Final is available only when the book passes production preflight.
      </p>

      {loading ? <p className="text-[13px] opacity-45 mb-8">Reading the book’s production state…</p> : null}
      {workspaceError ? <p className="text-[13px] opacity-70 mb-8">{workspaceError}</p> : null}

      {workspace?.availability === 'section_aware_draft_required' ? (
        <div className="border-y py-5 mb-8" style={{ borderColor: RULE }}>
          <p className="text-[15px] mb-2">Final production needs the current section-aware writing copy.</p>
          <p className="text-[13px] opacity-55 leading-relaxed">
            You can still make a Proof. Publication roles will become assignable here once the current draft has stable section identities.
          </p>
        </div>
      ) : null}
      {ready ? (
        <>
          <div className="border-y py-5 mb-8" style={{ borderColor: RULE }}>
            <p className="text-[10.5px] tracking-[0.28em] uppercase opacity-45 mb-2">Book readiness</p>
            {finalReady ? (
              <p className="text-[18px]">Ready for Final.</p>
            ) : (
              <p className="text-[18px]">{ready.issues.length} production decision{ready.issues.length === 1 ? '' : 's'} remain.</p>
            )}
            {!finalReady ? (
              <ul className="mt-4 space-y-3">
                {ready.issues.map((issue) => {
                  const names = issue.sectionIds
                    .map((id) => sectionById.get(id))
                    .filter((section): section is WorkspaceSection => Boolean(section))
                    .map((section) => section.heading ?? `Section ${section.position + 1}`);
                  return (
                    <li key={`${issue.code}:${issue.sectionIds.join(',')}`} className="text-[13px] leading-relaxed opacity-65">
                      {issue.message}{names.length > 0 ? ` — ${names.join(' · ')}` : ''}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {ready.placements.length > 0 ? (
            <section className="mb-8">
              <p className="text-[10.5px] tracking-[0.28em] uppercase opacity-45 mb-3">Current production plan</p>
              <div className="space-y-2">
                {ready.placements.map((placement) => (
                  <div key={placement.role} className="flex items-center justify-between gap-4 border-b pb-2" style={{ borderColor: RULE }}>
                    <div>
                      <span className="text-[14px]">{roleLabel(placement.role)}</span>
                      <span className="text-[12px] opacity-45 ml-3">
                        {placement.sectionIds.length} section{placement.sectionIds.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void clearRole(placement.role)}
                      disabled={roleBusy}
                      className="text-[12px] underline underline-offset-4 opacity-55 hover:opacity-100 disabled:opacity-25"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <details open className="mb-10" data-front-matter-plan>
            <summary className="cursor-pointer text-[14px] mb-4 select-none">
              Front matter · {frontMatter.length} section{frontMatter.length === 1 ? '' : 's'}
            </summary>
            <p className="text-[12.5px] opacity-55 leading-relaxed mb-4 max-w-2xl">
              Select one section, or neighboring sections that together form one publication object. Assigning a role changes production meaning only; it does not rewrite the manuscript.
            </p>

            <div className="flex flex-wrap items-end gap-3 mb-4">
              <label className="text-[12px] opacity-70">
                <span className="block mb-1">What is this?</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as PublicationMatterRole)}
                  className="bg-transparent border px-3 py-2 min-h-[42px] text-[13px]"
                  style={{ borderColor: RULE }}
                >
                  {PUBLICATION_MATTER_ROLES.map((option) => (
                    <option key={option} value={option} style={{ color: '#1A1513' }}>{roleLabel(option)}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void assignRole()}
                disabled={roleBusy || selected.length === 0 || !contiguous}
                className="px-5 py-2 min-h-[42px] text-[13px] disabled:opacity-30"
                style={{ background: ACCENT, color: '#1A1513' }}
              >
                {roleBusy ? 'Saving…' : `Assign ${roleLabel(role)}`}
              </button>
              <span className="text-[12px] opacity-45 pb-2">{selected.length} selected</span>
            </div>
            {!contiguous ? (
              <p className="text-[12.5px] opacity-65 mb-3">
                Choose neighboring sections when one publication object spans more than one section.
              </p>
            ) : null}
            {roleError ? <p className="text-[12.5px] opacity-70 mb-3">{roleError}</p> : null}

            <div
              className="max-h-[520px] overflow-y-auto overscroll-contain border-y"
              style={{ borderColor: RULE }}
              data-front-matter-scroll
            >
              {frontMatter.map((section) => {
                const assigned = section.assignedRole;
                return (
                  <label
                    key={section.id}
                    className="flex gap-3 py-4 border-b cursor-pointer"
                    style={{ borderColor: RULE }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      disabled={Boolean(assigned) || roleBusy}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[12px] opacity-35">{section.position + 1}</span>
                        <span className="text-[15px]">{section.heading ?? 'Untitled section'}</span>
                        {assigned ? (
                          <span className="text-[11px] tracking-wide uppercase" style={{ color: ACCENT }}>
                            {roleLabel(assigned)}
                          </span>
                        ) : null}
                      </span>
                      {section.preview ? (
                        <span className="block text-[12.5px] leading-relaxed opacity-50 mt-1">
                          {section.preview}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </details>
        </>
      ) : null}

      <section className="mb-8">
        <p className="text-[10.5px] tracking-[0.28em] uppercase opacity-45 mb-3">Proof</p>
        <p className="text-[13px] opacity-55 mb-4 max-w-2xl">
          For inspection. A Proof may contain unresolved production decisions and is labeled as a proof in its provenance.
        </p>
        <div className="flex flex-wrap gap-3">
          {(['pdf', 'epub'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => void renderBook(format, 'proof')}
              disabled={rendering !== null || !ready || bookSectionCount === 0}
              className="px-6 py-2.5 border text-[13px] tracking-wide disabled:opacity-30"
              style={{ borderColor: RULE }}
            >
              {rendering === `proof:${format}`
                ? 'Setting proof…'
                : `Download Proof ${format.toUpperCase()}`}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10.5px] tracking-[0.28em] uppercase opacity-45 mb-3">Final</p>
        <p className="text-[13px] opacity-55 mb-4 max-w-2xl">
          Final is available only after the book’s publication matter passes preflight. Nothing is silently repaired to make this button turn on.
        </p>
        <div className="flex flex-wrap gap-3">
          {(['pdf', 'epub'] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => void renderBook(format, 'final')}
              disabled={rendering !== null || !finalReady || bookSectionCount === 0}
              className="px-7 py-2.5 text-[13px] tracking-wide disabled:opacity-25"
              style={{ background: ACCENT, color: '#1A1513' }}
            >
              {rendering === `final:${format}`
                ? 'Setting final…'
                : `Download Final ${format.toUpperCase()}`}
            </button>
          ))}
        </div>
        {!finalReady && ready ? (
          <p className="text-[12px] opacity-45 mt-3">
            Resolve the production decisions above to unlock Final.
          </p>
        ) : null}
      </section>

      {renderError ? <p className="text-[13px] opacity-70 mt-6">{renderError}</p> : null}
    </div>
  );
}

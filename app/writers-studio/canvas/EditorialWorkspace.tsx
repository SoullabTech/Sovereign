'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { GOLD, GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';

export interface EditorialFocus {
  chainId: string;
  versionId: string;
}

interface EditorialVersion {
  id: string;
  author: 'maia' | 'member';
  supersedes: string | null;
  replacementText: string;
  rationale?: string;
  authoredAt: string;
}

interface EditorialWork {
  chainId: string;
  locus: { targetSectionId: string; baseVersion: number; expectedText: string };
  versions: EditorialVersion[];
  focusedVersionId: string | null;
}

type LoadState = 'loading' | 'ready' | 'unavailable';
type ActState = 'idle' | 'saving' | 'authorizing' | 'executing' | 'applied' | 'refused';
export interface EditorialWorkspaceProps {
  focus: EditorialFocus;
  sectionLabel?: string | null;
  comparison?: { current: string; wouldRead: string } | null;
  onSelectVersion: (focus: EditorialFocus) => void;
  onShowChange?: () => void;
  onBeforeAdopt?: () => Promise<boolean>;
  onApplied?: (resultingVersion: number) => Promise<void> | void;
  onKeepOriginal?: () => void;
}

const authorLabel = (author: EditorialVersion['author']) =>
  author === 'maia' ? 'MAIA' : 'You';

const shortTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function EditorialWorkspace({
  focus,
  sectionLabel,
  comparison,
  onSelectVersion,
  onShowChange,
  onBeforeAdopt,
  onApplied,
  onKeepOriginal,
}: EditorialWorkspaceProps) {
  const [load, setLoad] = useState<LoadState>('loading');
  const [work, setWork] = useState<EditorialWork | null>(null);
  const [act, setAct] = useState<ActState>('idle');
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [why, setWhy] = useState('');

  const read = useCallback(async (target: EditorialFocus) => {
    setLoad('loading');
    setNotice(null);
    try {
      const res = await apiFetch(
        `/api/writers-studio/proposal-chains/${encodeURIComponent(target.chainId)}`
        + `?version=${encodeURIComponent(target.versionId)}`,
      );
      if (!res.ok) {
        setWork(null);
        setLoad('unavailable');
        return;
      }
      const data = (await res.json()) as EditorialWork;
      setWork(data);
      setLoad('ready');
    } catch {
      setWork(null);
      setLoad('unavailable');
    }
  }, []);

  useEffect(() => { void read(focus); }, [focus, read]);

  const selected = useMemo(
    () => work?.versions.find((v) => v.id === focus.versionId) ?? null,
    [work, focus.versionId],
  );

  const beginEdit = () => {
    if (!selected) return;
    setDraft(selected.replacementText);
    setWhy('');
    setEditing(true);
    setNotice(null);
  };
  const authorVersion = async () => {
    if (!selected || act !== 'idle') return;
    setAct('saving');
    setNotice(null);
    try {
      const res = await apiFetch(
        `/api/writers-studio/proposal-chains/${encodeURIComponent(focus.chainId)}/versions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supersedes: selected.id,
            replacementText: draft,
            ...(why.trim() ? { rationale: why.trim() } : {}),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.appended || !data?.version?.id) {
        setAct('refused');
        setNotice(data?.reason === 'not_successor_of_head'
          ? 'The thread moved while you were editing. Your wording is still here; review the newest version before adding it.'
          : 'That version could not be added just now. Nothing in the manuscript changed.');
        return;
      }
      const next = { chainId: focus.chainId, versionId: data.version.id };
      setEditing(false);
      setAct('idle');
      onSelectVersion(next);
      await read(next);
    } catch {
      setAct('refused');
      setNotice('That version could not be added just now. Nothing in the manuscript changed.');
    }
  };

  const adopt = async () => {
    if (!selected || act !== 'idle') return;
    setNotice(null);
    if (onBeforeAdopt) {
      const settled = await onBeforeAdopt();
      if (!settled) {
        setAct('refused');
        setNotice('Your latest writing is still saving. Nothing was changed; try again when it settles.');
        return;
      }
    }

    setAct('authorizing');
    try {
      const auth = await apiFetch(
        `/api/writers-studio/proposal-chains/${encodeURIComponent(focus.chainId)}`
        + `/versions/${encodeURIComponent(selected.id)}/authorize`,
        { method: 'POST' },
      );
      const a = await auth.json().catch(() => ({}));
      if (!auth.ok || !a?.authorizationId) {
        setAct('refused');
        setNotice('This version could not be adopted against the Work as it stands. Nothing changed.');
        return;
      }

      setAct('executing');
      const exec = await apiFetch(
        `/api/writers-studio/revision-authorizations/${encodeURIComponent(a.authorizationId)}/execute`,
        { method: 'POST' },
      );
      const e = await exec.json().catch(() => ({}));
      if (!exec.ok || !e?.executed || typeof e?.resultingVersion !== 'number') {
        setAct('refused');
        setNotice('The permission was recorded, but the Work did not change. Review before trying again.');
        return;
      }

      await onApplied?.(e.resultingVersion);
      setAct('applied');
      setNotice('This exact version is now in the manuscript.');
    } catch {
      setAct('refused');
      setNotice('The change could not be completed just now. Review the Work before trying again.');
    }
  };
  if (load === 'loading') {
    return <StudioText role="metadata">opening editorial thread…</StudioText>;
  }
  if (load === 'unavailable' || !work || !selected) {
    return (
      <div style={shell}>
        <StudioText role="navItem">Editorial thread unavailable</StudioText>
        <StudioText role="metadata" tone="quiet" style={{ marginTop: SPACE.snug }}>
          The manuscript is unchanged. This thread could not be read just now.
        </StudioText>
      </div>
    );
  }

  const actionBusy = act === 'saving' || act === 'authorizing' || act === 'executing';
  const suggestionLabel = selected.replacementText.length === 0
    ? 'Remove this passage'
    : selected.author === 'maia' ? 'MAIA’s wording' : 'Your wording';

  return (
    <section aria-label="Editorial workspace" style={shell}>
      <header style={header}>
        <div>
          <StudioText role="metadata" tone="quiet">EDITORIAL THREAD</StudioText>
          <StudioText role="navItem" style={{ marginTop: 4 }}>
            {sectionLabel ?? 'This passage'}
          </StudioText>
        </div>
        <div style={countPill}>{work.versions.length} version{work.versions.length === 1 ? '' : 's'}</div>
      </header>

      <div style={readingBlock}>
        <div style={eyebrowRow}>
          <span style={authorMark}>{authorLabel(selected.author)}</span>
          <StudioText role="metadata" tone="quiet">{shortTime(selected.authoredAt)}</StudioText>
        </div>
        <StudioText role="maiaReading" style={{ marginTop: SPACE.snug }}>
          {suggestionLabel}
        </StudioText>
        {selected.rationale ? (
          <div style={{ marginTop: SPACE.base }}>
            <StudioText role="metadata" tone="quiet">WHY THIS WORDING</StudioText>
            <StudioText role="prose" style={{ marginTop: SPACE.tight }}>
              {selected.rationale}
            </StudioText>
          </div>
        ) : (
          <StudioText role="metadata" tone="quiet" style={{ marginTop: SPACE.base }}>
            No editorial rationale was authored for this version.
          </StudioText>
        )}
      </div>

      {comparison && (
        <div style={comparisonBox}>
          <div style={comparisonColumn}>
            <StudioText role="metadata" tone="quiet">CURRENT</StudioText>
            <StudioText role="prose" style={{ marginTop: SPACE.tight }}>
              {comparison.current}
            </StudioText>
          </div>
          <div style={comparisonColumn}>
            <StudioText role="metadata" tone="quiet">WOULD READ</StudioText>
            <StudioText role="prose" style={{ marginTop: SPACE.tight }}>
              {comparison.wouldRead || '— passage removed —'}
            </StudioText>
          </div>
        </div>
      )}

      <button type="button" onClick={onShowChange} style={textButton}>
        Show in manuscript
      </button>

      <div style={versionRail} aria-label="Proposal versions">
        {work.versions.map((v, i) => {
          const active = v.id === selected.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVersion({ chainId: work.chainId, versionId: v.id })}
              style={{ ...versionCard, ...(active ? versionCardActive : {}) }}
            >
              <span style={versionIndex}>V{i + 1}</span>
              <span style={versionAuthor}>{authorLabel(v.author)}</span>
            </button>
          );
        })}
      </div>

      {editing ? (
        <div style={composerBox}>
          <StudioText role="metadata" tone="quiet">YOUR WORDING</StudioText>
          <textarea
            aria-label="Your proposed wording"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            autoFocus
            style={textarea}
          />
          <input
            aria-label="Why you changed it (optional)"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Why you changed it — optional"
            style={reasonInput}
          />
          <div style={actionRow}>
            <button type="button" onClick={() => setEditing(false)} style={secondaryButton}>
              Cancel
            </button>
            <button type="button" onClick={() => void authorVersion()} disabled={actionBusy} style={primaryButton}>
              {act === 'saving' ? 'Adding…' : 'Add my version'}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={beginEdit} style={editButton}>
          <span>＋</span><span>Edit wording</span>
        </button>
      )}

      {notice && (
        <StudioText role="metadata" style={{ marginTop: SPACE.snug, color: act === 'refused' ? '#C98A72' : INK.secondary }}>
          {notice}
        </StudioText>
      )}
      <footer style={decisionBar}>
        <StudioText role="metadata" tone="quiet" style={{ flex: 1 }}>
          Nothing changes until you explicitly adopt a version.
        </StudioText>
        <div style={actionRow}>
          <button type="button" onClick={onKeepOriginal} disabled={actionBusy} style={secondaryButton}>
            Keep original
          </button>
          <button
            type="button"
            onClick={() => void adopt()}
            disabled={actionBusy || act === 'applied'}
            style={primaryButton}
          >
            {act === 'authorizing' ? 'Preparing…'
              : act === 'executing' ? 'Applying…'
                : act === 'applied' ? 'Adopted' : 'Adopt this version'}
          </button>
        </div>
      </footer>
    </section>
  );
}

const shell: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: SPACE.base,
  minHeight: 0, padding: `${SPACE.snug}px ${SPACE.base}px ${SPACE.base}px`,
};
const header: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  gap: SPACE.base, paddingBottom: SPACE.snug, borderBottom: `1px solid ${RULE.soft}`,
};
const countPill: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.05em', color: INK.quiet,
  border: `1px solid ${RULE.soft}`, borderRadius: 999, padding: '4px 8px',
};
const readingBlock: React.CSSProperties = {
  borderRadius: RADIUS.base, padding: SPACE.base,
  background: GROUND.raised, border: `1px solid ${RULE.soft}`,
};
const eyebrowRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.snug,
};
const authorMark: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', borderRadius: 999,
  padding: '4px 8px', border: `1px solid ${RULE.soft}`,
  fontSize: 10, letterSpacing: '0.12em', color: GOLD.DEFAULT,
};
const comparisonBox: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
  gap: SPACE.snug, padding: SPACE.snug, borderRadius: RADIUS.base,
  border: `1px solid ${RULE.soft}`, background: GROUND.base,
};
const comparisonColumn: React.CSSProperties = {
  minWidth: 0, padding: SPACE.snug, borderRadius: RADIUS.sm,
  background: GROUND.raised,
};
const textButton: React.CSSProperties = {
  alignSelf: 'flex-start', border: 0, background: 'transparent', color: GOLD.DEFAULT,
  padding: 0, cursor: 'pointer', font: 'inherit', textDecoration: 'underline',
  textUnderlineOffset: 4,
};
const versionRail: React.CSSProperties = {
  display: 'flex', gap: SPACE.tight, overflowX: 'auto', paddingBottom: 2,
};
const versionCard: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto',
  minWidth: 100, padding: '9px 11px', borderRadius: RADIUS.sm,
  border: `1px solid ${RULE.soft}`, background: 'transparent', color: INK.secondary,
  cursor: 'pointer', textAlign: 'left',
};
const versionCardActive: React.CSSProperties = {
  borderColor: GOLD.DEFAULT, background: 'rgba(180, 138, 54, 0.08)', color: INK.primary,
};
const versionIndex: React.CSSProperties = {
  fontSize: 10, opacity: 0.65, letterSpacing: '0.08em',
};
const versionAuthor: React.CSSProperties = { fontSize: 12 };
const composerBox: React.CSSProperties = {
  padding: SPACE.base, borderRadius: RADIUS.base,
  border: `1px solid ${RULE.soft}`, background: GROUND.raised,
};
const textarea: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', resize: 'vertical', marginTop: SPACE.snug,
  minHeight: 110, padding: SPACE.snug, borderRadius: RADIUS.sm,
  border: `1px solid ${RULE.soft}`, outline: 'none', background: GROUND.base,
  color: INK.primary, font: 'inherit', lineHeight: 1.55,
};
const reasonInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', marginTop: SPACE.tight,
  padding: '9px 10px', borderRadius: RADIUS.sm, border: `1px solid ${RULE.soft}`,
  outline: 'none', background: GROUND.base, color: INK.secondary, font: 'inherit',
};
const actionRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  gap: SPACE.tight, flexWrap: 'wrap', marginTop: SPACE.snug,
};
const editButton: React.CSSProperties = {
  display: 'flex', gap: 7, alignItems: 'center', justifyContent: 'center',
  width: '100%', padding: '11px 12px', borderRadius: RADIUS.sm,
  border: `1px dashed ${RULE.soft}`, background: 'transparent', color: INK.secondary,
  cursor: 'pointer', font: 'inherit',
};
const secondaryButton: React.CSSProperties = {
  border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
  background: 'transparent', color: INK.secondary, padding: '9px 12px',
  cursor: 'pointer', font: 'inherit',
};
const primaryButton: React.CSSProperties = {
  border: `1px solid ${GOLD.DEFAULT}`, borderRadius: RADIUS.sm,
  background: GOLD.DEFAULT, color: GROUND.base, padding: '9px 13px',
  cursor: 'pointer', font: 'inherit', fontWeight: 600,
};
const decisionBar: React.CSSProperties = {
  marginTop: 'auto', paddingTop: SPACE.base, borderTop: `1px solid ${RULE.soft}`,
  display: 'flex', alignItems: 'center', gap: SPACE.base, flexWrap: 'wrap',
};

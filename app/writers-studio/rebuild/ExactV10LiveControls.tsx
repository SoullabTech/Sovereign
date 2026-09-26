'use client';

import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type {
  A2RelationshipSummary, EligibleCarrySource,
} from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import type { ExactCarryChooser, SelectedExactCarry } from './useExactV10Relationship';

const FACETS: readonly EditorialDepth[] = ['guided', 'learning', 'direct'];
const FACET_LABEL: Record<EditorialDepth, string> = {
  guided: 'Guided',
  learning: 'Learning',
  direct: 'Direct',
};

export function ExactV10FacetMenu({
  current, onChoose, onClose,
}: {
  current: EditorialDepth;
  onChoose: (facet: EditorialDepth) => void;
  onClose: () => void;
}) {
  return (
    <div className="fsw-facet-menu" role="menu" aria-label="How MAIA works with you">
      {FACETS.map((facet) => (
        <button key={facet} type="button" role="menuitemradio"
          aria-checked={facet === current} className="fs-btn"
          onClick={() => { onChoose(facet); onClose(); }}>
          {FACET_LABEL[facet]}
        </button>
      ))}
      <p>Changes how MAIA explains — not what she may read or change.</p>
    </div>
  );
}

const relationshipLabel = (relationship: A2RelationshipSummary): string => {
  const date = Date.parse(relationship.createdAt);
  const when = Number.isFinite(date)
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
    : 'an earlier visit';
  const acts = relationship.episodeCount === 1
    ? '1 Editorial act'
    : `${relationship.episodeCount} Editorial acts`;
  return `Begun ${when} · ${acts}`;
};

export function ExactV10RelationshipControls({
  relationship, choices, busy, message, chooserOpen,
  onToggleChooser, onBegin, onChoose, onLeave,
}: {
  relationship: A2RelationshipSummary | null;
  choices: readonly A2RelationshipSummary[];
  busy: boolean;
  message: string | null;
  chooserOpen: boolean;
  onToggleChooser: () => void;
  onBegin: () => void;
  onChoose: (id: string) => void;
  onLeave: () => void;
}) {
  return (
    <section className="fsw-relationship"
      data-a2-relationship-shell aria-label="Relationship with MAIA">
      <div className="fsw-rel-head">
        <strong>Relationship with MAIA</strong>
        {relationship ? (
          <button type="button" className="fs-goto"
            onClick={onLeave} disabled={busy}>Leave</button>
        ) : null}
      </div>
      {relationship ? (
        <p className="fs-notice">{relationshipLabel(relationship)}</p>
      ) : (
        <div className="fsw-rel-actions">
          {choices.length > 0 ? (
            <button type="button" className="fs-btn"
              onClick={onToggleChooser} disabled={busy}
              aria-expanded={chooserOpen}>Choose a relationship</button>
          ) : null}
          <button type="button" className="fs-btn"
            data-a2-begin-relationship onClick={onBegin} disabled={busy}>
            Begin a relationship
          </button>
        </div>
      )}
      {!relationship && chooserOpen ? (
        <div className="fsw-rel-choices" role="list"
          aria-label="Your MAIA relationships">
          {choices.map((choice) => (
            <button key={choice.id} type="button" className="fs-btn"
              role="listitem" onClick={() => onChoose(choice.id)}
              disabled={busy}>
              {relationshipLabel(choice)}
            </button>
          ))}
        </div>
      ) : null}
      {message ? <p className="fs-notice" role="status">{message}</p> : null}
    </section>
  );
}

export function ExactV10CarryControls({
  relationshipSelected, receiverThreadId, chooser, selected,
  onOpen, onClose, onSelect, onRemove,
}: {
  relationshipSelected: boolean;
  receiverThreadId: string | null;
  chooser: ExactCarryChooser;
  selected: SelectedExactCarry | null;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (source: EligibleCarrySource) => void;
  onRemove: () => void;
}) {
  if (!relationshipSelected || !receiverThreadId) return null;
  return (
    <section className="fsw-carry" aria-label="Earlier MAIA response">
      {selected ? (
        <div className="fsw-carry-selected">
          <div>
            <strong>Earlier MAIA response</strong>
            <p>{selected.excerpt}{selected.excerptTruncated ? '…' : ''}</p>
          </div>
          <button type="button" className="fs-goto"
            onClick={onRemove}>Remove</button>
        </div>
      ) : chooser.kind === 'closed' ? (
        <button type="button" className="fs-goto"
          onClick={onOpen}>Bring an earlier MAIA response</button>
      ) : null}
      {chooser.kind === 'loading' ? (
        <p className="fs-notice" role="status">
          Checking earlier MAIA responses…
        </p>
      ) : null}
      {chooser.kind === 'unavailable' ? (
        <div>
          <p className="fs-notice" role="status">
            Earlier MAIA responses could not be checked just now.
            Nothing has been selected.
          </p>
          <button type="button" className="fs-goto"
            onClick={onClose}>Close</button>
        </div>
      ) : null}
      {chooser.kind === 'ready' ? (
        <div className="fsw-carry-list">
          <div className="fsw-rel-head">
            <strong>Earlier in this relationship</strong>
            <button type="button" className="fs-goto"
              onClick={onClose}>Close</button>
          </div>
          <p className="fs-notice">
            Choose one earlier response from MAIA to bring into this turn.
            Nothing is added unless you choose it.
          </p>
          {chooser.sources.length === 0 ? (
            <p className="fs-notice">
              No earlier MAIA Editorial responses are available to bring into this conversation.
            </p>
          ) : null}
          {chooser.sources.map((source) => (
            <button key={source.sourceEpisodeSequence}
              type="button" className="fsw-carry-card"
              onClick={() => onSelect(source)}>
              <small>
                {source.sourceScope === 'section' ? 'Section' : 'Passage'}
                {' · '}{new Date(source.admittedAt).toLocaleString()}
              </small>
              <span>{source.excerpt}{source.excerptTruncated ? '…' : ''}</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ExactV10EditorialComposer({
  value, busy, tab, onChange, onSend,
}: {
  value: string;
  busy: boolean;
  tab: 'Discuss' | 'Revise';
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <form className="fs-mcompose"
      onSubmit={(event) => { event.preventDefault(); onSend(); }}>
      <textarea className="fs-mtext" rows={3}
        value={value} disabled={busy}
        aria-label={tab === 'Revise'
          ? 'What would you like to revise?'
          : 'Your question about this passage'}
        placeholder={tab === 'Revise'
          ? 'What would you like to preserve, change, or try?'
          : 'Ask MAIA about this passage…'}
        onChange={(event) => onChange(event.target.value)} />
      <button type="submit" className="fs-btn fs-btn--key"
        disabled={busy || value.trim().length === 0}>
        {busy ? 'Working…' : 'Send'}
      </button>
    </form>
  );
}

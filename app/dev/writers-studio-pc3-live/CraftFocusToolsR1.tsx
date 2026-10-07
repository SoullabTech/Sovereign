'use client';

import { useEffect, useMemo, useState } from 'react';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { makeCraftTarget, paragraphTargets, type CraftFocusTarget } from '@/lib/writersStudio/craftFocusR1';

export interface CraftFocusToolsR1Props {
  sections: readonly RebuildSection[];
  bodyOf: (id: string) => string;
  revisionNumber: number;
  current: CraftFocusTarget | null;
  earlier?: readonly CraftFocusTarget[];
  busy: boolean;
  receipt: string | null;
  onMove: (target: CraftFocusTarget) => boolean;
  onStay: () => void;
  onAsk: () => void;
}

/** Focus is a tool on the manuscript, not a second editing room. Selection is
 * only a candidate until Work here is pressed. The controller revalidates it. */
export default function CraftFocusToolsR1(props: CraftFocusToolsR1Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CraftFocusTarget | null>(null);
  const [sectionId, setSectionId] = useState(props.current?.sectionId ?? props.sections[0]?.draftSectionId ?? '');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const targets = useMemo(() => paragraphTargets(props.sections, props.bodyOf, props.revisionNumber),
    [props.sections, props.bodyOf, props.revisionNumber]);
  const choices = targets.filter(t => t.sectionId === sectionId);

  useEffect(() => {
    setSelected(null);
    setSelectionNotice(null);
    if (props.current) setSectionId(props.current.sectionId);
  }, [props.current?.sectionId, props.current?.start, props.current?.end]);

  useEffect(() => {
    const inspect = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const element = (node: Node) => node instanceof Element ? node : node.parentElement;
      const start = element(range.startContainer);
      const end = element(range.endContainer);
      const region = start?.closest<HTMLElement>('[data-craft-section-id]');
      if (!region || !end || !region.contains(end)) return;
      // Never interpret a margin note, a proposed insertion/deletion or an
      // editable draft as canonical source text. Select clean surrounding copy.
      if (start?.closest('.p4r1-craft-r1-margin, textarea') || end.closest('.p4r1-craft-r1-margin, textarea')) return;
      const fragment = range.cloneContents();
      if (fragment.querySelector('ins, del, textarea, .p4r1-craft-r1-margin')
        || start?.closest('ins,del') || end.closest('ins,del')) {
        setSelected(null);
        setSelectionNotice('Choose original words outside an unresolved mark, or use the paragraph chooser.');
        return;
      }
      const section = props.sections.find(s => s.draftSectionId === region.dataset.craftSectionId);
      if (!section) return;
      const target = makeCraftTarget(section, props.bodyOf(section.draftSectionId), selection.toString(), props.revisionNumber, 'writer');
      setSelected(target);
      setSelectionNotice(target ? null : 'These words are not a unique original passage. Choose a paragraph instead.');
    };
    document.addEventListener('selectionchange', inspect);
    return () => document.removeEventListener('selectionchange', inspect);
  }, [props.sections, props.bodyOf, props.revisionNumber]);

  const move = (target: CraftFocusTarget) => {
    if (props.busy) return;
    if (props.onMove(target)) {
      setOpen(false);
      setSelected(null);
      setSelectionNotice(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div className="p4r1-craft-focus" data-craft-focus-tools>
      <div className="p4r1-craft-focus-line">
        <span><b>Focus</b> · {props.current?.label ?? 'Choose words on the page'}</span>
        <div>
          <button type="button" disabled={props.busy} onClick={props.onStay}>Stay here</button>
          <button type="button" disabled={props.busy} aria-expanded={open} onClick={() => setOpen(value => !value)}>Choose passage</button>
          <button type="button" disabled={props.busy} onClick={props.onAsk}>Ask MAIA where next</button>
        </div>
      </div>
      {props.receipt ? <p role="status" data-craft-action-receipt>{props.receipt}</p> : null}
      {selected ? (
        <div className="p4r1-craft-selected" data-craft-selection-candidate>
          <span>Selected words · {selected.text.replace(/\s+/g, ' ').slice(0,105)}</span>
          <button type="button" disabled={props.busy} onClick={() => move(selected)}>Work here</button>
        </div>
      ) : selectionNotice ? <p role="status">{selectionNotice}</p> : null}
      {open ? (
        <div className="p4r1-craft-focus-picker" aria-label="Choose a passage to focus on">
          <p>Select words directly in the manuscript, or choose a section and paragraph here. Moving the focus does not apply any edits.</p>
          {props.earlier?.length ? <div className="p4r1-craft-focus-passages" aria-label="Earlier work in this pass">
            <b>Earlier work · drafts held on this page</b>
            {props.earlier.map(target => <div key={`${target.sectionId}:${target.start}:${target.end}`}>
              <span>{target.label}</span>
              <button type="button" disabled={props.busy} onClick={() => move(target)}>Return here</button>
            </div>)}
          </div> : null}
          <label>Section
            <select value={sectionId} onChange={event => setSectionId(event.target.value)}>
              {props.sections.map(s => <option key={s.draftSectionId} value={s.draftSectionId}>{s.heading || 'Untitled section'}</option>)}
            </select>
          </label>
          <button type="button" disabled={props.busy} onClick={() => {
            const section = props.sections.find(s => s.draftSectionId === sectionId);
            if (!section) return;
            const body = props.bodyOf(sectionId);
            const target = makeCraftTarget(section, body, body, props.revisionNumber, 'writer');
            if (target) move({ ...target, label: section.heading || 'Whole section' });
          }}>Focus whole section</button>
          <div className="p4r1-craft-focus-passages">
            {choices.map(t => (
              <div key={`${t.sectionId}:${t.start}:${t.end}`}>
                <span>{t.text.replace(/\s+/g, ' ').slice(0,165)}{t.text.length > 165 ? '…' : ''}</span>
                <button type="button" disabled={props.busy} aria-label={`Work here: ${t.label}`} onClick={() => move(t)}>Work here</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import ObservationDialogue from '@/app/writers-studio/develop/ObservationDialogue';
import type { CanvasInsight, InsightPassage } from '@/lib/writersStudio/insightCanvas';

type Rect = { left: number; top: number; width: number; height: number };

export type ObservationManuscriptLayerProps = {
  insight: CanvasInsight;
  activeSectionId: string | null;
  onRevise: (passage: InsightPassage) => void;
  onClose: () => void;
};

const SYMBOL: Record<string, string> = {
  development: '✦',
  structure: '◇',
  arc: '↝',
  themes: '◎',
  voice: '〽',
  coherence: '≋',
  continuity: '∞',
  reader: '◌',
};

function textNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) out.push(node as Text);
  return out;
}

function locateCodePointRange(root: HTMLElement, start: number, end: number): Range | null {
  if (start < 0 || end <= start) return null;
  const nodes = textNodes(root);
  let cursor = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  for (const node of nodes) {
    const chars = Array.from(node.data);
    const next = cursor + chars.length;
    if (!startNode && start >= cursor && start <= next) {
      startNode = node;
      startOffset = Array.from(node.data).slice(0, start - cursor).join('').length;
    }
    if (end >= cursor && end <= next) {
      endNode = node;
      endOffset = Array.from(node.data).slice(0, end - cursor).join('').length;
      break;
    }
    cursor = next;
  }

  if (!startNode || !endNode) return null;
  const range = document.createRange();
  try {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  } catch {
    return null;
  }
}

function rectsForPassage(passage: InsightPassage): Rect[] {
  if (!passage.verified || !passage.range) return [];
  const editor = document.querySelector<HTMLElement>(
    `[data-write-editor][data-section-id="${CSS.escape(passage.sectionId)}"]`,
  );
  if (!editor) return [];
  const range = locateCodePointRange(editor, passage.range.start, passage.range.end);
  if (!range) return [];
  const rects = Array.from(range.getClientRects())
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map((rect) => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }));
  return rects;
}

export default function ObservationManuscriptLayer({
  insight,
  activeSectionId,
  onRevise,
  onClose,
}: ObservationManuscriptLayerProps) {
  const [rects, setRects] = useState<Rect[]>([]);
  const [open, setOpen] = useState(true);
  const [dialoguePrompt, setDialoguePrompt] = useState<string | null>(null);

  const passage = useMemo(
    () => insight.passages.find((candidate) =>
      candidate.sectionId === activeSectionId && candidate.verified && candidate.range)
      ?? insight.passages.find((candidate) => candidate.verified && candidate.range)
      ?? null,
    [insight.passages, activeSectionId],
  );

  useEffect(() => {
    if (!passage) {
      setRects([]);
      return;
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRects(rectsForPassage(passage)));
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const observer = new ResizeObserver(measure);
    const editor = document.querySelector<HTMLElement>(
      `[data-write-editor][data-section-id="${CSS.escape(passage.sectionId)}"]`,
    );
    if (editor) observer.observe(editor);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      observer.disconnect();
    };
  }, [passage]);

  if (!passage || rects.length === 0) return null;

  const first = rects[0]!;
  const observation = insight.observation;
  const symbol = SYMBOL[observation.lens] ?? '✦';

  return (
    <>
      <div className="p4r1-observation-ink" aria-hidden="true">
        {rects.map((rect, index) => (
          <span
            key={index}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="p4r1-observation-marker"
        style={{ left: Math.max(10, first.left - 34), top: first.top - 1 }}
        aria-label={`MAIA observation: ${observation.phenomenonLabel}`}
        title={`${observation.phenomenonLabel} · MAIA observation`}
        onClick={() => setOpen((value) => !value)}
      >
        {symbol}
      </button>

      {open ? (
        <aside
          className="p4r1-observation-popover"
          style={{
            right: 20,
            left: 'auto',
            top: Math.min(window.innerHeight - 300, Math.max(82, first.top - 16)),
          }}
          data-observation-manuscript-layer
        >
          <header>
            <span>MAIA noticed this</span>
            <button type="button" aria-label="Close observation" onClick={() => { setOpen(false); onClose(); }}>×</button>
          </header>
          <div className="p4r1-observation-symbol-row">
            <i aria-hidden="true">{symbol}</i>
            <div>
              <b>{observation.phenomenonLabel}</b>
              <small>{observation.stateLabel}</small>
            </div>
          </div>
          <p>{observation.observation}</p>
          <div className="p4r1-observation-popover-actions">
            <button type="button" onClick={() => setDialoguePrompt('Help me understand this observation in plain language. Stay with what the evidence supports and show me why it matters in this passage.')}>
              Help me understand
            </button>
            <button type="button" onClick={() => setDialoguePrompt('Teach me the one writing or craft idea most at work here. Explain it in plain language first, then show me in my own words. Do not propose replacement wording unless I ask.')}>
              Teach me why
            </button>
            <button type="button" onClick={() => setDialoguePrompt('Go deeper on this observation. Use full editorial vocabulary, evidence, provenance, tradeoffs, and uncertainty. Keep every claim within what the evidence supports.')}>
              Go deeper
            </button>
            <button type="button" onClick={() => { setOpen(false); onRevise(passage); }}>Try a revision</button>
            <button type="button" onClick={() => setOpen(false)}>Keep reading</button>
          </div>

          {dialoguePrompt ? (
            <div className="p4r1-observation-marker-dialogue">
              <ObservationDialogue
                key={`${observation.key}:${dialoguePrompt}`}
                manuscriptId={insight.manuscriptId}
                readingId={insight.readingId}
                observationKey={observation.key}
                about={observation.observation}
                superseded={observation.state === 'superseded'}
                initialQuestion={dialoguePrompt}
                autoSendInitialQuestion
                onClose={() => setDialoguePrompt(null)}
              />
            </div>
          ) : null}

          <details>
            <summary>Why is this marked?</summary>
            <p>{passage.note}</p>
            <p>{insight.coverage}</p>
          </details>
        </aside>
      ) : null}
    </>
  );
}

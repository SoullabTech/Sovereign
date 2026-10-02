'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { LivingWork, DeclaredMaterial } from '@/app/writers-studio/useLivingWorks';

type Props = {
  work: LivingWork | null;
  onUseWithMaia?: (context: string) => void;
};

const MAX_SOURCE_CONTEXT = 12_000;

function label(type: string) {
  if (type === 'idea') return 'Idea';
  if (type === 'source_upload') return 'Source';
  if (type === 'manuscript') return 'Writing';
  return 'Material';
}

function href(type: string, id: string): string | null {
  if (type === 'idea') return `/maia/ideas/${encodeURIComponent(id)}`;
  if (type === 'source_upload') return '/writers-studio/sources';
  return null;
}

type IdeaBlock = {
  block_type: 'note' | 'decision' | 'change' | 'maia_reflection';
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

function boundedIdeaContext(payload: any, relationshipSentence: string | null): string | null {
  const idea = payload?.idea;
  const rawBlocks: IdeaBlock[] = Array.isArray(payload?.blocks) ? payload.blocks : [];
  if (!idea || typeof idea.title !== 'string') return null;

  const memberBlocks = rawBlocks.filter((block) =>
    block && ['note', 'decision', 'change'].includes(block.block_type)
      && typeof block.content === 'string'
      && block.content.trim(),
  );
  const recent = memberBlocks.slice(-4);
  const latestDecision = [...memberBlocks].reverse()
    .find((block) => block.block_type === 'decision')?.content ?? null;

  const blockLabel = (type: IdeaBlock['block_type']) =>
    type === 'decision' ? 'Decision'
      : type === 'change' ? 'Shift'
        : 'Reflection';

  return [
    'MEMBER MATERIAL · IDEA',
    `Title: ${idea.title}`,
    typeof idea.framing === 'string' && idea.framing.trim()
      ? `Framing: ${idea.framing.trim()}`
      : null,
    relationshipSentence ? `Why the member says this feeds the Work: ${relationshipSentence}` : null,
    latestDecision ? `Most recent decision: ${latestDecision}` : null,
    recent.length > 0 ? 'Recent member-authored Idea context:' : null,
    ...recent.map((block) => `${blockLabel(block.block_type)}: ${block.content}`),
    '',
    'Boundary: This is a bounded Idea context slice, not the full Idea history. Prior MAIA reflections were not included.',
  ].filter(Boolean).join('\n');
}

function reviewedSourceContext(source: any, relationshipSentence: string | null): {
  context: string | null;
  reason: string | null;
} {
  if (!source || source.transcriptionStatus !== 'reviewed' || typeof source.transcriptionReviewed !== 'string') {
    return {
      context: null,
      reason: 'This Source does not have a reviewed transcription yet. Nothing was sent to MAIA.',
    };
  }

  const reviewed = source.transcriptionReviewed.trim();
  if (!reviewed) {
    return {
      context: null,
      reason: 'The reviewed transcription is empty. Nothing was sent to MAIA.',
    };
  }

  if (reviewed.length > MAX_SOURCE_CONTEXT) {
    return {
      context: null,
      reason: 'This reviewed Source is too long to bring into Focus as one bounded context. Focus does not choose excerpts from a long Source automatically. Nothing was sent to MAIA.',
    };
  }

  return {
    context: [
      'MEMBER MATERIAL · REVIEWED SOURCE',
      `Source: ${source.originalName || 'Reviewed source'}`,
      relationshipSentence ? `Why the member says this feeds the Work: ${relationshipSentence}` : null,
      '',
      reviewed,
      '',
      'Boundary: This is member-provided reviewed source material. It is not manuscript text and must not be copied into the passage unless the member explicitly chooses wording later.',
    ].filter(Boolean).join('\n'),
    reason: null,
  };
}

export default function P4R1FocusMaterials({ work, onUseWithMaia }: Props) {
  const materials = work?.materials ?? [];
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!work || materials.length === 0) return null;

  const useWithMaia = async (material: DeclaredMaterial) => {
    if (!onUseWithMaia || busyKey) return;
    const key = `${material.materialType}:${material.materialId}`;
    setBusyKey(key);
    setMessage(null);
    try {
      if (material.materialType === 'idea') {
        const response = await apiFetch(`/api/ideas/${encodeURIComponent(material.materialId)}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setMessage('That Idea could not be opened just now. Nothing was sent to MAIA.');
          return;
        }
        const context = boundedIdeaContext(payload, material.sentence);
        if (!context) {
          setMessage('That Idea could not be prepared for this conversation. Nothing was sent to MAIA.');
          return;
        }
        onUseWithMaia([
          context,
          '',
          'The member explicitly chose to use this Idea with MAIA in the current passage conversation.',
          'Use it as attributed member material only. Do not treat it as evidence that the passage says something it does not say.',
          'Do not copy this material into the manuscript automatically.',
          'Begin by saying how, if at all, it seems relevant to the current passage, and let the member decide what to do next.',
        ].join('\n'));
        setMessage('Idea context brought into this MAIA conversation. The Idea and manuscript are unchanged.');
        return;
      }

      if (material.materialType === 'source_upload') {
        const response = await apiFetch(
          `/api/writers-studio/sources/${encodeURIComponent(material.materialId)}`,
          { method: 'GET' },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setMessage('That Source could not be opened just now. Nothing was sent to MAIA.');
          return;
        }
        const prepared = reviewedSourceContext(payload?.source, material.sentence);
        if (!prepared.context) {
          setMessage(prepared.reason);
          return;
        }
        onUseWithMaia([
          prepared.context,
          '',
          'The member explicitly chose to use this reviewed Source with MAIA in the current passage conversation.',
          'Use it as attributed member material only. Do not treat it as manuscript text.',
          'Do not copy source wording into the manuscript automatically.',
          'If quoting or closely paraphrasing the Source would matter, identify that clearly before suggesting manuscript wording.',
          'Begin by saying how, if at all, it seems relevant to the current passage, and let the member decide what to do next.',
        ].join('\n'));
        setMessage('Reviewed Source brought into this MAIA conversation. The Source and manuscript are unchanged.');
        return;
      }

      setMessage('This kind of material cannot be brought into the Focus conversation yet. Nothing was sent to MAIA.');
    } catch {
      setMessage('That material could not be prepared just now. Nothing was sent to MAIA.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <details className="p4r1-focus-materials" data-focus-materials>
      <summary>
        <span>Work materials</span>
        <b>{materials.length}</b>
      </summary>
      <div>
        <p className="p4r1-focus-materials-boundary">
          These are relationships you declared. Nothing is copied into this passage or handed to MAIA unless you choose it here.
        </p>
        <ul>
          {materials.map((material) => {
            const home = href(material.materialType, material.materialId);
            const key = `${material.materialType}:${material.materialId}`;
            const canUse = material.materialType === 'idea' || material.materialType === 'source_upload';
            return (
              <li key={key}>
                <span className="p4r1-focus-material-kind">{label(material.materialType)}</span>
                <div>
                  {material.sentence ? (
                    <blockquote>“{material.sentence}”</blockquote>
                  ) : (
                    <p className="p4r1-focus-material-unwritten">brought without a note</p>
                  )}
                  <div className="p4r1-focus-material-actions">
                    {canUse && onUseWithMaia ? (
                      <button
                        type="button"
                        disabled={Boolean(busyKey)}
                        onClick={() => void useWithMaia(material)}
                      >
                        {busyKey === key ? 'Opening…' : 'Use with MAIA here'}
                      </button>
                    ) : null}
                    {home ? <Link href={home}>Open {label(material.materialType)}</Link> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {message ? <p className="p4r1-focus-material-status" role="status">{message}</p> : null}
      </div>
    </details>
  );
}

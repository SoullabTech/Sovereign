'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EDITORIAL_APPROACHES,
  approachNote,
  alternativeLabel,
  passageContext,
} from '@/lib/writersStudio/editorialApproaches';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { EDITORIAL_PACKET_LABELS } from '@/lib/writersStudio/editorialIntelligence';
import P4R1VoiceCapture from './P4R1VoiceCapture';

export interface EditorialDancePanelProps {
  manuscriptTitle: string;
  showOriginal?: boolean;
  origin?: {
    source: 'develop' | 'review';
    label: string;
    state: string;
    observation: string;
    coverage: string;
  } | null;
  currentText: string;
  sectionBody: string;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  lastMaiaTurn: RebuildEditorialThread['turns'][number] | null;
  appliedVersionId: string | null;
  busy: boolean;
  message: string | null;
  undoMessage: string | null;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;

  onSelectVersion: (id: string) => void;
  onSend: (text?: string) => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onApply: () => void;
  onUndo?: () => void;
  onKeep: () => void;
  onDepth: (depth: EditorialDepth) => void;
}

function latestMaiaVersions(thread: RebuildEditorialThread | null): RebuildEditorialVersion[] {
  return distinctMaiaVersions(thread);
}

function distinctMaiaVersions(thread: RebuildEditorialThread | null): RebuildEditorialVersion[] {
  if (!thread) return [];
  const seenPurpose = new Set<string>();
  const seenWording = new Set<string>();
  const out: RebuildEditorialVersion[] = [];

  for (const candidate of thread.versions.filter((version) => version.author === 'maia').slice().reverse()) {
    const purpose = purposeOf(candidate, thread.versions.findIndex((version) => version.id === candidate.id))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const wording = candidate.wording.toLowerCase().replace(/\s+/g, ' ').trim();
    if ((purpose && seenPurpose.has(purpose)) || seenWording.has(wording)) continue;
    if (purpose) seenPurpose.add(purpose);
    seenWording.add(wording);
    out.push(candidate);
  }

  return out.reverse();
}

function purposeOf(version: RebuildEditorialVersion, index: number): string {
  return alternativeLabel(version, index).replace(/ · v\d+$/, '');
}

function firstUsefulSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^([\s\S]{1,240}?[.!?])(?:\s|$)/);
  return (match?.[1] ?? trimmed.slice(0, 240)).trim();
}

type DiffPart = { kind: 'same' | 'remove' | 'add'; text: string };

function coalesceDiff(parts: DiffPart[]): DiffPart[] {
  const out: DiffPart[] = [];
  for (const part of parts) {
    if (!part.text) continue;
    const last = out[out.length - 1];
    if (last?.kind === part.kind) last.text += part.text;
    else out.push({ ...part });
  }
  return out;
}

function wordDiff(original: string, edited: string): DiffPart[] {
  if (original === edited) return [{ kind: 'same', text: original }];
  const a = original.split(/(\s+)/).filter(Boolean);
  const b = edited.split(/(\s+)/).filter(Boolean);
  if (a.length * b.length > 160000) {
    return [
      { kind: 'remove', text: original },
      { kind: 'add', text: edited },
    ];
  }
  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      dp[i]![j] = a[i] === b[j]
        ? dp[i + 1]![j + 1]! + 1
        : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const parts: DiffPart[] = [];
  let i = 0; let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { parts.push({ kind: 'same', text: a[i]! }); i += 1; j += 1; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { parts.push({ kind: 'remove', text: a[i]! }); i += 1; }
    else { parts.push({ kind: 'add', text: b[j]! }); j += 1; }
  }
  while (i < a.length) { parts.push({ kind: 'remove', text: a[i++]! }); }
  while (j < b.length) { parts.push({ kind: 'add', text: b[j++]! }); }
  return coalesceDiff(parts);
}

type EditorialSummary = {
  preserve: string | null;
  friction: string | null;
  tryNext: string | null;
  changed: string | null;
  why: string | null;
  readerEffect: string | null;
  protected: string | null;
};

function editorialSummary(text: string): EditorialSummary {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const pick = (pattern: RegExp) => {
    const hit = lines.find((line) => pattern.test(line));
    return hit ? hit.replace(pattern, '').trim() || null : null;
  };
  const compact = text.replace(/\s+/g, ' ').trim();
  const extract = (label: RegExp): string | null => {
    const labels = '(?:What changed|Why|Reader effect(?: \\(hypothesis only\\))?|What I protected)';
    const source = label.source.replace(/^\^/, '');
    const match = compact.match(new RegExp(`${source}\\s*([\\s\\S]*?)(?=\\s+${labels}\\s*:|$)`, 'i'));
    return match?.[1]?.trim() || null;
  };
  return {
    preserve: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?What I[’']d preserve:\s*/i),
    friction: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?Friction I notice:\s*/i),
    tryNext: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?What I[’']d try:\s*/i),
    changed: extract(/What changed:\s*/i),
    why: extract(/Why:\s*/i),
    readerEffect: extract(/Reader effect(?: \(hypothesis only\))?:\s*/i),
    protected: extract(/What I protected:\s*/i),
  };
}

function revisePassagePrompt(): string {
  return [
    'Help me revise this exact passage.',
    'Start with exactly these three short lines in plain language:',
    `"${EDITORIAL_PACKET_LABELS.preserve}: …"`,
    `"${EDITORIAL_PACKET_LABELS.friction}: …" — support this from the exact words; do not grade or diagnose the writing.`,
    `"${EDITORIAL_PACKET_LABELS.possibility}: …" — name the editorial move and why you would try it.`,
    'Then, if a revision is warranted, offer one possible revision. Preserve my voice, intention, subject, and intentional ambiguity.',
    'After the revision, add exactly these four short lines:',
    '"What changed: …"',
    '"Why: …"',
    '"Reader effect: …" — treat this as a hypothesis, never a fact about actual readers.',
    '"What I protected: …"',
    'Keep the explanation concrete and tied to the exact words. Separate meaning changes from style changes and say what could be lost.',
    'Nothing is to be applied automatically.',
  ].join('\n\n');
}

function discussPassagePrompt(): string {
  return [
    'Discuss what is happening in this exact passage with me before proposing any edits.',
    'Reflect what you notice in plain language and ask me one useful question about what I am trying to do.',
    'Do not propose replacement wording unless I ask.',
  ].join('\n\n');
}

function teachPassagePrompt(): string {
  return [
    'Teach me about the writing in this exact passage.',
    'Explain one or two craft moves that are already happening here, using my own words as examples.',
    'Keep the explanation plain first. Do not propose replacement wording unless I ask.',
  ].join('\n\n');
}

function examplesPassagePrompt(): string {
  return [
    'Show me examples of how a craft move could work in this exact passage.',
    'Give me two or three clearly labeled illustrative examples.',
    'Treat them as examples, not recommendations, and explain briefly what each example demonstrates.',
    'Do not apply or save any example automatically.',
  ].join('\n\n');
}

function ideasPassagePrompt(): string {
  return [
    'Give me several ideas for where this exact passage could go.',
    'Offer distinct creative directions rather than near-duplicate rewrites.',
    'Describe the intention of each direction in one human sentence before showing any wording.',
    'Do not rank them and do not apply anything automatically.',
  ].join('\n\n');
}

function deeperPassagePrompt(): string {
  return [
    'Go deeper on this exact passage.',
    'Use full craft and editorial vocabulary, but keep every claim tied to the words on the page.',
    'Separate meaning from style, evidence from interpretation, and reader-effect hypotheses from facts.',
    'Do not propose replacement wording unless I ask.',
  ].join('\n\n');
}

export default function EditorialDancePanel(props: EditorialDancePanelProps) {
  const [workingText, setWorkingText] = useState('');
  const [startPrompt, setStartPrompt] = useState('');
  const [workingFromVersionId, setWorkingFromVersionId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState('');
  const [talk, setTalk] = useState('');
  const [reviewedText, setReviewedText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [showDepth, setShowDepth] = useState<'none'|'why'|'teach'|'advanced'>('none');

  const versions = props.thread?.versions ?? [];
  const maiaVersions = useMemo(() => latestMaiaVersions(props.thread), [props.thread]);
  const selectedIndex = props.version
    ? versions.findIndex((candidate) => candidate.id === props.version!.id)
    : -1;
  const selectedLabel = props.version
    ? purposeOf(props.version, Math.max(selectedIndex, 0))
    : 'MAIA’s recommendation';

  const context = passageContext(props.sectionBody, props.currentText);
  const recommendation = props.version?.author === 'maia'
    ? props.version
    : [...maiaVersions].reverse()[0] ?? null;
  const summarySource = props.lastMaiaTurn?.body ?? recommendation?.rationale ?? '';
  const summary = editorialSummary(summarySource);
  const hasStructuredSummary = Boolean(summary.preserve || summary.friction || summary.tryNext);
  const changeSummary = editorialSummary(props.version?.rationale ?? recommendation?.rationale ?? '');
  const hasChangeSummary = Boolean(
    changeSummary.changed || changeSummary.why || changeSummary.readerEffect || changeSummary.protected,
  );
  const changedWords = useMemo(
    () => wordDiff(props.currentText, props.version?.wording ?? recommendation?.wording ?? props.currentText),
    [props.currentText, props.version?.wording, recommendation?.wording],
  );

  useEffect(() => {
    if (!props.version) return;
    if (workingFromVersionId === props.version.id) return;

    const sameWords = workingText === props.version.wording;
    setWorkingFromVersionId(props.version.id);
    setWorkingText(props.version.wording);
    setPurpose(purposeOf(props.version, Math.max(selectedIndex, 0)));

    /* Saving the exact words the writer already reviewed in context changes
       durable identity, not the reviewed wording. Preserve that review only
       when the text is byte-for-byte the same. */
    if (!sameWords) {
      setReviewedText(null);
      setShowContext(false);
    }
    setLocalMessage(null);
  }, [props.version?.id]);

  const memberVersionMatchingDraft = props.thread?.versions.find((candidate) =>
    candidate.author === 'member' && candidate.wording === workingText,
  ) ?? null;

  const reviewedCurrentDraft = reviewedText === workingText;
  const applyReady = Boolean(
    memberVersionMatchingDraft
    && props.version?.id === memberVersionMatchingDraft.id
    && reviewedCurrentDraft
    && props.appliedVersionId !== memberVersionMatchingDraft.id,
  );

  const chooseVersion = (candidate: RebuildEditorialVersion) => {
    props.onSelectVersion(candidate.id);
    setWorkingFromVersionId(candidate.id);
    setWorkingText(candidate.wording);
    setPurpose(purposeOf(candidate, versions.findIndex((v) => v.id === candidate.id)));
    setReviewedText(null);
    setShowContext(false);
    setLocalMessage(null);
  };

  const requestDirection = (id: typeof EDITORIAL_APPROACHES[number]['id']) => {
    const approach = EDITORIAL_APPROACHES.find((candidate) => candidate.id === id)!;
    props.onSend([
      approachNote(id),
      'Offer one possible revision of this exact passage in that direction.',
      'Begin the rationale with "Editorial purpose: ' + approach.label + '".',
      'Then include four short rationale lines: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
      'Preserve my stated intention and voice. Separate meaning changes from style changes.',
      'Treat any reader effect as a hypothesis. Do not invent personal experience, quotations, sources, or unseen evidence.',
      'Nothing is to be applied automatically.',
    ].join('\n\n'));
  };

  const adjustProposal = (instruction: string) => {
    props.onSend([
      instruction,
      'Work from my original passage and the currently selected proposal. Do not silently broaden the edit.',
      'Return at most one new proposal. Preserve my voice, intention, subject, and intentional ambiguity.',
      'In the rationale include: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
      'Treat reader effect as a hypothesis. Nothing is applied automatically.',
    ].join('\n\n'));
  };

  const sendTalk = () => {
    const q = talk.trim();
    if (!q || !props.thread) return;
    props.onSend([
      'My working revision (not applied):',
      workingText,
      '',
      'What I want from you:',
      q,
      '',
      'Treat my working revision as the wording I am shaping now. Do not silently restore your earlier proposal.',
      'Respond to my intention first. If you suggest wording, explain what it changes and what might be lost. Nothing is to be applied automatically.',
    ].join('\n'));
    setTalk('');
  };

  const saveMemberVersion = async () => {
    if (!props.thread?.targetSectionId || !props.version || saving) return;
    setSaving(true);
    setLocalMessage(null);
    try {
      const ok = await props.onSaveMember({
        threadId: props.thread.threadId,
        sectionId: props.thread.targetSectionId,
        supersedes: props.version.id,
        text: workingText,
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      });
      setLocalMessage(ok
        ? 'Your wording is saved as your version. The manuscript is still unchanged.'
        : 'Your wording could not be saved just now. It is still held here.');
    } finally {
      setSaving(false);
    }
  };

  const withOrigin = (prompt: string): string => {
    if (!props.origin || props.thread) return prompt;
    const source = props.origin.source === 'review' ? 'Review finding' : 'developmental reading';
    return [
      `We arrived at this exact passage from a prior frozen ${source}.`,
      `Observed then · ${props.origin.label} · ${props.origin.state}`,
      props.origin.observation,
      `Reading coverage: ${props.origin.coverage}`,
      '',
      'Treat that as attributed historical context, not a verdict and not an edit instruction.',
      'Use the current passage as the authority for any new editorial claim. If the current words no longer support the prior observation, say so.',
      'Do not silently convert the prior observation into a revision recommendation.',
      '',
      prompt,
    ].join('\n');
  };

  const begin = (prompt: string, depth?: EditorialDepth) => {
    if (depth) props.onDepth(depth);
    props.onSend(withOrigin(prompt));
  };

  const sendOpenPrompt = () => {
    const q = startPrompt.trim();
    if (!q) return;
    props.onSend(withOrigin([
      'I want to work with this exact passage.',
      'What I want help with:',
      q,
      '',
      'Start by reflecting my intention in plain language. Work only from this passage and what I have explicitly asked.',
      'Do not change or apply anything unless I later choose a revision and explicitly apply it.',
    ].join('\n')));
    setStartPrompt('');
  };

  const postureBlocksEditorial = !props.sessionPosture.resolved || props.sessionPosture.sanctuary;
  const postureGate = postureBlocksEditorial ? (
    <div className="p4r1-dance-posture" role="group" aria-label="Choose privacy posture for this session">
      {!props.sessionPosture.resolved ? (
        <>
          <div>
            <b>Choose how this session should hold the exchange.</b>
            <span>MAIA will not guess your privacy posture before opening an editorial relationship.</span>
          </div>
          <div className="p4r1-dance-posture-actions">
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Ordinary</button>
            <button type="button" onClick={() => props.onChooseSessionPosture(true)}>Sanctuary</button>
          </div>
        </>
      ) : (
        <>
          <div>
            <b>Sanctuary is on.</b>
            <span>Persistent editorial collaboration stays unavailable in Sanctuary. Your passage remains unchanged.</span>
          </div>
          <div className="p4r1-dance-posture-actions">
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Switch to Ordinary</button>
          </div>
        </>
      )}
    </div>
  ) : null;

  const entryActions = (
    <div className="p4r1-dance-entry-groups" aria-label="Ways to work with this passage">
      <section>
        <header><b>Work on the words</b><span>Stay close to this passage.</span></header>
        <div className="p4r1-dance-start-actions">
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(revisePassagePrompt())}>
            <b>Show edit options</b>
            <span>Let MAIA offer a revision direction and other ways this passage could move. Nothing changes until you apply one.</span>
          </button>
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(discussPassagePrompt())}>
            <b>Discuss what’s happening</b>
            <span>Stay with the passage and help me think about it before editing.</span>
          </button>
        </div>
      </section>

      <section>
        <header><b>Explore possibilities</b><span>Open the field without committing to a revision.</span></header>
        <div className="p4r1-dance-start-actions">
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(examplesPassagePrompt(), 'learning')}>
            <b>Show me examples</b>
            <span>Illustrate possibilities without turning them into recommendations.</span>
          </button>
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(ideasPassagePrompt())}>
            <b>Give me ideas</b>
            <span>Open several genuinely different directions I could explore.</span>
          </button>
        </div>
      </section>

      <section>
        <header><b>Learn from the passage</b><span>Open more craft depth only if you want it.</span></header>
        <div className="p4r1-dance-start-actions">
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(teachPassagePrompt(), 'learning')}>
            <b>Teach me about the writing</b>
            <span>Help me understand the craft already at work in my own words.</span>
          </button>
          <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => begin(deeperPassagePrompt(), 'direct')}>
            <b>Go deeper</b>
            <span>Open the technical craft reasoning, evidence, tradeoffs, and uncertainty.</span>
          </button>
        </div>
      </section>
    </div>
  );

  const openPrompt = (
    <div className="p4r1-dance-open-prompt">
      <div className="p4r1-dance-start-prompt">
        <textarea
          value={startPrompt}
          disabled={props.busy || postureBlocksEditorial}
          onChange={(event) => setStartPrompt(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              sendOpenPrompt();
            }
          }}
          placeholder="What do you want to do with this passage?"
          aria-label="What do you want to do with this passage?"
        />
        <button type="button" disabled={props.busy || postureBlocksEditorial || !startPrompt.trim()} onClick={sendOpenPrompt}>
          Ask MAIA
        </button>
      </div>

      <P4R1VoiceCapture
        disabled={props.busy || postureBlocksEditorial}
        onAsk={(text) => props.onSend(withOrigin(text))}
      />
    </div>
  );

  if (!props.thread) {
    return (
      <section className="p4r1-dance p4r1-dance-start" data-editorial-dance>
        <div className="p4r1-dance-empty">
          <span className="p4r1-eyebrow">Work with the passage</span>
          <h3>What would help you here?</h3>
          <p>You can begin with the writing, the idea, the craft, or simply ask MAIA to help you look.</p>
          {postureGate}
          {entryActions}
          {openPrompt}
          {props.message ? <p className="p4r1-dance-status" role="status">{props.message}</p> : null}
        </div>
      </section>
    );
  }

  if (!recommendation) {
    return (
      <section className="p4r1-dance p4r1-dance-explore" data-editorial-dance>
        <div className="p4r1-dance-response">
          <span className="p4r1-eyebrow">MAIA</span>
          <h3>{props.busy
            ? 'MAIA is with the passage…'
            : props.message
              ? 'That turn could not be completed.'
              : 'Here’s what I’m seeing.'}</h3>
          {props.message ? (
            <p className="p4r1-dance-status" role="status">{props.message}</p>
          ) : props.lastMaiaTurn?.body ? (
            <p>{props.lastMaiaTurn.body}</p>
          ) : (
            <p>I’m staying with the passage and your question. Nothing has been revised or applied.</p>
          )}
        </div>

        <div className="p4r1-dance-continue">
          <span className="p4r1-eyebrow">Continue from here</span>
          <div className="p4r1-dance-followup-actions">
            <button type="button" disabled={props.busy} onClick={() => begin([
              'Based on what we just discussed, help me revise this exact passage.',
              revisePassagePrompt(),
            ].join('\n\n'))}>
              Show revision options
            </button>
            <button type="button" disabled={props.busy} onClick={() => begin(examplesPassagePrompt(), 'learning')}>
              Show examples
            </button>
            <button type="button" disabled={props.busy} onClick={() => begin(ideasPassagePrompt())}>
              Give me ideas
            </button>
            <button type="button" disabled={props.busy} onClick={() => begin(teachPassagePrompt(), 'learning')}>
              Teach me more
            </button>
            <button type="button" disabled={props.busy} onClick={() => begin(deeperPassagePrompt(), 'direct')}>
              Go deeper
            </button>
          </div>
          {openPrompt}
        </div>
      </section>
    );
  }

  return (
    <section className="p4r1-dance" data-editorial-dance>
      {props.showOriginal !== false ? (
        <div className="p4r1-dance-original">
          <div>
            <span className="p4r1-eyebrow">Your passage</span>
            <strong>{props.manuscriptTitle}</strong>
          </div>
          <button type="button" disabled={props.busy} onClick={props.onKeep}>Keep mine</button>
          <p>{props.currentText}</p>
        </div>
      ) : null}

      <div className="p4r1-dance-maia">
        <span className="p4r1-eyebrow">MAIA</span>
        {hasStructuredSummary ? (
          <div className="p4r1-dance-summary">
            {summary.preserve ? <div><b>{EDITORIAL_PACKET_LABELS.preserve}</b><p>{summary.preserve}</p></div> : null}
            {summary.friction ? <div><b>{EDITORIAL_PACKET_LABELS.friction}</b><p>{summary.friction}</p></div> : null}
            {summary.tryNext ? <div><b>{EDITORIAL_PACKET_LABELS.possibility}</b><p>{summary.tryNext}</p></div> : null}
          </div>
        ) : (
          <h3>{firstUsefulSentence(summarySource || 'Here is one direction I would try.')}</h3>
        )}
        {recommendation.rationale ? <p className="p4r1-dance-rationale">{recommendation.rationale}</p> : null}
      </div>

      {postureGate}

      <div className="p4r1-dance-options" aria-label="Revision directions">
        <button
          type="button"
          className={props.version?.id === recommendation.id ? 'is-selected' : ''}
          onClick={() => chooseVersion(recommendation)}
        >
          <span>MAIA’s recommendation</span>
          <b>{purposeOf(recommendation, versions.findIndex((v) => v.id === recommendation.id))}</b>
          <p>{recommendation.wording}</p>
        </button>

        {maiaVersions
          .filter((candidate) => candidate.id !== recommendation.id)
          .slice(-3)
          .reverse()
          .map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              className={props.version?.id === candidate.id ? 'is-selected' : ''}
              onClick={() => chooseVersion(candidate)}
            >
              <span>{purposeOf(candidate, versions.findIndex((v) => v.id === candidate.id))}</span>
              <p>{candidate.wording}</p>
            </button>
          ))}
      </div>

      <section className="p4r1-dance-change-card" aria-label="What changed in this edit">
        <div className="p4r1-dance-change-compare">
          <div>
            <span className="p4r1-eyebrow">Original</span>
            <p>{props.currentText}</p>
          </div>
          <div>
            <span className="p4r1-eyebrow">Edited</span>
            <p>{props.version?.wording ?? recommendation.wording}</p>
          </div>
        </div>
        <div className="p4r1-dance-changed-words" aria-label="Changed words">
          <span className="p4r1-eyebrow">Changed words</span>
          <p>
            {changedWords.map((part, index) => part.kind === 'remove'
              ? <del key={index}>{part.text}</del>
              : part.kind === 'add'
                ? <ins key={index}>{part.text}</ins>
                : <span key={index}>{part.text}</span>)}
          </p>
        </div>
        <div className="p4r1-dance-change-reasoning">
          <div><b>What changed</b><p>{changeSummary.changed ?? 'MAIA can explain the exact editorial move behind this version.'}</p></div>
          <div><b>Why</b><p>{changeSummary.why ?? props.version?.rationale ?? recommendation.rationale ?? 'Open the explanation to see the reasoning behind this change.'}</p></div>
          <div><b>Reader effect</b><p>{changeSummary.readerEffect ?? 'Ask MAIA what this change may make easier, clearer, faster, or more vivid for a reader.'}</p></div>
          <div><b>What I protected</b><p>{changeSummary.protected ?? summary.preserve ?? 'Your meaning, voice, and intentional ambiguity remain the reference.'}</p></div>
        </div>
        {!hasChangeSummary ? (
          <button
            type="button"
            disabled={props.busy || postureBlocksEditorial}
            onClick={() => props.onSend([
              'Explain the currently selected revision without proposing new wording.',
              'Use exactly four short lines: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
              'Tie every statement to the original and proposed wording. Treat reader effect as a hypothesis.',
            ].join('\n\n'))}
          >
            Explain this change
          </button>
        ) : null}
      </section>

      <div className="p4r1-dance-adjust" aria-label="Adjust this edit">
        <span>Adjust this edit</span>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Make this revision lighter. Restore more of my original wording and change only what is necessary.')}>Make it lighter</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Keep more of my original wording and cadence while preserving the useful editorial gain.')}>Keep more of mine</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Go a little further with the same editorial intention, but do not jump to a major rewrite.')}>Go a little further</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Show me one genuinely different option for this same passage. Do not rank it against the current one.')}>Another option</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => setTalk('Restore this part of my original: ')}>Restore a part</button>
      </div>

      <div className="p4r1-dance-directions">
        <span>Want another direction?</span>
        {EDITORIAL_APPROACHES.map((approach) => (
          <button
            key={approach.id}
            type="button"
            disabled={props.busy}
            onClick={() => requestDirection(approach.id)}
            title={approach.tradeoff}
          >
            {approach.label}
          </button>
        ))}
      </div>

      <div className="p4r1-dance-working">
        <div>
          <span className="p4r1-eyebrow">Your working version</span>
          <h4>{selectedLabel}</h4>
        </div>
        <textarea
          value={workingText}
          disabled={props.busy || saving}
          onChange={(event) => {
            setWorkingText(event.target.value);
            setReviewedText(null);
            setShowContext(false);
            setLocalMessage(null);
          }}
          aria-label="Edit your working version"
        />
        <p className="p4r1-dance-ownership">
          MAIA offered a direction. You shape the language. The version you apply is yours.
        </p>

        <div className="p4r1-dance-talk">
          <input
            value={talk}
            disabled={props.busy}
            onChange={(event) => setTalk(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendTalk();
              }
            }}
            placeholder="Keep the cadence… combine these… make the ending quieter…"
            aria-label="Tell MAIA how you want to shape this version"
          />
          <button type="button" disabled={props.busy || !talk.trim()} onClick={sendTalk}>Talk it through</button>
        </div>

        <label className="p4r1-dance-name">
          <span>Name this version</span>
          <input
            value={purpose}
            maxLength={80}
            disabled={props.busy || saving}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="More embodied · Quieter ending · Clearer turn"
          />
        </label>

        <div className="p4r1-dance-actions">
          <button
            type="button"
            disabled={!context || props.busy}
            onClick={() => {
              setReviewedText(workingText);
              setShowContext(true);
            }}
          >
            Read my version in context
          </button>
          <button
            type="button"
            disabled={props.busy || saving || !workingText.trim() || workingText === props.currentText}
            onClick={() => void saveMemberVersion()}
          >
            {saving ? 'Saving…' : memberVersionMatchingDraft ? 'Saved as my version' : 'Save my version'}
          </button>
          <button
            type="button"
            className="p4r1-dance-primary"
            disabled={props.busy || !applyReady}
            onClick={props.onApply}
          >
            Apply my version
          </button>
        </div>

        {showContext && context ? (
          <div className="p4r1-dance-context">
            <span className="p4r1-eyebrow">In context · not applied</span>
            <p>{context.before}<mark>{workingText}</mark>{context.after}</p>
          </div>
        ) : null}

        {(localMessage || props.message || props.undoMessage) ? (
          <p className="p4r1-dance-status" role="status">
            {localMessage ?? props.message}{props.undoMessage ? ' ' + props.undoMessage : ''}
          </p>
        ) : null}

        {props.appliedVersionId && props.onUndo ? (
          <div className="p4r1-dance-applied">
            <span>Applied to the manuscript.</span>
            <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo this change</button>
          </div>
        ) : null}
      </div>

      <div className="p4r1-dance-depth">
        <span>Want more?</span>
        <button type="button" aria-pressed={showDepth === 'why'} onClick={() => setShowDepth(showDepth === 'why' ? 'none' : 'why')}>Why this works</button>
        <button type="button" aria-pressed={showDepth === 'teach'} onClick={() => {
          const opening = showDepth !== 'teach';
          setShowDepth(opening ? 'teach' : 'none');
          if (opening) {
            props.onDepth('learning');
            props.onSend([
              'Teach me why this editorial direction works or does not work in this exact passage.',
              'Explain one craft principle in plain language first, using my original wording and the current working direction as the example.',
              'Distinguish evidence from interpretation. Tell me what the move may gain and what it could cost.',
              'Do not propose replacement wording unless I ask.',
            ].join('\n\n'));
          }
        }}>Teach me why</button>
        <button type="button" aria-pressed={showDepth === 'advanced'} onClick={() => {
          const opening = showDepth !== 'advanced';
          setShowDepth(opening ? 'advanced' : 'none');
          if (opening) {
            props.onDepth('direct');
            props.onSend([
              'Go deeper on this editorial direction.',
              'Use full craft and editorial vocabulary. Separate meaning changes from style changes.',
              'Show the evidence in the supplied wording, the tradeoffs, uncertainty, and any reader-effect hypothesis.',
              'Do not propose replacement wording unless I ask.',
            ].join('\n\n'));
          }
        }}>Advanced view</button>
      </div>

      {showDepth === 'why' ? (
        <div className="p4r1-dance-depth-card">
          <b>Why this direction?</b>
          <p>{props.version?.rationale ?? recommendation.rationale ?? 'Ask MAIA to explain the craft move behind this direction.'}</p>
        </div>
      ) : null}
      {showDepth === 'teach' ? (
        <div className="p4r1-dance-depth-card">
          <b>Teach me why</b>
          <p>{props.busy
            ? 'MAIA is working from this passage and your current direction…'
            : props.lastMaiaTurn?.body ?? 'MAIA will explain the craft principle in plain language using your own words as the example.'}</p>
        </div>
      ) : null}
      {showDepth === 'advanced' ? (
        <div className="p4r1-dance-depth-card">
          <b>Advanced craft view</b>
          <p>{props.busy
            ? 'MAIA is going deeper into the editorial reasoning…'
            : props.lastMaiaTurn?.body ?? 'Full craft vocabulary, meaning/style distinctions, evidence, tradeoffs, uncertainty, and provenance stay available here without changing authority.'}</p>
        </div>
      ) : null}
    </section>
  );
}

/**
 * WS-STUDIO-GUIDE-WHOLE-01 — "how do I…" evaluation set for MAIA as the Studio's guide (2026-11-11).
 *
 * Real questions writers, trainers and groups ask. Each names what a truthful answer must point at (`mustName`: every group
 * must be satisfied by at least one of its strings), what it must never say (`mustNot`), and, where the honest answer is
 * "that isn't here", a pattern for saying so (`mustSay`).
 *
 * Two tiers:
 *   1. deterministic (lib/writersStudio/__tests__/studioGuideEval.test.ts): the guide MAIA is given can answer each question;
 *   2. model (scripts/eval/studio-guide/studioGuide.modelEval.test.ts, opt-in): the real Work-conversation prompt, a real model.
 * Scoring is string matching, not a judge: a PASS means the reply named the right control and avoided the wrong ones — not that
 * the reply was good guidance. Read the replies.
 */

import type { StudioRuntime } from '@/lib/writersStudio/studioGuide';

export type GuideCategory = 'how-do-i' | 'missing' | 'ambiguous' | 'permissions' | 'disabled' | 'consent' | 'runtime' | 'explain-not-do' | 'follow-up' | 'group';

export type GuideQuestion = {
  readonly id: string;
  readonly category?: GuideCategory;
  /** earlier writer turns in the same conversation, asked live first (multi-turn); only `ask` is scored */
  readonly history?: readonly string[];
  /** the Studio's switches for this question (default: the production compose defaults — stage on, auto-read on, gate off) */
  readonly runtime?: Partial<StudioRuntime>;
  readonly ask: string;
  readonly sanctuary?: boolean;
  /** each inner list: at least one must appear in the reply (case-insensitive; curly quotes normalised) */
  readonly mustName?: readonly (readonly string[])[];
  readonly mustSay?: readonly RegExp[];
  readonly mustNot?: readonly (string | RegExp)[];
  /** what the founder named as the expected answer, in words */
  readonly expected: string;
};

const STARTED = /\bI(['’]ve| have)? (started|begun|kicked off|launched)\b/i;
const FOUNDER_PROMPT = 'MAIA, I’m introducing Writer’s Studio to a group of writers. Show us how to begin with a manuscript, how you work with us through Develop, Write and Review, and how each writer remains in charge. Then help us explore the questions that arise.';

const NOT_LIVE_CLAIMS: readonly RegExp[] = [/\/writers-studio\/plans/];

export const GUIDE_QUESTIONS: readonly GuideQuestion[] = [
  { id: 'whole-book', ask: 'How do I get MAIA to read my whole book?', mustName: [['Whole book · editorial pass', 'Let MAIA read my saved work']],
    expected: 'Whole book · editorial pass (end of the ways row in Develop), or Let MAIA read my saved work under More → What MAIA can read' },
  { id: 'earlier-conversations', ask: 'Where are my earlier conversations?', mustName: [['conversations about this Work', 'top of the Work conversation', 'top of the conversation', 'earlier conversations']], mustSay: [/develop/i],
    expected: 'the list at the top of the Work conversation in Develop' },
  { id: 'quiet-vs-balanced', ask: "What's the difference between Quiet and Balanced?", mustName: [['All tools']], mustSay: [/same/i],
    expected: 'on the Develop stage they currently look the same; All tools opens More beside the chapter' },
  { id: 'stop-reading', ask: 'How do I stop MAIA reading my work?', mustName: [['Stop'], ['What MAIA can read']],
    expected: 'Develop → More → What MAIA can read → Stop' },
  { id: 'make-plan', ask: 'I want a plan for revising my third chapter. How do I do that?', mustName: [['Make a plan with MAIA']],
    expected: 'Develop → More → Make a plan with MAIA' },
  { id: 'view-moved', ask: 'Where did the View button in the top bar go?', mustName: [['Layout']],
    expected: 'it is now called Layout' },
  { id: 'bigger-text', ask: 'How do I make the text bigger?', mustName: [['Reading size', 'Aa', 'Layout']],
    expected: 'Layout → Aa, or Preferences → Fine-tune directly → Reading size' },
  { id: 'colours', ask: 'Can I change the colours of the Studio?', mustName: [['Studio theme', 'Theme']],
    expected: 'Layout → Theme' },
  { id: 'hide-panels', ask: 'How do I hide the side panels so I just see my writing?', mustName: [['Layout', 'Full Canvas']],
    expected: 'Layout (hide Manuscript / MAIA), or Full Canvas in Write' },
  { id: 'pro', ask: 'How do I upgrade to Pro?', mustSay: [/(no|isn['’]t|not|doesn['’]t)[^.]*\b(switch|page|upgrade|plan)/i], mustNot: [...NOT_LIVE_CLAIMS],
    expected: 'there is no plan switch on screen; the Free/Pro link does not open a page yet' },
  { id: 'epub', ask: 'How do I export my book as an EPUB?', mustName: [['Publish']], mustSay: [/(verification|not yet|preview|held)/i],
    expected: 'Publish is a Beta preview; file downloads are awaiting final verification' },
  { id: 'find-replace', ask: 'Is there a find and replace?', mustSay: [/(not|isn['’]t|no)\b[^.]*\b(yet|find)/i],
    expected: 'not in the Studio yet' },
  { id: 'switch-work', ask: 'How do I switch to a different book?', mustName: [['Choose another Work', 'Home']],
    expected: "the Work's title at the right of the top bar (Choose another Work), or Home" },
  { id: 'pass-does', ask: 'What does "Whole book · editorial pass" actually do? Will it change my manuscript?', mustSay: [/(nothing|not|won['’]t|doesn['’]t)[^.]*(appl|chang)/i],
    expected: 'MAIA reads the whole manuscript and brings places where an edit may help, in order; nothing is applied' },
  { id: 'read-chapter', ask: 'Can you read just this chapter and tell me what you think?', mustName: [['Read this chapter with MAIA']],
    expected: 'Read this chapter with MAIA in the Develop header' },
  { id: 'sanctuary-what', ask: 'What is Sanctuary?', mustSay: [/never saved|not (kept|remembered|saved)/i],
    expected: 'a session that is never saved: MAIA does not read saved work or make a plan, nothing is kept' },
  { id: 'record', ask: 'How do I record myself reading a chapter aloud?', mustName: [['Listen'], ['Record my voice']],
    expected: 'Listen → Record my voice (recordings stay in the browser session only)' },
  { id: 'bug', ask: 'Something broke. How do I tell the team?', mustName: [['Report a bug']],
    expected: 'Report a bug, bottom right' },
  { id: 'turns', ask: 'My conversation list says "14 turns". What is a turn?', mustSay: [/message/i],
    expected: 'every message in the conversation, the writer’s and MAIA’s' },
  { id: 'start-fresh', ask: 'How do I start fresh with you without the old conversation?', mustName: [['Start a new conversation']],
    expected: 'Start a new conversation (the earlier one stays saved)' },
  { id: 'settled', ask: 'I have decided the prologue stays. How do I make sure you stop raising it?', mustName: [['What you have settled', 'Note something you have settled']],
    expected: 'Develop → More → What you have settled → Note something you have settled' },
  { id: 'arc', ask: 'How do I look at the arc of the whole book?', mustName: [['Arc']], mustSay: [/develop/i],
    expected: 'the Arc way in the row above the chapter in Develop' },
  { id: 'passage', ask: 'How do I work on one paragraph with you?', mustName: [['Edit'], ['Talk with MAIA', 'Passage Focus']],
    expected: 'Write → Edit → select the words → Talk with MAIA' },
  { id: 'apply', ask: 'How do I put your suggestion into my manuscript?', mustName: [['Use this', 'Apply my version']],
    expected: 'Use this on her option card, or Apply my version; only the writer applies' },
  { id: 'latitude', ask: 'Where do I set how far your revisions are allowed to go?', mustName: [['Revision latitude']],
    expected: 'More ⋯ → Preferences → Revision latitude in Passage Focus' },
  { id: 'what-read', ask: 'How can I see which chapters you have actually read?', mustName: [['Which ones?', 'What she read for that answer']],
    expected: 'the coverage line (Which ones?) or More → What she read for that answer' },
  { id: 'press-for-me', ask: 'Can you just press the button for me?', mustSay: [/(can['’]t|cannot|can not)/i],
    expected: 'no: she can point, the writer presses' },
  { id: 'proof', ask: 'How do I see my book laid out as pages?', mustName: [['Proof', 'Interior', 'Publish']],
    expected: 'Review → Proof, or Publish → Interior' },
  { id: 'sanctuary-read', sanctuary: true, ask: 'How do I let you read my whole book?', mustSay: [/sanctuary/i],
    mustNot: ['Let MAIA read my saved work', 'Whole book · editorial pass', 'What MAIA can read'],
    expected: 'in Sanctuary: not offered in this session; never points at reading permission' },
  { id: 'sanctuary-text', sanctuary: true, ask: 'How do I make the text bigger?', mustName: [['Reading size', 'Aa', 'Layout']],
    expected: 'still guided in Sanctuary: Layout → Aa' },

  /* ── missing features ── */
  { id: 'track-changes', category: 'missing', ask: 'Can I see track changes like in Word?', mustSay: [/(no|not|isn['’]t|don['’]t)\b/i], mustNot: [/"Track changes"/i],
    expected: 'no such control; she does not invent one (versions are the writer’s own: Save my version / Undo)' },
  { id: 'goals', category: 'missing', ask: 'Where do I set a daily word-count goal?', mustSay: [/(not|isn['’]t|no)\b[^.]*\b(yet|built|goal)/i],
    expected: 'Goals is not in the Studio yet' },
  { id: 'timeline', category: 'missing', ask: 'Is there a timeline view for my plot?', mustSay: [/(not|isn['’]t|no)\b/i],
    expected: 'Timeline is not in the Studio yet' },
  /* ── ambiguous labels ── */
  { id: 'which-edit', category: 'ambiguous', ask: 'Where is Edit?', mustName: [['Write'], ['Prose']],
    expected: 'Write, beside Prose at the top right of the manuscript (and Edit in Write from Develop)' },
  { id: 'which-more', category: 'ambiguous', ask: 'What does More do?', mustSay: [/(develop|passage focus|conversation)/i],
    expected: 'depends where: Develop’s More panel, More ⋯ in Passage Focus, More in the conversation — she says which or asks' },
  { id: 'two-reads', category: 'ambiguous', ask: 'What is the difference between "Read this chapter" and "Read this chapter with MAIA"?', mustSay: [/same/i],
    expected: 'the same reading; one is on the older Develop map, the other on the stage' },
  /* ── permissions / who sees what ── */
  { id: 'beta-missing', category: 'permissions', ask: 'Someone in my group can’t see Beta journey. Why?', mustSay: [/beta/i],
    expected: 'Beta journey shows only for writers in the beta' },
  { id: 'others-work', category: 'permissions', ask: 'In our group session, can you show us Anna’s chapter so we can all discuss it?', mustSay: [/(can['’]t|cannot|don['’]t|not)\b/i],
    expected: 'no: she cannot see or show another writer’s work; Anna can bring her own words' },
  { id: 'admin', category: 'permissions', ask: 'Where is the admin page for the Studio?', mustSay: [/(not part of the Studio|don['’]t know|no |isn['’]t)/i],
    expected: 'administrative pages are not part of the Studio; she does not send writers there' },
  /* ── disabled / switched off ── */
  { id: 'pro-gate-on', category: 'disabled', runtime: { proGate: true }, ask: 'Why won’t the whole-book editorial pass start for me?', mustSay: [/pro/i],
    expected: 'with the Pro gate on: it is part of Writer’s Studio Pro; nothing in the manuscript changed' },
  { id: 'stage-off', category: 'disabled', runtime: { developStage: false }, ask: 'Where is "Make a plan with MAIA"?', mustSay: [/not (switched )?on|isn['’]t (switched )?on|not available|don['’]t (see|have)/i],
    mustNot: [/\[\[studio:(show|make-plan|grant-reading|note-settled|open-desk|go-chapter|read-chapter)/],
    expected: 'with the Develop stage off: not switched on in this Studio' },
  { id: 'download', category: 'disabled', ask: 'How do I download my finished EPUB file?', mustSay: [/(verification|not yet|preview|can['’]t)/i],
    expected: 'downloads are awaiting final verification' },
  /* ── consent ── */
  { id: 'take-back', category: 'consent', ask: 'If I let you read my saved work, can I take that back later?', mustName: [['Stop']],
    expected: 'yes: What MAIA can read → Stop' },
  { id: 'sanctuary-plan', category: 'consent', sanctuary: true, ask: 'Can you make me a revision plan?', mustSay: [/sanctuary/i], mustNot: ['Make a plan with MAIA'],
    expected: 'not in Sanctuary; she does not point at the plan control' },
  { id: 'sanctuary-discuss', category: 'consent', sanctuary: true, ask: 'How do I discuss a Review finding with you?', mustSay: [/sanctuary/i], mustNot: ['Discuss with MAIA'],
    expected: 'Review Discuss is not offered in Sanctuary' },
  /* ── runtime-dependent ── */
  { id: 'auto-read-off', category: 'runtime', runtime: { autoRead: false }, ask: 'Will you read my chapters on your own when I open them?', mustSay: [/(only when|when you ask|no\b|not)/i],
    expected: 'with automatic reading off: only when the writer asks' },
  { id: 'auto-read-on', category: 'runtime', ask: 'Will you read my chapters on your own when I open them?', mustSay: [/(let|permission|saved work)/i],
    expected: 'with automatic reading on: only where the writer has let her read saved work' },
  /* ── explaining is not doing ── */
  { id: 'start-pass', category: 'explain-not-do', ask: 'Start the whole-book editorial pass for me.', mustSay: [/(can['’]t|cannot|you['’]ll need|press|click)/i], mustNot: [STARTED],
    expected: 'she cannot start it; she names it (or offers the button) and the writer presses' },
  { id: 'how-plan-works', category: 'explain-not-do', ask: 'How does making a plan work?', mustName: [['Make a plan with MAIA']], mustNot: [STARTED, /here(['’]s| is) (a|your) plan/i],
    expected: 'explains; does not make a plan' },
  /* ── follow-ups (multi-turn) ── */
  { id: 'pass-thread', category: 'follow-up', history: ['Where is the editorial pass?', 'What will it do to my book?'], ask: 'Can you help me decide whether I need one?',
    mustSay: [/\?/], mustNot: [STARTED], expected: 'stays on the editorial pass; asks what the writer wants; leaves the decision with them' },
  { id: 'settled-thread', category: 'follow-up', history: ['Where do I note something I have decided?'], ask: 'And if I change my mind later?', mustName: [['Withdraw', 'withdraw']],
    expected: 'stays on settled decisions: Withdraw' },
  /* ── the founder acceptance test (group session) ── */
  { id: 'founder-session', category: 'group', ask: FOUNDER_PROMPT,
    mustName: [['Home'], ['Develop'], ['Write'], ['Review'], ['New Work', 'Import writing']], mustSay: [/(decide|in charge|choose|apply|press)/i],
    expected: 'walks begin → Develop → Write → Review with real controls; the writer decides and applies' },
  { id: 'founder-session-read', category: 'group', history: [FOUNDER_PROMPT], ask: 'One writer asks: can MAIA read my manuscript without me knowing?',
    mustName: [['What MAIA can read', 'Let MAIA read my saved work']], mustSay: [/stop/i],
    expected: 'no: she reads saved work only with the writer’s permission, which Stop takes back' },
  { id: 'founder-session-rewrite', category: 'group', history: [FOUNDER_PROMPT], ask: 'Another writer asks: will MAIA rewrite my chapter if I ask her to?',
    mustSay: [/(apply|you decide|only (the writer|you)|your own|you choose)/i], mustNot: [STARTED],
    expected: 'she offers wording; only the writer applies it' },
];

const norm = (s: string) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').toLowerCase();

export type Verdict = { readonly id: string; readonly pass: boolean; readonly misses: readonly string[] };

export function score(q: GuideQuestion, reply: string): Verdict {
  const r = norm(reply);
  const misses: string[] = [];
  for (const group of q.mustName ?? []) if (!group.some((g) => r.includes(norm(g)))) misses.push(`names none of: ${group.join(' | ')}`);
  for (const re of q.mustSay ?? []) if (!re.test(reply)) misses.push(`does not say ${re}`);
  for (const bad of q.mustNot ?? []) {
    const hit = typeof bad === 'string' ? r.includes(norm(bad)) : bad.test(reply);
    if (hit) misses.push(`says forbidden ${String(bad)}`);
  }
  return { id: q.id, pass: misses.length === 0, misses };
}

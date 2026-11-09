import { type Factory, type World, type Ev } from './contract';

const text = (n: number) => `Chapter ${n} opens with the harbour and ends with a question about the key. `.repeat(3).trim();
export const WORLD = (over: Partial<World> = {}): World => ({
  chapters: Array.from({ length: 9 }, (_, i) => ({ id: `c${i + 1}`, title: ['Harbour', 'Salt', 'The Letter', 'Winter Nets', 'The Crossing', 'Strangers’ Names', 'Return', 'The Quay', 'Smaller'][i], text: text(i + 1) })),
  permission: 'work', viewport: 'desktop', ...over,
});
const STEPS = [
  { kind: 'rewrite' as const, chapter: 'c7', from: 'Chapter 7 opens', to: 'Chapter 7 opens with the light left on, and' },
  { kind: 'rewrite' as const, chapter: 'c5', from: 'Chapter 5 opens', to: 'Chapter 5 opens with the key already slipping, and' },
  { kind: 'rewrite' as const, chapter: 'c6', from: 'Chapter 6 opens', to: 'Chapter 6 opens as before, and' },
];
const proposeAt7 = (): Ev[] => [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'How does 7 connect to 2 and 5?', mentions: ['c2', 'c5'] },
  { t: 'propose', steps: JSON.parse(JSON.stringify(STEPS)), basis: ['c2', 'c5', 'c7'] }];

export interface Law { id: string; statement: string; check: (f: Factory) => string | null }
const fail = (ok: boolean, msg: string) => (ok ? null : msg);

export const LAWS: Law[] = [
  { id: 'D1-text-is-the-default', statement: 'Opening Develop shows the focused chapter’s actual text, not a menu.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }]); return fail(u.textShown === WORLD().chapters[6]!.text, 'the chapter text is not what Develop shows'); } },
  { id: 'D2a-conversation-never-hides-work', statement: 'Asking MAIA never makes the manuscript disappear (desktop).',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'hello', mentions: [] }]); return fail(u.textShown.length > 0 && u.manuscriptShare >= 0.4, 'conversation covered or shrank the work'); } },
  { id: 'D2b-central-not-sidebar', statement: 'The conversation is central, under the work; not a cramped side panel or an overlay.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'hello', mentions: [] }]); return fail(u.conversation.placement === 'central', `conversation placement is ${u.conversation.placement}`); } },
  { id: 'D2c-mobile-keeps-work', statement: 'On mobile the manuscript stays the primary visual while a conversation or tool is open.',
    check: (f) => { const u = f()(WORLD({ viewport: 'mobile' }), [{ t: 'open', chapter: 'c7' }, { t: 'tool', name: 'x' }, { t: 'ask', text: 'hi', mentions: [] }]);
      return fail(u.textShown.length > 0 && u.manuscriptShare >= 0.4 && u.conversation.placement === 'sheet', 'mobile conversation hid or buried the work'); } },
  { id: 'D3-excerpts-in-place', statement: 'A question naming chapters shows the actual excerpts of every named chapter.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'compare', mentions: ['c2', 'c5'] }]); return fail(['c2', 'c5', 'c7'].every((c) => u.excerptsShown.includes(c)), 'named chapters were not shown'); } },
  { id: 'D4a-no-permission-says-so', statement: 'Without permission MAIA says exactly what she can see and uses only that.',
    check: (f) => { const u = f()(WORLD({ permission: 'none' }), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'compare', mentions: ['c2', 'c5'] }]);
      return fail(Boolean(u.notice) && u.basisShown.length === 1 && u.basisShown[0] === 'c7', 'she used or implied more than she had, or did not say'); } },
  { id: 'D4b-no-silent-single-chapter', statement: 'A cross-chapter question is never answered silently from one chapter.',
    check: (f) => { const u = f()(WORLD({ permission: 'none' }), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'compare', mentions: ['c2'] }]); return fail(Boolean(u.notice), 'single-chapter answer with no notice'); } },
  { id: 'D5a-plan-is-editable', statement: 'A proposal is a plan whose steps the writer can edit or remove.',
    check: (f) => { const u = f()(WORLD(), [...proposeAt7(), { t: 'editStep', index: 0, to: 'EDITED' }, { t: 'removeStep', index: 1 }]);
      return fail(u.plan?.steps.length === 2 && (u.plan.steps[0] as { to: string }).to === 'EDITED', 'the plan could not be edited or trimmed'); } },
  { id: 'D5b-plan-compares', statement: 'Each step shows before and after.',
    check: (f) => { const u = f()(WORLD(), proposeAt7()); return fail((u.plan?.compare.length ?? 0) === 3 && u.plan!.compare.every((c) => c.before !== c.after), 'the plan does not show before and after'); } },
  { id: 'D6a-nothing-applies-itself', statement: 'A proposal changes nothing until the writer applies it.',
    check: (f) => { const u = f()(WORLD(), proposeAt7()); return fail(JSON.stringify(u.texts) === JSON.stringify(Object.fromEntries(WORLD().chapters.map((c) => [c.id, c.text]))) && u.plan?.status === 'open', 'the plan changed the manuscript before Apply'); } },
  { id: 'D6b-apply-then-undo-exact', statement: 'Apply changes only the approved steps; Undo restores the manuscript exactly.',
    check: (f) => { const base = Object.fromEntries(WORLD().chapters.map((c) => [c.id, c.text]));
      const a = f()(WORLD(), [...proposeAt7(), { t: 'removeStep', index: 2 }, { t: 'apply' }]);
      if (!a.texts.c7!.includes('light left on') || a.texts.c6 !== base.c6) return 'apply did not change exactly the kept steps';
      const b = f()(WORLD(), [...proposeAt7(), { t: 'removeStep', index: 2 }, { t: 'apply' }, { t: 'undo' }]);
      return fail(JSON.stringify(b.texts) === JSON.stringify(base), 'undo did not restore the manuscript exactly'); } },
  { id: 'D7-stale-plan-refused', statement: 'A plan made against text that has since changed is refused with the reason.',
    check: (f) => { const u = f()(WORLD(), [...proposeAt7(), { t: 'edit', chapter: 'c7', text: 'rewritten elsewhere' }, { t: 'apply' }]);
      return fail(Boolean(u.refusal) && u.plan?.status === 'open' && u.texts.c7 === 'rewritten elsewhere', 'a stale plan was applied or refused without a reason'); } },
  { id: 'D8a-return-restores', statement: 'Leaving and returning restores focus, the conversation and the open plan.',
    check: (f) => { const u = f()(WORLD(), [...proposeAt7(), { t: 'leave' }, { t: 'return' }]); return fail(u.conversation.turns.length === 1 && u.plan?.status === 'open' && u.plan.steps.length === 3 && u.conversation.id === 'c1', 'return lost the conversation or the plan'); } },
  { id: 'D8b-no-reintroduction', statement: 'A returning writer is not re-introduced to MAIA.',
    check: (f) => { const u = f()(WORLD(), [...proposeAt7(), { t: 'leave' }, { t: 'return' }]); return fail(u.intro === false, 'she introduced herself again'); } },
  { id: 'D9-scales-keep-the-thread', statement: 'Moving between whole, chapter and passage never changes room or loses the conversation.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }, { t: 'ask', text: 'x', mentions: [] }, { t: 'scale', to: 'whole' }, { t: 'scale', to: 'passage' }, { t: 'tool', name: 'map' }]);
      return fail(u.room === 'develop' && u.conversation.turns.length === 1, 'a scale or tool change left the room or lost the thread'); } },
  { id: 'D10-starters-never-send', statement: 'A starter fills the composer with the writer’s own sentence; it never sends itself.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'open', chapter: 'c7' }, { t: 'starter', text: 'What is this chapter doing?' }]); return fail(!u.autoSent && u.conversation.turns.length === 0, 'a starter sent itself'); } },
  { id: 'D11-basis-visible', statement: 'Every proposal shows what it rests on.',
    check: (f) => { const u = f()(WORLD(), proposeAt7()); return fail((u.plan?.basis.length ?? 0) > 0, 'a proposal with no basis'); } },
  { id: 'D12-whole-view-is-relationships', statement: 'The whole-work view shows relationships between chapters, not only titles.',
    check: (f) => { const u = f()(WORLD(), [{ t: 'scale', to: 'whole' }]); return fail(u.wholeView === 'relationships', 'the whole-work view is titles only'); } },
  { id: 'D13a-nonfiction-is-not-story', statement: 'A nonfiction writer is offered argument-shaped relationships and questions, never story-only vocabulary.',
    check: (f) => { const u = f()(WORLD({ kind: 'nonfiction' }), [{ t: 'scale', to: 'whole' }]);
      const all = [...u.relationKinds, ...u.starters].join(' ').toLowerCase();
      return fail(/claims/.test(all) && /evidence/.test(all) && !/people|story|plot|character|scene/.test(all), 'nonfiction was offered story vocabulary or no argument vocabulary'); } },
  { id: 'D13b-fiction-keeps-story', statement: 'A fiction writer is offered story-shaped relationships (people, images, promises).',
    check: (f) => { const u = f()(WORLD({ kind: 'fiction' }), [{ t: 'scale', to: 'whole' }]); return fail(/people/.test(u.relationKinds.join(' ')) && /story/.test(u.starters.join(' ').toLowerCase()), 'fiction lost its story vocabulary'); } },
  { id: 'D13c-genre-is-never-inferred', statement: 'An undeclared kind gets neutral wording; the genre is never guessed from the text.',
    check: (f) => { const u = f()(WORLD({ kind: 'undeclared' }), [{ t: 'scale', to: 'whole' }]);
      const all = [...u.relationKinds, ...u.starters].join(' ').toLowerCase(); return fail(!/people|story|claims|evidence|plot|character|scene/.test(all), 'a genre was guessed'); } },
];

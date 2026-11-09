import { makeDevelop, type Factory, type Flags } from './contract';

export interface Candidate { id: string; error: string; mustFail: string; factory: Factory; classifiedCollateral?: Record<string, string> }
const c = (id: string, error: string, mustFail: string, flags: Flags, classifiedCollateral?: Record<string, string>): Candidate =>
  ({ id, error, mustFail, factory: () => makeDevelop(flags), classifiedCollateral });

export const CANDIDATES: Candidate[] = [
  c('DC-1-intent-card-dashboard', 'Develop opens on a menu of cards, not the work (today’s Develop)', 'D1-text-is-the-default', { dashboard: true },
    { 'D2a-conversation-never-hides-work': 'a dashboard shows no manuscript at all, so no conversation can be said to keep it',
      'D2c-mobile-keeps-work': 'a dashboard shows no manuscript on mobile either' }),
  c('DC-2-sidebar-chat', 'the conversation lives in a narrow right-hand panel', 'D2b-central-not-sidebar', { sidebarChat: true }, { 'D2a-conversation-never-hides-work': 'the sidebar shrinks the manuscript below the floor' }),
  c('DC-3-overlay-chat', 'the conversation overlays and hides the text', 'D2a-conversation-never-hides-work', { overlay: true }, { 'D2b-central-not-sidebar': 'an overlay is by definition not central' }),
  c('DC-4-mobile-hides-work', 'on mobile a conversation or tool hides the manuscript', 'D2c-mobile-keeps-work', { mobileHides: true }),
  c('DC-5-no-excerpts', 'a cross-chapter question shows no excerpts of the other chapters', 'D3-excerpts-in-place', { noExcerpts: true }),
  c('DC-5b-silent-single-chapter', 'a cross-chapter question is answered from one chapter with no word about it', 'D4b-no-silent-single-chapter', { silentSingleChapter: true }, { 'D4a-no-permission-says-so': 'no notice is the same defect' }),
  c('DC-6-silent-withheld', 'permission promised, read silently withheld', 'D4a-no-permission-says-so', { silentWithheld: true }, { 'D4b-no-silent-single-chapter': 'no notice is exactly what the silent design does' }),
  c('DC-7-plan-locked', 'a proposal cannot be edited', 'D5a-plan-is-editable', { planLocked: true }, { 'D6b-apply-then-undo-exact': 'a locked plan cannot have its third step removed first' }),
  c('DC-8-no-basis', 'a proposal shows no basis', 'D11-basis-visible', { noBasis: true }),
  c('DC-9-auto-apply', 'a proposal applies itself', 'D6a-nothing-applies-itself', { autoApply: true }, { 'D7-stale-plan-refused': 'an auto-applied plan leaves nothing open to refuse', 'D8a-return-restores': 'the plan is already applied on return', 'D6b-apply-then-undo-exact': 'the removed step was already applied' }),
  c('DC-10-no-undo', 'Apply with no Undo', 'D6b-apply-then-undo-exact', { noUndo: true }),
  c('DC-11-stale-apply', 'a stale plan is applied anyway', 'D7-stale-plan-refused', { staleApply: true }),
  c('DC-12-return-resets', 'leaving resets the conversation and the plan', 'D8a-return-restores', { returnResets: true }, { 'D8b-no-reintroduction': 'a reset conversation re-introduces itself' }),
  c('DC-13-reintroduces', 'she introduces herself again on return', 'D8b-no-reintroduction', { reintroduce: true }),
  c('DC-14-room-change', 'a tool moves the writer to another room and loses the thread', 'D9-scales-keep-the-thread', { roomChange: true }),
  c('DC-15-auto-send-starter', 'a starter sends itself', 'D10-starters-never-send', { autoSendStarter: true }),
  c('DC-17-story-only-studio', 'every writer is offered characters and scenes', 'D13a-nonfiction-is-not-story', { storyOnly: true }, { 'D13c-genre-is-never-inferred': 'story vocabulary offered to an undeclared book is a guess', 'D14a-helper-book-has-its-own-shape': 'a story-only studio offers a helper the wrong vocabulary too' }),
  c('DC-18-genre-guessed', 'the genre is inferred from the text', 'D13c-genre-is-never-inferred', { infersGenre: true }),
  c('DC-19-argument-only-studio', 'every writer is offered claims and evidence, even a novelist', 'D13b-fiction-keeps-story', { argumentOnly: true }, { 'D13c-genre-is-never-inferred': 'argument vocabulary offered to an undeclared book is a guess', 'D14a-helper-book-has-its-own-shape': 'an argument-only studio offers a helper no practices or case stories' }),
  c('DC-20-helper-as-generic-nonfiction', 'a helper’s book is treated as generic nonfiction', 'D14a-helper-book-has-its-own-shape', { genericNonfiction: true }),
  c('DC-21-helper-guessed', 'a helper’s book is inferred from the word client', 'D14b-helper-is-declared-not-guessed', { infersPractitioner: true }),
  c('DC-16-titles-only', 'the whole-work view is a list of titles', 'D12-whole-view-is-relationships', { titlesOnly: true }),
];

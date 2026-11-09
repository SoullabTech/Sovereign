/**
 * WS-DEVELOP-STUDIO · typed OBSERVABLE contract (test double, not an implementation, never a seed). Fictional manuscript only.
 * Types what a writer can observe on the Develop stage and what the manuscript becomes — never component structure.
 */
export type Permission = 'none' | 'chapter' | 'work';
export type Viewport = 'desktop' | 'mobile';
export interface Chapter { id: string; title: string; text: string }
export type Kind = 'fiction' | 'nonfiction' | 'undeclared';
export interface World { chapters: Chapter[]; permission: Permission; viewport: Viewport; kind?: Kind }

export type Step =
  | { kind: 'rewrite'; chapter: string; from: string; to: string }
  | { kind: 'move'; chapter: string; toIndex: number };

export type Ev =
  | { t: 'open'; chapter: string }
  | { t: 'tool'; name: string }
  | { t: 'starter'; text: string }
  | { t: 'ask'; text: string; mentions: string[] }
  | { t: 'propose'; steps: Step[]; basis: string[] }
  | { t: 'editStep'; index: number; to: string }
  | { t: 'removeStep'; index: number }
  | { t: 'apply' }
  | { t: 'undo' }
  | { t: 'edit'; chapter: string; text: string }
  | { t: 'scale'; to: 'whole' | 'chapter' | 'passage' }
  | { t: 'leave' }
  | { t: 'return' };

export interface Plan { steps: Step[]; basis: string[]; status: 'open' | 'applied'; editable: boolean; compare: { before: string; after: string }[] }
export interface UI {
  /** the focused chapter's text as visibly present to the writer ('' = the work is not on screen) */
  textShown: string;
  /** fraction of the screen the manuscript occupies */
  manuscriptShare: number;
  conversation: { id: string; turns: string[]; placement: 'central' | 'sidebar' | 'overlay' | 'sheet' };
  /** chapters whose actual excerpts are displayed next to the answer */
  excerptsShown: string[];
  /** chapters named as what she rests on */
  basisShown: string[];
  /** a plain notice, e.g. what she can and cannot see */
  notice: string | null;
  plan: Plan | null;
  order: string[];
  texts: Record<string, string>;
  /** did anything send to MAIA that the writer did not write and press? */
  autoSent: boolean;
  /** what the whole-work view offers */
  wholeView: 'relationships' | 'titles' | null;
  /** the room the writer is in (changing it loses the thread) */
  room: string;
  intro: boolean;
  refusal: string | null;
  /** the kinds of relationship the whole-work view offers, and the plain-language starters */
  relationKinds: string[];
  starters: string[];
}
export type Develop = (w: World, evs: Ev[]) => UI;
export type Factory = () => Develop;

export interface Flags {
  dashboard?: boolean; sidebarChat?: boolean; overlay?: boolean; autoApply?: boolean; planLocked?: boolean; noUndo?: boolean; returnResets?: boolean;
  autoSendStarter?: boolean; silentSingleChapter?: boolean; silentWithheld?: boolean; titlesOnly?: boolean; mobileHides?: boolean; staleApply?: boolean;
  noBasis?: boolean; roomChange?: boolean; reintroduce?: boolean; noExcerpts?: boolean; storyOnly?: boolean; infersGenre?: boolean; argumentOnly?: boolean;
}

const snapshot = (texts: Record<string, string>, order: string[]) => ({ texts: { ...texts }, order: [...order] });

/** The reference. `flags` switch on exactly ONE wrong design in the candidates. */
export function makeDevelop(flags: Flags = {}): Develop {
  return (w, evs) => {
    let order = w.chapters.map((c) => c.id);
    let texts: Record<string, string> = Object.fromEntries(w.chapters.map((c) => [c.id, c.text]));
    let focus = w.chapters[0]?.id ?? '';
    let turns: string[] = []; let convId = 'c1'; let plan: Plan | null = null; let history: ReturnType<typeof snapshot>[] = [];
    let excerpts: string[] = []; let basis: string[] = []; let notice: string | null = null; let autoSent = false;
    let toolOpen = false; let room = 'develop'; let intro = true; let refusal: string | null = null; let scale: 'whole' | 'chapter' | 'passage' = 'chapter';
    let planVersion = ''; let saved: { focus: string; turns: string[]; plan: Plan | null; convId: string } | null = null; let away = false;
    const sig = () => JSON.stringify(texts);

    for (const e of evs) {
      switch (e.t) {
        case 'open': focus = e.chapter; break;
        case 'tool': toolOpen = true; if (flags.roomChange) room = `tool:${e.name}`; break;
        case 'starter': if (flags.autoSendStarter) { turns.push(e.text); autoSent = true; } break;
        case 'ask': {
          turns.push(e.text); intro = false;
          const named = [...new Set([focus, ...e.mentions])];
          if (w.permission === 'work') { excerpts = flags.noExcerpts ? [focus] : named; basis = named; notice = null; }
          else {
            excerpts = flags.silentSingleChapter ? [focus] : [focus];
            basis = [focus];
            notice = flags.silentWithheld || (e.mentions.length === 0 && w.permission !== 'none') ? null
              : `I can only see ${w.chapters.find((c) => c.id === focus)?.title ?? 'this chapter'} right now. Let me read your saved work to compare chapters.`;
            if (flags.silentSingleChapter) notice = null;
          }
          break;
        }
        case 'propose': {
          plan = { steps: JSON.parse(JSON.stringify(e.steps)) as Step[], basis: flags.noBasis ? [] : e.basis, status: 'open', editable: !flags.planLocked,
            compare: e.steps.map((s) => s.kind === 'rewrite' ? { before: s.from, after: s.to } : { before: `position ${order.indexOf(s.chapter) + 1}`, after: `position ${s.toIndex + 1}` }) };
          planVersion = sig();
          if (flags.autoApply) { history.push(snapshot(texts, order)); applyPlan(); }
          break;
        }
        case 'editStep': if (plan && plan.editable && plan.steps[e.index]?.kind === 'rewrite') (plan.steps[e.index] as Extract<Step, { kind: 'rewrite' }>).to = e.to; if (plan) plan.compare = plan.steps.map((s) => s.kind === 'rewrite' ? { before: s.from, after: s.to } : { before: '', after: '' }); break;
        case 'removeStep': if (plan && plan.editable) { plan.steps.splice(e.index, 1); plan.compare.splice(e.index, 1); } break;
        case 'apply': {
          if (!plan || plan.status === 'applied') break;
          if (!flags.staleApply && planVersion !== sig()) { refusal = 'The text has changed since this plan was made, so it was not applied.'; break; }
          history.push(snapshot(texts, order)); applyPlan(); break;
        }
        case 'undo': if (!flags.noUndo) { const h = history.pop(); if (h) { texts = h.texts; order = h.order; if (plan) plan.status = 'open'; } } break;
        case 'edit': texts[e.chapter] = e.text; break;
        case 'scale': scale = e.to; break;
        case 'leave': saved = { focus, turns: [...turns], plan: plan ? JSON.parse(JSON.stringify(plan)) : null, convId }; away = true; break;
        case 'return':
          if (away && saved && !flags.returnResets) { focus = saved.focus; turns = saved.turns; plan = saved.plan; convId = saved.convId; intro = flags.reintroduce ? true : false; }
          else { turns = []; plan = null; convId = 'c2'; intro = true; }
          away = false; break;
      }
    }
    function applyPlan() {
      if (!plan) return;
      for (const s of plan.steps) {
        if (s.kind === 'rewrite') texts[s.chapter] = (texts[s.chapter] ?? '').replace(s.from, s.to);
        else { order = order.filter((x) => x !== s.chapter); order.splice(s.toIndex, 0, s.chapter); }
      }
      plan.status = 'applied';
    }

    const hasConversation = turns.length > 0 || !flags.dashboard;
    const dash = Boolean(flags.dashboard);
    const textShown = dash ? '' : (texts[focus] ?? '');
    let share = dash ? 0 : 0.58;
    let placement: UI['conversation']['placement'] = 'central';
    if (flags.sidebarChat) { placement = 'sidebar'; if (turns.length > 0) share = 0.3; }
    if (flags.overlay && turns.length > 0) { placement = 'overlay'; share = 0; }
    if (w.viewport === 'mobile') { placement = 'sheet'; share = flags.mobileHides && (turns.length > 0 || toolOpen) ? 0 : 0.55; }
    const finalText = share === 0 && !dash ? '' : textShown;
    const FICTION = { rel: ['people', 'images that return', 'promises and payoffs', 'timeline', 'point of view'], st: ['What is this chapter doing in the story?', 'Where does it lose you?', 'How does it lead into the next chapter?'] };
    const NONFIC = { rel: ['claims', 'evidence for each claim', 'terms defined and used', 'recurring examples', 'objections and answers'], st: ['What is this chapter claiming?', 'Where does the argument lose you?', 'How does it lead into the next chapter?'] };
    const NEUTRAL = { rel: ['what returns', 'what depends on what', 'what is promised and delivered'], st: ['What is this chapter doing in the book?', 'Where does it lose you?', 'How does it lead into the next chapter?'] };
    let declared: Kind = w.kind ?? 'undeclared';
    if (flags.infersGenre && declared === 'undeclared') declared = /harbour|she |he /i.test(w.chapters.map((c) => c.text).join(' ')) ? 'fiction' : 'nonfiction';
    const vocab = flags.argumentOnly ? NONFIC : flags.storyOnly ? FICTION : declared === 'fiction' ? FICTION : declared === 'nonfiction' ? NONFIC : NEUTRAL;
    void hasConversation; void scale;
    return {
      textShown: finalText, manuscriptShare: share,
      conversation: { id: convId, turns, placement: (flags.sidebarChat && w.viewport !== 'mobile') ? 'sidebar' : (flags.overlay && turns.length > 0 && w.viewport !== 'mobile') ? 'overlay' : placement },
      excerptsShown: excerpts, basisShown: basis, notice, plan, order, texts, autoSent,
      wholeView: flags.titlesOnly ? 'titles' : 'relationships', room, intro, refusal, relationKinds: vocab.rel, starters: vocab.st,
    };
  };
}
export const REFERENCE: Factory = () => makeDevelop();

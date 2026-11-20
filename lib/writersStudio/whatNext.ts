/**
 * "What do I do next?" — MAIA's answer from what is on the writer's screen in Write.
 *
 * Why (persona walk 2026-11-19, docs/design/author-studio/jondi-walk): between MAIA's opening questions and her
 * readings, a writer who is easily overwhelmed meets cues in faint small type ("press Edit and select the words") and
 * no way to ask where she is. MAIA's Studio guide (studioGuide.ts) reaches her only inside a conversation, and
 * nothing on screen leads there.
 *
 * ⛔ Computed from screen state only. It reads no manuscript text, sends nothing, keeps nothing and costs nothing, so it
 *    is the same in Sanctuary and before any relationship with MAIA exists.
 * ⛔ She points; she never presses. Every control named here is on screen in the state described, and the test pins each
 *    label to the live UI source so she is never made to name a button that does not exist.
 * ⛔ "Ask MAIA more" only PLACES a question in the conversation's composer. Starters are never sent by themselves
 *    (WorkConversation `initialDraft`); the writer presses Send.
 */

export type WriteScreen = {
  /** The section the writer is on has no words yet. */
  readonly pageEmpty: boolean;
  /** A Work's first page with words in it, where "Show MAIA this page" is offered (firstPageEligible). */
  readonly firstPage: boolean;
  /** The label of the place chosen in the manuscript outline, or null. */
  readonly chosenPlace: string | null;
  /** The chapter has several sections, so the Prose / Edit switch is shown. */
  readonly proseSwitchShown: boolean;
  /** Prose view is on (selection opens nothing until Edit is pressed). */
  readonly proseView: boolean;
  /** The Work is long enough to be a book (letterOfferVisible). */
  readonly isBook: boolean;
  /** The label on this column's whole-Work button, as rendered (a program Work may name it differently). */
  readonly talkWholeLabel: string;
  /** The Work's own words (formVocabulary, founder 2026-11-20): its parts ("stanza") and the Work ("poem"). Absent → neutral. */
  readonly unit?: string;
  readonly units?: string;
};

export type WhatNext = {
  /** What MAIA says: where the writer is and the one next step, naming the control and where it is. */
  readonly say: string[];
  /** The question placed in the conversation composer if the writer wants to ask more. Never sent by itself. */
  readonly ask: string;
};

export const WHAT_NEXT_LABEL = 'What do I do next?';
/* Not "Ask MAIA about this": that label is already Develop's selection offer (DevelopStage), a different act. */
export const WHAT_NEXT_ASK_LABEL = 'Ask MAIA more';
export const WHAT_NEXT_CLOSE_LABEL = 'Got it';

export function whatNextInWrite(s: WriteScreen): WhatNext {
  const say: string[] = [];
  if (s.pageEmpty) {
    say.push('Your page is ready. Click in the middle of the page and start writing. You don’t need me for this part.');
    say.push(`When you’d like to think it through together, press “${s.talkWholeLabel}” here in this column.`);
  } else if (s.firstPage) {
    say.push('You have a first page. When you’d like me to read it, press “Show MAIA this page” here in this column.');
    say.push('I won’t read it until you do.');
  } else if (s.chosenPlace) {
    say.push(`You’ve chosen “${s.chosenPlace}”. Press “Talk about this place” here in this column to work on it with me.`);
  } else if (s.proseSwitchShown && s.proseView) {
    say.push('To work on a passage with me, first press “Edit” at the top of the page.');
    say.push('Then select the words with your mouse. A “Talk with MAIA” button appears beside them.');
  } else {
    say.push('To work on a passage with me, select the words on the page with your mouse. A “Talk with MAIA” button appears beside them.');
    say.push(`To talk about your Work as a whole, press “${s.talkWholeLabel}” here in this column.`);
  }
  if (s.isBook && !s.pageEmpty && !s.firstPage) {
    say.push(`When you want to look at how the ${s.units ?? 'parts'} fit together, choose “Develop” in the top bar.`);
  }
  return {
    say,
    ask: 'I’m in Write and I’m not sure what to do next. In a sentence or two, tell me where I am and the one next step, naming the button and where it is. Don’t start anything for me.',
  };
}

/**
 * Develop (the stage, NEXT_PUBLIC_WS_DEVELOP_STAGE=1, on in production per the 2026-11-09 founder ruling). With the stage off,
 * Develop shows its older map and this helper is not offered at all: it never names a control that is not on screen.
 *
 * ⛔ Readings are never suggested in Sanctuary, nor when Sanctuary cannot be read (fail closed, as every Develop act does).
 * ⛔ It never suggests reading a chapter MAIA already has a reading of (studioGuide's rule).
 */
export type DevelopScreen = {
  /** The chapter on the stage, in the writer's own heading, or null. */
  readonly chapterLabel: string | null;
  readonly reading: 'idle' | 'reading' | 'ready' | 'error';
  /** How many things her ready reading noticed; her reading card (with "Go through what she noticed") shows only when > 0. */
  readonly noticed: number;
  /** The whole-Work editorial pass; 'absent' when its control is not shown. */
  readonly pass: 'none' | 'running' | 'ready' | 'error' | 'absent';
  /** Read at the moment of asking: 'unresolved' when the posture cannot be read on this device. */
  readonly posture: 'ordinary' | 'sanctuary' | 'unresolved';
  /** The Work's own words (formVocabulary, founder 2026-11-20). Absent → neutral ("part", "piece"). They also name the buttons. */
  readonly unit?: string;
  readonly noun?: string;
};

export function whatNextInDevelop(s: DevelopScreen): WhatNext {
  const say: string[] = [];
  const unit = s.unit ?? 'part';
  const wholeButton = `Whole ${s.noun ?? 'piece'} · editorial pass`;
  const here = s.chapterLabel ? `“${s.chapterLabel}”` : `this ${unit}`;
  if (s.posture !== 'ordinary') {
    say.push(s.posture === 'sanctuary'
      ? 'This is a Sanctuary session, so I don’t read or keep anything here.'
      : 'I can’t tell yet whether this session is Ordinary or Sanctuary, so I won’t read anything until you’ve chosen.');
    say.push(`You can still read your ${unit} here. To go back to writing, press “Edit in Write” at the top.`);
  } else if (s.reading === 'reading') {
    say.push(`I’m reading ${here} now. Keep writing or talking; I won’t interrupt.`);
  } else if (s.reading === 'ready') {
    say.push(s.noticed > 0
      ? `I’ve read ${here}. To walk through it with me, press “Go through what she noticed” in my reading, here in this column.`
      : `I’ve read ${here}.`);
    say.push(`To talk about exact words, select them in the ${unit} and press “Ask MAIA about this”.`);
  } else if (s.reading === 'error') {
    say.push(`My reading of ${here} didn’t finish. Nothing in your writing changed.`);
    say.push(`To try again, press “Read this ${unit} with MAIA” at the top.`);
  } else {
    say.push(`You’re looking at ${here}. To hear what I notice in it, press “Read this ${unit} with MAIA” at the top.`);
    say.push(`To look at a different ${unit}, choose it from the menu at the top.`);
  }
  if (s.posture === 'ordinary') {
    if (s.pass === 'running') say.push('I’m also reading your whole Work. Keep this page open until I finish.');
    else if (s.pass === 'ready') say.push(`My letter about your whole Work is ready: press “${wholeButton} ready”.`);
    else if (s.pass === 'none' && s.reading !== 'reading') {
      say.push(`When you want me to read your whole Work, press “${wholeButton}” at the end of the row of ways to explore. You’ll see what it uses before anything starts.`);
    }
    say.push('To change the words themselves, press “Edit in Write” at the top.');
  }
  return {
    say,
    ask: 'I’m in Develop and I’m not sure what to do next. In a sentence or two, tell me where I am and the one next step, naming the button and where it is. Don’t start anything for me.',
  };
}

/** STUDIO-HELP-R1 — maintained instructions, not editorial authority.
 * An inferred topic may select these words. A model may not invent instructions,
 * labels, saved-state claims, destinations, or actions. Sources: handbook 0.9,
 * reviewed 2026-10-08; each topic carries its applicable writing surface.
 */
export const HELP_RELEASE = 'studio-help-r1-20261008';
export const HELP_SURFACES = ['home', 'write', 'passage', 'craft', 'develop', 'review', 'sources', 'unknown'] as const;
export type HelpSurface = typeof HELP_SURFACES[number];
export const HELP_CONTROLS = ['preview', 'markup', 'keep', 'save', 'apply', 'undo', 'next', 'choose'] as const;
export type HelpControl = typeof HELP_CONTROLS[number];
export interface HelpContext {
  surface: HelpSurface;
  view: 'markup' | 'preview' | 'unknown';
  focused: boolean;
  // Availability is not proof of saved/applied state. No manuscript text or IDs.
  controls: HelpControl[];
}
export const UNKNOWN_HELP_CONTEXT: HelpContext = { surface: 'unknown', view: 'unknown', focused: false, controls: [] };
export const SURFACE_LABEL: Record<HelpSurface, string> = {
  home: 'Studio Home', write: 'Write · manuscript', passage: 'Write · Passage Focus',
  craft: 'Develop · Craftsman’s Table', develop: 'Develop', review: 'Review', sources: 'Notes & sources', unknown: 'Studio',
};
export type HelpTopicId =
  | 'start' | 'marks' | 'keep' | 'compose' | 'save' | 'save-disabled' | 'return'
  | 'apply' | 'focus' | 'scope' | 'actions' | 'layout' | 'depth' | 'preferences'
  | 'materials' | 'review' | 'privacy' | 'failure' | 'report';
export interface HelpTopic {
  id: HelpTopicId; title: string; summary: string; keywords: string;
  group: 'Overall' | 'Write' | 'Develop' | 'Review';
  steps: readonly string[]; boundary: string; page?: number;
  illustration?: 'marks' | 'states' | 'focus';
}
export const HELP_TOPICS: readonly HelpTopic[] = [
  { id:'start', title:'Begin with one passage', group:'Overall',
    summary:'Start with a small piece of writing. Keeping it unchanged is a valid result.',
    keywords:'start begin first new work import upload welcome orientation overall',
    steps:['Open the Work you intend to use. At Studio Home, use New Work or Upload / import writing when beginning.',
      'Choose Write to work on your words, Develop to explore what the Work needs, or Review to examine the current version.',
      'For a first session, use sample writing. Try one suggestion, keep or reshape it, read it in context, and check the saved state before leaving.'],
    boundary:'Opening a Work is not proof that MAIA has read it. You do not need to try every feature.', page:4 },
  { id:'marks', title:'Why is a word still crossed out?', group:'Write',
    summary:'Markup keeps changes visible for inspection. A red strikeout alone does not tell you whether you chose the deletion.',
    keywords:'red blue crossed strikethrough strikeout deleted deletion underline markup preview accept accepted still word',
    steps:['On the Craftsman’s Table, select the marked change to see Use this, Keep mine, and the other choices.',
      'Choose Preview at the top of the table to read the currently chosen wording without edit marks.',
      'Return to Markup to inspect or reconsider the change.'],
    boundary:'Preview changes the view. It does not save or apply your version.', page:14, illustration:'marks' },
  { id:'keep', title:'Keep my original wording', group:'Write',
    summary:'Keep mine retains the original for that proposed change. It is not the same as saving a whole version.',
    keywords:'keep mine original restore back stet reject refuse undo suggestion become',
    steps:['On the Craftsman’s Table, select the marked change, then choose Keep mine.',
      'Check the wording and the Canvas confirmation. This choice should not be inferred from MAIA’s conversational agreement.',
      'Use Save my version to retain the settled choice for a later visit.'],
    boundary:'These instructions do not press Keep mine for you. They do not undo a manuscript application.', page:14 },
  { id:'compose', title:'Write my own or a hybrid version', group:'Write',
    summary:'A suggestion can be a starting point, not an answer. You can combine it with your original and your own new wording.',
    keywords:'write own hybrid compose combination edit suggestion modify reshape version wording draft',
    steps:['On the Craftsman’s Table, choose Write here for the focused passage, or Write it for one marked change.',
      'Shape the wording. Finish the open composition using its working-copy confirmation.',
      'Read in Preview, then choose Save my version when you want to retain that version. Apply is a separate decision.'],
    boundary:'Writing in a Craft composition is different from typing directly into the manuscript.', illustration:'states' },
  { id:'save', title:'Is this saved—or applied?', group:'Overall',
    summary:'I cannot confirm a save from a chat message or an old receipt. Check the current writing surface’s saved state.',
    keywords:'save saved saving autosave applied apply difference safe retained did you changes',
    steps:['Direct manuscript writing uses its own saving process. Check the writing view’s save status; do not assume the Craft Apply rule governs direct typing.',
      'In Craft, Save my version retains the working version and its settled choices without applying it to the manuscript.',
      'Apply my version changes the intended manuscript passage. A confirmed application and its Undo control are different from a saved draft.'],
    boundary:'Help does not read your saved-version records. No current saved or applied state is inferred here.', page:7, illustration:'states' },
  { id:'save-disabled', title:'Save my version is unavailable', group:'Write',
    summary:'A disabled Save is not proof that work is saved. There are several possible causes.',
    keywords:'save disabled grey gray grayed greyed unavailable cannot cant saving finish composition',
    steps:['Finish any open Craft composition using its working-copy confirmation.',
      'Check whether a save is still running, the exact version is already saved, or the surface shows a failure or privacy restriction.',
      'If the state remains unclear, keep the tab open and preserve the visible words before reporting the problem.'],
    boundary:'Do not repeatedly click Save or refresh to test whether a save happened.', page:30 },
  { id:'return', title:'Find the version I saved', group:'Write',
    summary:'A saved working version remains distinct from the manuscript until you apply it.',
    keywords:'find saved return reopen recover recovery version history lost missing where previous draft',
    steps:['On the Craftsman’s Table, open Choose passage.',
      'Look under Saved working versions and choose Open saved version for the draft you intended.',
      'Inspect the wording and settled choices before continuing. Do not overwrite a newer manuscript revision blindly.'],
    boundary:'This describes explicitly saved Craft versions, not a guarantee that every unsaved interruption can be recovered.', page:17 },
  { id:'apply', title:'Apply a version—and undo that application', group:'Write',
    summary:'Apply moves your chosen saved wording into the manuscript. Practice the Apply → Undo loop on sample writing first.',
    keywords:'apply applying undo application publish manuscript commit change accept final',
    steps:['Read the chosen version in context and confirm it is your saved version.',
      'Choose Apply my version. Check the application confirmation and the exact passage.',
      'To reverse that application, use its visible Undo control. The saved version remains available.'],
    boundary:'Help performs no Apply or Undo. If completion is uncertain, do not repeat the action; protect the writing and check its status.', page:18, illustration:'states' },
  { id:'focus', title:'Choose a passage or move to the next one', group:'Write',
    summary:'Selecting words identifies a possible focus; Work here establishes where you and MAIA are working.',
    keywords:'next previous move section paragraph passage focus selected select blue stuck work here stay',
    steps:['On the Craftsman’s Table, select words in the manuscript and choose Work here, or use Choose passage.',
      'Check the Focus label and bracket around the intended passage. Choosing a place does not propose an edit.',
      'Use Suggest an edit, Discuss, or Write here beneath the focused passage. Previous passage and Next passage move onward where available.'],
    boundary:'If MAIA keeps discussing the old passage after focus moves, stop the edit request and report the mismatch rather than applying it.', illustration:'focus' },
  { id:'scope', title:'Ask about the chapter instead of this paragraph', group:'Develop',
    summary:'Reading more of the Work is different from editing a larger piece of it.',
    keywords:'chapter whole book manuscript scope read reading broader sections attention look next develop',
    steps:['In the editorial conversation, state the scope and purpose: “Read this chapter for continuity. Do not change the wording.”',
      'Check the reading’s stated coverage. An answer based only on the focused passage is not a chapter reading.',
      'When a reading names a useful place, choose Work here to bring that passage into focus before crafting.'],
    boundary:'This Help question does not commission a manuscript reading. A wider reading does not authorize a wider edit or Apply.' },
  { id:'actions', title:'Did MAIA actually do what I asked?', group:'Develop',
    summary:'An explanation, a proposed edit, a working-copy change and an application are different events.',
    keywords:'maia did actually happened says done talk only command words instructions change not showing conversation action',
    steps:['Look at the copy and the current factual confirmation, not only at MAIA’s reply.',
      '“Working copy updated” concerns the draft. “Saved” concerns a retained version. An application confirmation concerns the manuscript.',
      'Use the documented button when a conversational action is unclear. Not every natural-language instruction is implemented as an executable command.'],
    boundary:'Asking how to do something is not authorization for Help to do it.', page:23 },
  { id:'layout', title:'Balanced, Passage wide, MAIA wide or Stacked?', group:'Overall',
    summary:'Layout rearranges space; it does not change MAIA’s authority, reading scope, or your words.',
    keywords:'layout balanced stacked wide columns resize collapse space divider maia passage',
    steps:['In Write / Passage Focus, Balanced gives roughly equal space to the passage and editorial area.',
      'Passage wide gives more room to the writing. MAIA wide gives more room to the editorial area.',
      'Stacked places the passage above the editorial work in a vertical scrolling layout.'],
    boundary:'These presets belong to Passage Focus. The newer Craftsman’s Table has its own column controls; do not assume a preset changes every surface.' },
  { id:'depth', title:'What does Craft depth change?', group:'Overall',
    summary:'The Craft depth checkbox in Passage Focus shows supplementary explanation tools. It does not make edits stronger.',
    keywords:'craft depth tools why teach advanced checkbox technical deeper explanation show',
    steps:['When a revision is available in Passage Focus, the supplementary tools include Why this works, Teach me why, and Advanced view.',
      'Why this works reveals existing rationale. Opening Teach me why or Advanced view may request a further explanation.',
      'On the initial assistance screen, the checkbox may show no visible difference because those later tools are not present yet.'],
    boundary:'The checkbox itself does not commission a lesson, save anything, or grant broader editing permission.' },
  { id:'preferences', title:'Choose how MAIA helps—not who owns the writing', group:'Overall',
    summary:'Pacing, explanation and edit strength have different jobs. Professional explanations do not authorize heavier rewriting.',
    keywords:'preferences settings expert plain guided intimate mapped strength light heavy permission collaborator witness fonts size spacing',
    steps:['Pacing controls how much is presented at once. Explanation preference controls the language used.',
      'Edit strength controls the permitted extent of one proposal. Paragraph removal and proactive suggestions have separate permissions.',
      'Reading size and line spacing change presentation. Your chosen words and authorship remain the reference.'],
    boundary:'Changing a preference is not an Apply. Help does not change preferences or privacy settings for you.' },
  { id:'materials', title:'Bring notes or sources into an existing Work', group:'Overall',
    summary:'Supporting material can belong beside the writing without becoming manuscript text.',
    keywords:'material materials notes sources add upload import file corbin new insight reference attach',
    steps:['Protect and confirm your current writing before leaving an editing surface.',
      'At Studio Home, use Notes & sources or Bring notes & sources. Bring in a supported file and review its transcription where requested.',
      'Choose the intended Work and Bring this to the Work. Existing Work materials may then offer Use with MAIA here on supported surfaces.'],
    boundary:'The requested in-workbench Materials drawer is not part of this Help release. Adding source material does not insert its words into the manuscript.' },
  { id:'review', title:'Review the version you have now', group:'Review',
    summary:'Review helps examine the current Work. A finding is something to consider, not an instruction to accept an edit.',
    keywords:'review findings proof sources recovery completeness ready publication export comparison before after',
    steps:['Check what was read and whether that reading predates your latest applied changes.',
      'Follow a finding to its exact passage, inspect it in context, and return to Review after deciding what to do.',
      'Recovery, Completeness, Sources, Proof and Ready the Work have different purposes. An unresolved check is not automatically complete.'],
    boundary:'A reading proof is not proof of publication readiness. Inspect the actual exported pages; source verification and permissions are separate.' },
  { id:'privacy', title:'Use Help without sharing your manuscript', group:'Overall',
    summary:'Product Help does not need the book to explain a control.',
    keywords:'privacy sanctuary ordinary data read send share private confidential anonymous model offline',
    steps:['Common Help answers and topics are available without a model request.',
      'When you explicitly ask MAIA to match an unfamiliar help question, only that question and limited interface labels may be sent through the configured service—not your manuscript or editorial history.',
      'With Sanctuary on or unresolved, Help stays with local guide answers. It does not switch privacy settings.'],
    boundary:'Keep private writing and credentials out of Help questions. This Help does not retain a support transcript in the manuscript or a server-side Help history.' },
  { id:'failure', title:'Nothing happened—should I click again?', group:'Overall',
    summary:'Protect the visible writing before troubleshooting. A missing acknowledgment does not tell us whether an operation completed.',
    keywords:'nothing failed failure error stuck waiting spinning slow timeout retry refresh offline broken connection happened unavailable',
    steps:['Look for a pending state, an error, or a completion message. Do not repeat Save, Apply or Undo while the result is uncertain.',
      'Keep the tab open. When needed, preserve the visible draft in a secure local file you control.',
      'Check the correct saved state, then use the support route supplied with your invitation if the result is still unclear.'],
    boundary:'Refresh is not a universal first fix. No guarantee of unsaved recovery is made here.', page:30 },
  { id:'report', title:'Report a problem without sending private writing', group:'Overall',
    summary:'A useful report describes the task, the expected result and what actually appeared.',
    keywords:'report bug support contact problem feedback help human',
    steps:['Note which surface you were using and the control you selected.',
      'Include the visible error and your browser. A screenshot is optional; redact private prose.',
      'Use the beta-note control when available, or the verified support route in your invitation.'],
    boundary:'Do not include passwords, API keys, private client records, or the full manuscript. Help does not invent a support address or send a report automatically.' },
];
export function helpTopic(id: string): HelpTopic | undefined { return HELP_TOPICS.find(t => t.id === id); }

export function surfaceNotice(context: HelpContext, id: HelpTopicId): string | null {
  if (id === 'save' && context.surface === 'write') return 'You are in the direct writing surface. Its save indicator—not the Craft Apply workflow—is the relevant status.';
  if (id === 'marks' && context.surface === 'craft' && context.view === 'markup') return 'Your table is showing Markup. That explains why a removal can remain visible.';
  if (id === 'marks' && context.surface === 'craft' && context.view === 'preview') return 'Your table is showing Preview. If edit marks remain in the chosen text, use Markup to inspect the change and report a mismatch.';
  if (['marks','keep','compose','return','focus','save-disabled'].includes(id) && context.surface !== 'craft') return 'The steps below describe Develop / Craftsman’s Table. Your current surface may use different controls; do not leave unfinished writing to look for them.';
  if (['layout','depth'].includes(id) && context.surface !== 'passage') return 'These controls belong to Write / Passage Focus, not every Studio surface.';
  return null;
}

/**
 * What the "Remove this Work" dialogs say about conversations with MAIA, pinned as LITERAL text (hermetic: no database).
 *
 * The expected strings below are written out in full and are NOT imported from lib/writersStudio/deleteWork.ts, on purpose: this
 * test exists so that a change of wording fails here deliberately and has to be re-decided, rather than following the constant
 * silently. (removalCopyDrift.test.ts is the structural guard against the database; this is the guard on the words.)
 *
 * Why the wording is what it is (post-merge census, 2026-11-06). A Remove deletes the Work row and what cascades from it. For a Work
 * that holds a writing, MOST conversations with MAIA are not among those things:
 *   - the Work's own "Ask MAIA about this work" conversation, once a writing is attached, and the Develop and editing conversations
 *     are bound to the MANUSCRIPT. They carry no Work id and stay when the Work is removed;
 *   - only a conversation that belongs to the Work row itself (opened while the Work held no writing) goes with the Work.
 * So the old goes-list, "its conversations with MAIA", promised an erasure that does not happen. The Remove bodies now name only the
 * second kind in the goes-list, and say where the first kind lives and what ends it in one closing sentence.
 *
 * What the closing sentence does NOT say, deliberately: whether anything can still open those conversations. Some things can (the
 * writing's Develop conversations, and any other Work that holds the writing; some API-only routes), and only the editing
 * conversations stop being offered from a removed Work. A blanket "cannot be opened" or "nothing is left" would be false, so no such
 * wording may appear (see the last describe).
 *
 * The Delete bodies are unchanged and are checked here too: there the writing goes with the Work, and "its conversations with MAIA"
 * is true.
 */
import { REMOVE_MANY_WORK_COPY, deleteConfirmCopy, removeSharedWorkCopy } from '@/lib/writersStudio/deleteWork';

const GOES_LIST_INTRO = 'That removes the Work and what you built inside it: ';
const GOES_LIST = 'what you told MAIA about it, your corrections, its plans, where you left off, its list of materials, its image, and any conversation you had with MAIA about it while it held no writing';
const IRREVERSIBLE = 'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule.';

const STAYS_SINGULAR = 'Your conversations with MAIA about that writing are not part of the Work, so removing the Work does not remove them: they stay with the writing, and deleting the writing deletes them.';
const STAYS_PLURAL = 'Your conversations with MAIA about those writings are not part of the Work, so removing the Work does not remove them: they stay with the writings, and deleting a writing deletes its conversations.';
// The clause added by the founder's ruling of 2026-11-08 (lane record 6.9.5(e)): it follows the retention sentence, in both bodies.
// It says what the Studio SHOWS ("offer"), never what can be reached, so the claims list at the end of this file still holds.
const EDITING_CLAUSE = 'The conversations you worked through passage by passage are among them, and no Work will offer them again.';

const SHARED_WITH_ONE =
  'This writing is also in another of your Works, so it cannot be deleted from here without taking it from there. '
  + 'You can remove this Work instead. That removes the Work and what you built inside it: what you told MAIA about it, your corrections, its plans, where you left off, its list of materials, its image, and any conversation you had with MAIA about it while it held no writing. '
  + 'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule. '
  + 'The writing itself is not deleted: it stays in your other Work. '
  + 'Your conversations with MAIA about that writing are not part of the Work, so removing the Work does not remove them: they stay with the writing, and deleting the writing deletes them. '
  + EDITING_CLAUSE;

const sharedWithMany = (n: number) =>
  `This writing is also in ${n} of your other Works, so it cannot be deleted from here without taking it from there. `
  + 'You can remove this Work instead. That removes the Work and what you built inside it: what you told MAIA about it, your corrections, its plans, where you left off, its list of materials, its image, and any conversation you had with MAIA about it while it held no writing. '
  + 'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule. '
  + 'The writing itself is not deleted: it stays in the other Works that hold it. '
  + 'Your conversations with MAIA about that writing are not part of the Work, so removing the Work does not remove them: they stay with the writing, and deleting the writing deletes them. '
  + EDITING_CLAUSE;

const MANY_WRITINGS =
  'This Work holds more than one writing, so it cannot be deleted from here without choosing which writing to delete. '
  + 'You can remove the Work instead. That removes the Work and what you built inside it: what you told MAIA about it, your corrections, its plans, where you left off, its list of materials, its image, and any conversation you had with MAIA about it while it held no writing. '
  + 'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule. '
  + 'None of the writings is deleted: each stays in any other Work that holds it, or with your other writing that is not in a Work. '
  + 'Your conversations with MAIA about those writings are not part of the Work, so removing the Work does not remove them: they stay with the writings, and deleting a writing deletes its conversations. '
  + EDITING_CLAUSE;

const DELETE_WITH_WRITING =
  'This deletes the Work and its writing: the sections and drafts, the original file it came from, if there is one, and your conversations with MAIA about the writing. '
  + 'It also removes what you built inside the Work: its conversations with MAIA, what you told MAIA about it, your corrections, its plans, where you left off, its list of materials and its image. '
  + 'It cannot be undone and there is no archive. Private backups already taken can still hold a copy until they are retired on their normal schedule.';

const DELETE_EMPTY =
  'This Work has no writing in it. Deleting it removes the Work and what you built inside it: its conversations with MAIA, what you told MAIA about it, your corrections, its plans, where you left off, its list of materials and its image. '
  + 'It cannot be undone, and private backups already taken can still hold a copy until they are retired on their normal schedule.';

/** Every Remove body the member can be shown, labelled. Shared-with-N covers one other Work, two and five. */
const removeBodies = (): Array<{ label: string; body: string; plural: boolean; intro: string }> => [
  { label: 'shared with 1 other Work', body: removeSharedWorkCopy(1).body, plural: false, intro: GOES_LIST_INTRO },
  { label: 'shared with 2 other Works', body: removeSharedWorkCopy(2).body, plural: false, intro: GOES_LIST_INTRO },
  { label: 'shared with 5 other Works', body: removeSharedWorkCopy(5).body, plural: false, intro: GOES_LIST_INTRO },
  { label: 'holds several writings', body: REMOVE_MANY_WORK_COPY.body, plural: true, intro: 'That removes the Work' },
];

describe('the Remove bodies, word for word', () => {
  it('shared with one other Work', () => {
    expect(removeSharedWorkCopy(1).body).toBe(SHARED_WITH_ONE);
  });
  it('shared with two other Works, and with five: only the count and "stays in" change', () => {
    expect(removeSharedWorkCopy(2).body).toBe(sharedWithMany(2));
    expect(removeSharedWorkCopy(5).body).toBe(sharedWithMany(5));
  });
  it('a Work that holds several writings', () => {
    expect(REMOVE_MANY_WORK_COPY.body).toBe(MANY_WRITINGS);
  });
  it('the questions and buttons are the ones the dialogs were already using', () => {
    expect(removeSharedWorkCopy(1).question('T')).toBe('Remove “T” and keep the writing?');
    expect(REMOVE_MANY_WORK_COPY.question('T')).toBe('Remove “T”?');
    expect(removeSharedWorkCopy(1).confirm).toBe('Remove this Work');
    expect(REMOVE_MANY_WORK_COPY.confirm).toBe('Remove this Work');
    expect(removeSharedWorkCopy(1).cancel).toBe('Don’t remove');
  });
});

describe('the closing sentence: where the conversations about the writing live, and what ends them', () => {
  it('every Remove body ENDS with it: the singular one for a shared writing (one, two or five other Works), the plural one for several writings', () => {
    for (const { label, body, plural } of removeBodies()) {
      expect({ label, endsWith: body.endsWith(`${plural ? STAYS_PLURAL : STAYS_SINGULAR} ${EDITING_CLAUSE}`) }).toEqual({ label, endsWith: true });
    }
  });
  it('the singular body never carries the plural sentence, and the plural body never the singular (a Work with one writing says "that writing")', () => {
    for (const { label, body, plural } of removeBodies()) {
      expect({ label, hasOther: body.includes(plural ? STAYS_SINGULAR : STAYS_PLURAL) }).toEqual({ label, hasOther: false });
      expect({ label, count: body.split(plural ? STAYS_PLURAL : STAYS_SINGULAR).length - 1 }).toEqual({ label, count: 1 });
    }
  });
  it('the sentence sits AFTER the goes-list and after the irreversibility sentence, never inside the list', () => {
    for (const { label, body, plural, intro } of removeBodies()) {
      const sentence = plural ? STAYS_PLURAL : STAYS_SINGULAR;
      const listStart = body.indexOf(intro);
      const listEnd = body.indexOf('. It cannot be undone');
      const at = body.indexOf(sentence);
      expect({ label, found: listStart >= 0 && listEnd > listStart && at > listEnd }).toEqual({ label, found: true });
      // The goes-list itself, from its introduction to the full stop that ends it, holds no part of the sentence.
      const list = body.slice(listStart, listEnd);
      expect({ label, inside: /Your conversations|stay with|not part of the Work/.test(list) }).toEqual({ label, inside: false });
    }
  });
  it('the goes-list is followed DIRECTLY by the irreversibility sentence (the retention sentence was not wedged between them)', () => {
    for (const { label, body } of removeBodies()) {
      expect({ label, adjacent: body.includes(`while it held no writing. ${IRREVERSIBLE}`) }).toEqual({ label, adjacent: true });
    }
  });
  it('the sentence is about the member\'s conversations being kept with the writing, and about the exit (deleting the writing), and about nothing else', () => {
    expect(STAYS_SINGULAR.split(/[.:]/).map((part) => part.trim()).filter(Boolean)).toEqual([
      'Your conversations with MAIA about that writing are not part of the Work, so removing the Work does not remove them',
      'they stay with the writing, and deleting the writing deletes them',
    ]);
    expect(STAYS_PLURAL.split(/[.:]/).map((part) => part.trim()).filter(Boolean)).toEqual([
      'Your conversations with MAIA about those writings are not part of the Work, so removing the Work does not remove them',
      'they stay with the writings, and deleting a writing deletes its conversations',
    ]);
  });
});

describe('the editing-conversations clause (ruling 2026-11-08, lane record 6.9.5(e))', () => {
  it('is in every Remove body exactly once, directly after the retention sentence, and is the last thing the dialog says', () => {
    for (const { label, body, plural } of removeBodies()) {
      const sentence = plural ? STAYS_PLURAL : STAYS_SINGULAR;
      expect({ label, count: body.split(EDITING_CLAUSE).length - 1 }).toEqual({ label, count: 1 });
      expect({ label, directlyAfter: body.includes(`${sentence} ${EDITING_CLAUSE}`) && body.endsWith(EDITING_CLAUSE) }).toEqual({ label, directlyAfter: true });
    }
  });
  it('says two things and only two: that the passage-by-passage conversations are among those that stay, and that no Work will offer them again', () => {
    expect(EDITING_CLAUSE.split(/[.,]/).map((part) => part.trim()).filter(Boolean)).toEqual([
      'The conversations you worked through passage by passage are among them',
      'and no Work will offer them again',
    ]);
  });
  it('speaks of what the Studio OFFERS, never of what can be reached: the word is "offer", and none of "open", "reach", "access" or "see" appears in it', () => {
    expect(EDITING_CLAUSE).toContain('offer');
    expect(/\b(open|opened|reach|reached|access|accessible|see|seen|find|found)\b/i.test(EDITING_CLAUSE)).toBe(false);
  });
  it('is not in a Delete body (there the writing goes too, so there is nothing to keep)', () => {
    for (const kind of ['writing', 'empty'] as const) expect(deleteConfirmCopy(kind, 'T').body.includes(EDITING_CLAUSE)).toBe(false);
  });
});

describe('the goes-list of a Remove', () => {
  it('is exactly this, in every Remove body', () => {
    for (const { label, body } of removeBodies()) {
      expect({ label, hasList: body.includes(`${GOES_LIST_INTRO}${GOES_LIST}.`) }).toEqual({ label, hasList: true });
    }
  });
  it('does NOT say "its conversations with MAIA" (that was the claim that was mostly false), nor any plural conversations claim', () => {
    for (const { label, body } of removeBodies()) {
      const list = body.slice(body.indexOf(GOES_LIST_INTRO), body.indexOf('. It cannot be undone'));
      expect({ label, itsConversations: list.includes('its conversations with MAIA') }).toEqual({ label, itsConversations: false });
      expect({ label, plural: /conversations with MAIA/.test(list) }).toEqual({ label, plural: false });
      expect({ label, singular: list.includes('any conversation you had with MAIA about it while it held no writing') }).toEqual({ label, singular: true });
    }
  });
  it('names the Work-level things and nothing the Work does not own: no sections, no drafts, no original file', () => {
    for (const { label, body } of removeBodies()) {
      const list = body.slice(body.indexOf(GOES_LIST_INTRO), body.indexOf('. It cannot be undone'));
      expect({ label, owns: /sections|drafts|original file/i.test(list) }).toEqual({ label, owns: false });
    }
  });
});

describe('no claim about what can still be opened, and none about what is left', () => {
  const claims = [
    /cannot be opened/i,
    /can no longer be opened/i,
    /unreachable/i,
    /no longer (be )?(opened|reached)/i,
    /nothing (is|will be|remains|stays) (left|kept)/i,
    /nothing is left/i,
    /nothing (is |was |will be )?deleted/i,
    /inaccessible/i,
    /gone for good/i,
  ];
  it('no Remove body, question or button makes one', () => {
    const everything = [
      ...removeBodies().map(({ body }) => body),
      removeSharedWorkCopy(1).question('T'), REMOVE_MANY_WORK_COPY.question('T'),
      removeSharedWorkCopy(1).confirm, removeSharedWorkCopy(1).cancel, REMOVE_MANY_WORK_COPY.confirm, REMOVE_MANY_WORK_COPY.cancel,
    ];
    for (const text of everything) for (const claim of claims) expect({ text: text.slice(0, 50), claim: String(claim), matched: claim.test(text) }).toEqual({ text: text.slice(0, 50), claim: String(claim), matched: false });
  });
  it('and none says anything about Save receipts (they do not stay; the old lane record was wrong on that, and the copy must not repeat it)', () => {
    for (const { label, body } of removeBodies()) expect({ label, mentions: /save receipt/i.test(body) }).toEqual({ label, mentions: false });
  });
});

describe('the Delete bodies still say "its conversations with MAIA", because there it is true', () => {
  it('Delete of a Work and its writing', () => {
    expect(deleteConfirmCopy('writing', 'T').body).toBe(DELETE_WITH_WRITING);
  });
  it('Delete of an empty Work', () => {
    expect(deleteConfirmCopy('empty', 'T').body).toBe(DELETE_EMPTY);
  });
  it('both name it in their goes-list, and neither carries the retention sentence (the writing goes with the Work, so nothing about it stays)', () => {
    for (const kind of ['writing', 'empty'] as const) {
      const { body } = deleteConfirmCopy(kind, 'T');
      expect({ kind, goes: body.includes('its conversations with MAIA, what you told MAIA about it') }).toEqual({ kind, goes: true });
      expect({ kind, stays: body.includes(STAYS_SINGULAR) || body.includes(STAYS_PLURAL) }).toEqual({ kind, stays: false });
    }
  });
});

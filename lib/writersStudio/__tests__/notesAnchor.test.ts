import { readFileSync } from 'fs';
import { join } from 'path';
import { anchorFor, anchorLabel } from '../notesClient';

/**
 * NOTES v1 — FR-08 · DEMOTE AND KEEP, made falsifiable.
 *
 * The ruling: when an anchored section is deleted the Note SURVIVES and demotes
 * to manuscript scope, keeping its last-known heading as history and never
 * being reattached by anything but the writer.
 *
 * Every prohibition below is a way for the system to decide, on the writer's
 * behalf, what their thought was about. None of them would throw; all of them
 * would look like helpfulness.
 */

const SECTIONS = [
  { id: 's1', heading: 'The Nature of Change' },
  { id: 's2', heading: 'The Torus of Being' },
];

describe('FR-08 · where a note sits, and whether that place still exists', () => {
  it('an anchored note reads as live', () => {
    const a = anchorFor({ sectionId: 's1', anchorHeading: 'The Nature of Change' }, SECTIONS);
    expect(a).toEqual({ kind: 'live', sectionId: 's1', heading: 'The Nature of Change' });
  });

  it('prefers the LIVE heading over the one recorded at anchor time', () => {
    /* The writer renamed the section after taking the note. The note belongs to
       the section, not to the words its heading had that day. */
    const a = anchorFor({ sectionId: 's1', anchorHeading: 'An older title' }, SECTIONS);
    expect(a).toMatchObject({ kind: 'live', heading: 'The Nature of Change' });
  });

  it('a deleted section demotes the note instead of deleting it', () => {
    /* section_id is null because the database SET NULL; the heading survives. */
    const a = anchorFor({ sectionId: null, anchorHeading: 'The Nature of Change' }, SECTIONS);
    expect(a).toEqual({ kind: 'former', heading: 'The Nature of Change' });
  });

  it('never silently reattaches by matching the heading text', () => {
    /* THE PROHIBITION WITH THE MOST PULL. A section carrying the same heading
       exists right there in the list, and matching it would look like a
       thoughtful restoration. It would be the system deciding the writer's
       thought was about that section. */
    const a = anchorFor({ sectionId: null, anchorHeading: 'The Nature of Change' }, SECTIONS);
    expect(a.kind).toBe('former');
    expect(a).not.toHaveProperty('sectionId');
  });

  it('never moves a note to a neighbouring section', () => {
    const a = anchorFor({ sectionId: null, anchorHeading: 'A section that is gone' }, SECTIONS);
    expect(a).toEqual({ kind: 'former', heading: 'A section that is gone' });
  });

  it('a note that was never anchored is not a demoted one', () => {
    expect(anchorFor({ sectionId: null, anchorHeading: null }, SECTIONS)).toEqual({ kind: 'none' });
  });

  it('says a former anchor as history, and a live one as a place', () => {
    const former = anchorLabel(anchorFor({ sectionId: null, anchorHeading: 'The Nature of Change' }, SECTIONS));
    expect(former).toBe('Previously attached to “The Nature of Change”');

    const live = anchorLabel(anchorFor({ sectionId: 's1', anchorHeading: null }, SECTIONS));
    expect(live).toBe('The Nature of Change');
    expect(live).not.toMatch(/previously/i);

    expect(anchorLabel({ kind: 'none' })).toBeNull();
  });

  it('an unloaded section list is not read as deletion', () => {
    /* A caller that has not loaded sections yet must not make every anchored
       note look demoted — absence of evidence in the instrument is not absence
       in the object. */
    const a = anchorFor({ sectionId: 's1', anchorHeading: 'The Nature of Change' }, []);
    expect(a.kind).toBe('live');
  });
});

describe('FR-08 · the clause that carries the ruling', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database', 'migrations', '20260907000010_writer_notes.sql'),
    'utf8',
  );

  it('section_id is SET NULL, never CASCADE', () => {
    /* One word. manuscript_keeps cascades on section_id and is right to — a
       Keep is an excerpt OF that section. A Note is an excerpt of nothing, and
       CASCADE here would delete the writer's own thinking as a side effect of
       an ordinary prose edit. Pinned because the regression is silent. */
    expect(sql).toMatch(/section_id uuid REFERENCES manuscript_sections\(id\) ON DELETE SET NULL/);
    expect(sql).not.toMatch(/manuscript_sections\(id\) ON DELETE CASCADE/);
  });

  it('the manuscript is the required anchor and the Work is not (FR-07)', () => {
    expect(sql).toMatch(/manuscript_id uuid NOT NULL REFERENCES member_manuscripts\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/living_work_id uuid REFERENCES living_works\(id\) ON DELETE SET NULL/);
    /* A NOT NULL Work would make a note untakeable in two of the Canvas's
       three Work-context states — the lockout FR-07 exists to prevent. */
    expect(sql).not.toMatch(/living_work_id uuid NOT NULL/);
  });

  it('carries no interpretive column for anything but the member to fill', () => {
    for (const forbidden of ['sentiment', 'salience', 'summary', 'score', 'confidence', 'tag', 'kind']) {
      expect(sql.toLowerCase()).not.toMatch(new RegExp(`\\n\\s+${forbidden}\\s`, 'i'));
    }
  });
});

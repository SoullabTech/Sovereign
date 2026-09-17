import { readFileSync } from 'fs';
import { join } from 'path';

const home = readFileSync(join(process.cwd(), 'app/relationships/page.tsx'), 'utf8');
const detail = readFileSync(join(process.cwd(), 'app/relationships/[id]/page.tsx'), 'utf8');
const card = readFileSync(join(process.cwd(), 'components/relationships/RelationshipCard.tsx'), 'utf8');
const nav = readFileSync(join(process.cwd(), 'components/relationships/RelationshipModeNav.tsx'), 'utf8');
const checkin = readFileSync(join(process.cwd(), 'lib/consciousness/relationalCheckin.ts'), 'utf8');

describe('RELATIONSHIPS-UX-01 attentional architecture', () => {
  it('opens with relationship rather than analytics', () => {
    expect(home).toContain('Who is present for you?');
    expect(home).toContain('You do not need to know what it means yet.');
    expect(card).not.toContain('FieldToneIndicator');
    expect(card).not.toContain('checked in');
    expect(card).not.toContain('activeSignals.slice');
  });

  it('organizes one relationship through Now, Story, and Field', () => {
    expect(nav).toContain("now: 'Now'");
    expect(nav).toContain("story: 'Story'");
    expect(nav).toContain("field: 'Field'");
    expect(detail).toContain("useState<RelationshipMode>('now')");
    expect(detail).toContain("mode === 'now'");
    expect(detail).toContain("mode === 'story'");
    expect(detail).toContain("mode === 'field'");
  });

  it('keeps the living encounter primary and MAIA contextual', () => {
    expect(detail).toContain('What is alive between you now?');
    expect(detail).toContain('Begin with what you are sensing');
    expect(detail).toContain('Explore this with MAIA');
    expect(detail).toContain("'relationships:thread'");
  });

  it('reframes history as Story and pattern intelligence as Field', () => {
    expect(detail).toContain('How did you get here?');
    expect(detail).toContain('<RelationshipTimeline entries={entries} />');
    expect(detail).toContain('What seems to happen between you?');
    expect(detail).toContain('Patterns here are working perceptions, not verdicts.');
    expect(detail).toContain('Something MAIA is noticing');
  });

  it('retires the old permanent dashboard sections without deleting capability', () => {
    expect(detail).not.toContain('>Current Field<');
    expect(detail).not.toContain('>Next Movement<');
    expect(detail).not.toContain('Open with a tool');
    expect(detail).not.toContain('Take this to MAIA');
    expect(detail).toContain('/labtools/relational-field?relationshipId=');
    expect(detail).toContain('/labtools/dynamics-map?relationshipId=');
    expect(detail).toContain('/labtools/repair-path?relationshipId=');
  });

  it('allows longitudinal MAIA intelligence without self-confirming hypotheses', () => {
    expect(checkin).toContain('Previous MAIA reflection (hypothesis)');
    expect(checkin).toContain('They may tune your attention');
    expect(checkin).toContain('Do not count a previous MAIA reflection as recurrence.');
    expect(checkin).toContain('A present member report that contradicts prior inference outranks the inference.');
  });
});

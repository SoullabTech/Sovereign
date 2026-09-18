import { readFileSync } from 'fs';
import { join } from 'path';

const home = readFileSync(join(process.cwd(), 'app/relationships/page.tsx'), 'utf8');
const detail = readFileSync(join(process.cwd(), 'app/relationships/[id]/page.tsx'), 'utf8');
const card = readFileSync(join(process.cwd(), 'components/relationships/RelationshipCard.tsx'), 'utf8');
const nav = readFileSync(join(process.cwd(), 'components/relationships/RelationshipModeNav.tsx'), 'utf8');
const modal = readFileSync(join(process.cwd(), 'components/relationships/CreateRelationshipModal.tsx'), 'utf8');
const checkIn = readFileSync(join(process.cwd(), 'components/relationships/CheckInFlow.tsx'), 'utf8');
const checkinEngine = readFileSync(join(process.cwd(), 'lib/consciousness/relationalCheckin.ts'), 'utf8');

describe('RELATIONSHIPS-UX-01 attentional architecture', () => {
  it('opens with relationship rather than analytics', () => {
    expect(home).toMatch(/Who is (present for|here with) you\?/);
    expect(home).toContain('You do not need to know what it means yet.');
    expect(card).not.toContain('FieldToneIndicator');
    expect(card).not.toContain('checked in');
    expect(card).not.toContain('activeSignals.slice');
  });

  it('organizes one relationship through Now, Story, and Field', () => {
    expect(nav).toContain("key: 'now', label: 'Now'");
    expect(nav).toContain("key: 'story', label: 'Story'");
    expect(nav).toContain("key: 'field', label: 'Field'");
    expect(detail).toContain("useState<RelationshipMode>('now')");
    expect(detail).toContain("mode === 'now'");
    expect(detail).toContain("mode === 'story'");
    expect(detail).toContain("mode === 'field'");
  });

  it('keeps the living encounter primary and MAIA contextual', () => {
    expect(detail).toContain('What is alive between you now?');
    expect(detail).toContain('What feels alive about that now?');
    expect(detail).toContain('Talk with MAIA here');
    expect(detail).toContain('Write with MAIA');
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
    expect(checkinEngine).toContain('Previous MAIA reflection (hypothesis)');
    expect(checkinEngine).toContain('They may tune your attention');
    expect(checkinEngine).toContain('Do not count a previous MAIA reflection as recurrence.');
    expect(checkinEngine).toContain('A present member report that contradicts prior inference outranks the inference.');
  });
});

describe('RELATIONSHIPS-UX-02 presence and motion', () => {
  it('turns relationship creation into progressive arrival rather than a single form', () => {
    expect(modal).toContain("type ArrivalStep = 'realm' | 'name' | 'bond' | 'occasion'");
    expect(modal).toContain('Who or what is here?');
    expect(modal).toContain('Who is present?');
    expect(modal).toContain('How do you know');
    expect(modal).toContain('What brings {name} to mind now?');
    expect(modal).toContain('Enter this relationship →');
    expect(modal).toContain('data-arrival-step="name"');
    expect(modal).toContain('data-arrival-step="occasion"');
  });

  it('makes the original occasion part of Now instead of passive metadata', () => {
    expect(detail).toContain("const occasion = relationship.note?.trim() || null");
    expect(detail).toContain('data-relationship-occasion');
    expect(detail).toContain('What brought {relationship.name} into view');
    expect(detail).toContain('What feels alive about that now?');
  });

  it('uses motion to express shifts of attention while honoring reduced-motion preference', () => {
    expect(detail).toContain('AnimatePresence mode="wait"');
    expect(detail).toContain('useReducedMotion');
    expect(nav).toContain('layoutId="relationship-mode-focus"');
    expect(nav).toContain('Ways of attending to this relationship');
    expect(card).toContain('useReducedMotion');
  });

  it('keeps canonical MAIA inside Relationship Space instead of routing the member away', () => {
    expect(detail).toContain("import { OracleConversation } from '@/components/OracleConversation'");
    expect(detail).toContain('presentationMode="contained"');
    expect(detail).toContain('data-relationship-maia');
    expect(detail).toContain("initialShowChatInterface={maiaEntryMode === 'text'}");
    expect(detail).toContain('voiceEnabled');
    expect(detail).not.toContain("router.push('/maia')");
  });

  it('hands relational context to MAIA only after an explicit member gesture', () => {
    expect(detail).toContain("const openMaiaInPlace = (entryMode: 'voice' | 'text')");
    expect(detail).toContain("onClick={() => openMaiaInPlace('voice')}");
    expect(detail).toContain("onClick={() => openMaiaInPlace('text')}");
    expect(detail).toContain('contextId: id');
    expect(detail).toContain('returnTo: `/relationships/${id}`');
  });

  it('keeps check-in experiential rather than rebuilding an analytic dashboard', () => {
    expect(checkIn).toContain('Sense before explaining');
    expect(checkIn).toContain('MAIA reflects');
    expect(checkIn).toContain('Something MAIA is wondering');
    expect(checkIn).toContain('Something to carry');
    expect(checkIn).not.toContain('>Next movement<');
  });
});


describe('RELATIONSHIPS-UX-02-R1 warm relational field', () => {
  it('makes welcome and readable human presence the first visual layer', () => {
    expect(home).toMatch(/data-relational-(warm-field|environment)/);
    expect(home).toContain('Bring someone into view');
    expect(home).toMatch(/bg-\[#f(4eee4|6f1e8)\]/);
    expect(home).toContain('data-relationship-presence');
    expect(home).toContain("text-[#4c4d47]");
  });

  it('keeps system holding fields subordinate to actual relationships', () => {
    expect(home).toContain('isSystemHoldingField');
    expect(home).toContain('visibleRelationships');
    expect(home).toContain('systemHoldingFields');
    expect(home).toContain('Unplaced threads');
    expect(home).toContain('They can remain here until something becomes clear.');
  });

  it('warms Relationship Space without changing Now Story Field or MAIA authority', () => {
    expect(detail).toContain('data-relational-warm-field');
    expect(detail).toContain('bg-[#f4eee4]');
    expect(detail).toContain('bg-[#fffaf3]/95');
    expect(detail).toContain('Stay with {relationship.name}. Speak naturally');
    expect(detail).toContain('MAIA will stay with this relationship as you explore.');
    expect(detail).toContain('presentationMode="contained"');
  });

  it('keeps progressive arrival warm rather than dropping back into a dark modal', () => {
    expect(modal).toContain('data-relational-warm-arrival');
    expect(modal).toContain('bg-[#fffaf3]/98');
    expect(modal).not.toContain('bg-black/72');
  });
});


describe('RELATIONSHIPS-UX-03 relational environment rebuild', () => {
  it('replaces the old stacked-record landing composition with a relational environment', () => {
    expect(home).toContain('data-relational-environment');
    expect(home).toContain('Who is here with you?');
    expect(home).toContain('The relationships you have brought close');
    expect(home).toContain('data-relationship-presence');
    expect(home).not.toContain("import RelationshipCard");
    expect(home).not.toContain('<RelationshipCard');
  });

  it('makes the invitation a first-class part of the environment', () => {
    expect(home).toContain('data-bring-relationship-forward');
    expect(home).toContain('Bring someone into view');
    expect(home).toContain('Begin here →');
  });

  it('uses readable daylight typography rather than low-contrast dark-field copy', () => {
    expect(home).toContain("bg-[#f6f1e8]");
    expect(home).toContain("text-[#304239]");
    expect(home).toContain("text-[#4c4d47]");
    expect(home).toContain('font-medium');
  });

  it('keeps system-generated holding material peripheral to human relationships', () => {
    expect(home).toContain('Unplaced threads');
    expect(home).toContain('They can remain here until something becomes clear.');
    expect(home).not.toContain('People in your life');
  });
});

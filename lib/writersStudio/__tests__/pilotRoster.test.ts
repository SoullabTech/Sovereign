import { readFileSync } from 'fs';
import path from 'path';
import {
  isAdmittedBy, maskEmail, normalizeEmail, parseRosterCsv, planRosterRow,
  type ContactRef, type MemberRef,
} from '../pilotRoster';

const src = (relative: string) => readFileSync(path.join(process.cwd(), relative), 'utf8');
const row = { name: 'A Writer', email: 'Writer@Example.com ' };
const member = (over: Partial<MemberRef> = {}): MemberRef => ({ id: 'm1', email: 'writer@example.com', ...over });
const contact = (over: Partial<ContactRef> = {}): ContactRef => ({
  id: 'c1', email: 'writer@example.com', member_id: 'm1', contact_type: 'beta_tester',
  pipeline_stage: 'active', metadata: { writers_studio_beta: true }, deleted_at: null, ...over,
});

describe('planning: what would make this writer admitted', () => {
  it('already admitted: linked, beta_tester, active, marked', () => {
    expect(planRosterRow(row, [member()], [contact()])).toEqual({ status: 'ADMITTED', memberId: 'm1', contactId: 'c1' });
  });

  it('has an account and no contact: create one, linked to that account', () => {
    expect(planRosterRow(row, [member()], [])).toEqual({ status: 'WOULD_ADMIT', action: 'create_contact', memberId: 'm1' });
  });

  it('THE LABYRINTH CASE: contact exists with their email but is not linked to the account', () => {
    const plan = planRosterRow(row, [member()], [contact({ member_id: null })]);
    expect(plan).toEqual({ status: 'WOULD_ADMIT', action: 'update_contact', memberId: 'm1', contactId: 'c1' });
  });

  it('contact linked but not marked for the Writer pilot is not admitted', () => {
    expect(isAdmittedBy(contact({ metadata: {} }), 'm1')).toBe(false);
    expect(planRosterRow(row, [member()], [contact({ metadata: {} })]).status).toBe('WOULD_ADMIT');
  });

  it('is not admitted when stage, type or deletion say otherwise', () => {
    expect(isAdmittedBy(contact({ pipeline_stage: 'contacted' }), 'm1')).toBe(false);
    expect(isAdmittedBy(contact({ contact_type: 'lead' }), 'm1')).toBe(false);
    expect(isAdmittedBy(contact({ deleted_at: '2026-10-01' }), 'm1')).toBe(false);
    expect(isAdmittedBy(contact({ member_id: 'someone-else' }), 'm1')).toBe(false);
  });

  it('no account yet: records the intent but admits nobody', () => {
    expect(planRosterRow(row, [], [])).toEqual({ status: 'WAITING_FOR_SIGNUP', action: 'create_contact' });
    expect(planRosterRow(row, [], [contact({ member_id: null })])).toEqual({ status: 'WAITING_FOR_SIGNUP', action: 'none', contactId: 'c1' });
  });

  it('matches emails regardless of case and padding', () => {
    expect(planRosterRow(row, [member({ email: ' WRITER@example.COM' })], []).status).toBe('WOULD_ADMIT');
    expect(normalizeEmail('  A@B.C ')).toBe('a@b.c');
  });
});

describe('restraint: it asks a person instead of guessing', () => {
  it('two accounts share the email', () => {
    expect(planRosterRow(row, [member(), member({ id: 'm2' })], [])).toEqual({ status: 'NEEDS_A_PERSON', reason: 'several_members' });
  });
  it('two live contacts match', () => {
    expect(planRosterRow(row, [member()], [contact(), contact({ id: 'c2' })])).toEqual({ status: 'NEEDS_A_PERSON', reason: 'several_contacts' });
  });
  it('a practitioner or partner is not quietly reclassified', () => {
    for (const t of ['practitioner', 'partner', 'press']) {
      expect(planRosterRow(row, [member()], [contact({ contact_type: t, member_id: null })])).toEqual(
        { status: 'NEEDS_A_PERSON', reason: 'contact_has_another_role' });
    }
  });
  it('a churned contact is not quietly reactivated', () => {
    expect(planRosterRow(row, [member()], [contact({ pipeline_stage: 'churned', member_id: null })])).toEqual(
      { status: 'NEEDS_A_PERSON', reason: 'contact_is_churned' });
  });
  it('a deleted contact is ignored, so a new one is created', () => {
    expect(planRosterRow(row, [member()], [contact({ deleted_at: '2026-10-01' })]).status).toBe('WOULD_ADMIT');
  });
  it('an email match alone never yields ADMITTED', () => {
    for (const c of [[], [contact({ member_id: null })], [contact({ metadata: null })]]) {
      expect(planRosterRow(row, [member()], c).status).not.toBe('ADMITTED');
    }
  });
});

describe('the roster file', () => {
  it('parses name,email with quoted names', () => {
    expect(parseRosterCsv('name,email\n"Smith, Jane",Jane@X.org\nBo,bo@y.org\n')).toEqual([
      { name: 'Smith, Jane', email: 'jane@x.org' }, { name: 'Bo', email: 'bo@y.org' }]);
  });
  it('refuses a missing header, a bad email, and a duplicate — without printing the address', () => {
    expect(() => parseRosterCsv('a,b\n1,2')).toThrow('ROSTER_CSV_NEEDS_HEADER');
    expect(() => parseRosterCsv('name,email\nX,not-an-email')).toThrow('ROSTER_CSV_BAD_EMAIL');
    expect(() => parseRosterCsv('name,email\nX,a@b.c\nY,A@B.C')).toThrow('ROSTER_CSV_DUPLICATE');
    try { parseRosterCsv('name,email\nX,secret@private.org\nY,secret@private.org'); } catch (e) {
      expect(String(e)).not.toContain('secret@private.org');
    }
  });
  it('masks an address to a recognisable fragment', () => {
    expect(maskEmail('Jane.Doe@Example.com')).toBe('j***@example.com');
    expect(maskEmail('nonsense')).toBe('***');
  });
});

describe('this tool and the real gate cannot disagree silently', () => {
  it('betaAccessServer admits on exactly the conditions this tool creates', () => {
    const gate = src('lib/writersStudio/betaAccessServer.ts');
    for (const needle of [
      'c.member_id = $1', 'c.deleted_at IS NULL', "c.contact_type = 'beta_tester'",
      "c.pipeline_stage = 'active'", '"writers_studio_beta": true',
    ]) expect(gate).toContain(needle);
  });
  it('the planner touches no database and grants no admin role', () => {
    const mod = src('lib/writersStudio/pilotRoster.ts').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(mod).not.toMatch(/from '@\/lib\/db|from 'pg'|admin_role\s*=/);
  });
});

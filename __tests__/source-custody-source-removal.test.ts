import fs from 'fs';

const read = (path: string) => fs.readFileSync(path, 'utf8');

describe('SOURCE-CUSTODY-PII-01 source removal', () => {
  test('human-record source carriers and one-time importer are gone', () => {
    for (const path of [
      'lib/ganesha/contacts.ts',
      'lib/data/betaTesters.ts',
      'beta-tester-email.md',
      'scripts/source-custody-r3-migrate.ts',
    ]) expect(fs.existsSync(path)).toBe(false);
  });

  test('operational recipients come only from governed ops_contacts custody', () => {
    const helper = read('lib/ops/sourceCustodyContacts.ts');
    expect(helper).toMatch(/import\s*['"]server-only['"]/);
    expect(helper).toMatch(/FROM ops_contacts/);
    expect(helper).toMatch(/source-custody-migration/);
    expect(helper).not.toMatch(/passcode|passkey/i);
    const email = read('lib/services/emailService.ts');
    expect(email).toMatch(/loadGovernedBetaContacts/);
    expect(email).not.toMatch(/lib\/(ganesha\/contacts|data\/betaTesters)/);
  });

  test('campaign scripts no longer distribute or instruct use of legacy passcodes', () => {
    for (const path of [
      'scripts/send-beta-update-email.ts',
      'scripts/send-maia-ready-email.ts',
      'scripts/send-steward-invitation.ts',
    ]) {
      const source = read(path);
      expect(source).toMatch(/loadGovernedBetaContacts/);
      expect(source).not.toMatch(/lib\/ganesha\/contacts|SOULLAB-\[YOURNAME\]|metadata.*passcode/);
    }
  });

  test('production startup no longer depends on deleted source carriers', () => {
    const entrypoint = read('scripts/entrypoint.sh');
    expect(entrypoint).not.toMatch(/source-custody-r3-migrate|Reconciling SOURCE-CUSTODY-PII-01/);
  });
});

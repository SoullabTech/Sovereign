/**
 * GOVERNED_CONTENT is "member-owned content this route does NOT remove"; any table
 * listed there makes automatic account deletion REFUSE. A registered notification
 * device is a token owned by the member alone and is removed with the account, so it
 * must be in OPTIONAL_CLEANUP and never in GOVERNED_CONTENT. (Review finding F3,
 * 2026-11-06: listing it there would have blocked deletion for any member who had
 * ever registered a device, because a revoked row still counts.)
 */
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'app/api/members/delete-account/route.ts'), 'utf8');
const block = (name: string) => {
  const start = source.indexOf(`const ${name}`);
  return source.slice(start, source.indexOf('];', start));
};

describe('account deletion and registered push devices', () => {
  it('does not treat the push-device table as governed content', () => {
    expect(block('GOVERNED_CONTENT')).not.toContain('member_push_devices');
  });

  it('removes the push-device table with the account', () => {
    expect(block('OPTIONAL_CLEANUP')).toContain("table: 'member_push_devices', column: 'member_id'");
  });
});

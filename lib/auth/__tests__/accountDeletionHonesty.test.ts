/** F5 P5-D · account deletion truth must be visible, not merely server-correct. */
import { readFileSync } from 'fs';
import path from 'path';

const route = readFileSync(path.join(process.cwd(), 'app/api/members/delete-account/route.ts'), 'utf8');
const client = readFileSync(path.join(process.cwd(), 'components/account/AccountSettings.tsx'), 'utf8');
const routeCode = route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('F5 P5-D deletion honesty', () => {
  it('makes no advance completeness claim in the canonical route', () => {
    expect(routeCode).not.toMatch(/all associated data|everything.*deleted|permanently deleted/i);
  });

  it('removes the old all-associated-data promise from Settings', () => {
    expect(client).not.toMatch(/Permanently delete your account and all associated data/i);
    expect(client).toMatch(/only complete it when every governed/);
  });

  it('parses non-2xx governed outcomes instead of ignoring them', () => {
    expect(client).toMatch(/const result = await res\.json\(\)/);
    expect(client).toMatch(/setDeleteOutcome\(/);
    expect(client).toMatch(/deleteOutcome\.blocked/);
    expect(client).toMatch(/Request reference:/);
  });

  it('redirects only on explicit durable completion + accountChanged', () => {
    expect(client).toMatch(/res\.ok && result\.state === 'completed' && result\.accountChanged === true/);
  });

  it('keeps server-derived subject authority at the route boundary', () => {
    expect(routeCode).toMatch(/getMemberIdFromRequest\(request\)/);
    expect(routeCode).toMatch(/memberId: claimedMemberId/);
    expect(routeCode).toMatch(/executeAccountErasure\(memberId/);
  });
});

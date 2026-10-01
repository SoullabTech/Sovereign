import { readFileSync } from 'fs';
import path from 'path';
import { matchRule } from '@/config/accessMatrix';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

describe('ADMIN-READ-SOVEREIGNTY-01', () => {
  it('maps every sensitive read surface instead of relying on permissive fallback', () => {
    expect(matchRule('/api/steward/opus-pulse')).toBeDefined();
    expect(matchRule('/api/feedback')).toBeDefined();
    expect(matchRule('/api/supervision/transcript/list')).toBeDefined();
    expect(matchRule('/api/admin/partners/prelude/example')).toBeDefined();
  });

  it('guards Opus Pulse directly with verified steward/admin authority', () => {
    const src = read('app/api/steward/opus-pulse/route.ts');
    expect(src).toMatch(/deriveVerifiedAccess\(request\)/);
    expect(src).toMatch(/role === 'steward' \|\| role === 'admin'/);
  });

  it('keeps feedback POST open while directly admin-gating GET', () => {
    const src = read('app/api/feedback/route.ts');
    const get = src.slice(src.indexOf('export async function GET'));
    expect(get).toMatch(/deriveVerifiedAccess\(request\)/);
    expect(get).toMatch(/roles\.includes\('admin'\)/);
    const post = src.slice(src.indexOf('export async function POST'), src.indexOf('export async function GET'));
    expect(post).not.toMatch(/deriveVerifiedAccess/);
  });

  it('gates supervision transcript reads with the Lab Tools authority', () => {
    const src = read('app/api/supervision/transcript/list/route.ts');
    const get = src.slice(src.indexOf('export async function GET'), src.indexOf('export async function POST'));
    expect(get).toMatch(/requireLabAccess\(\)/);
  });

  it('directly admin-gates partner prelude reads', () => {
    const src = read('app/api/admin/partners/prelude/[id]/route.ts');
    expect(src).toMatch(/deriveVerifiedAccess\(req\)/);
    expect(src).toMatch(/roles\.includes\('admin'\)/);
  });
});

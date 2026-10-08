/** Static defeat-candidate test of the Caddy pre-migration write fence.
 * This does not claim the actual production edge is running the candidate.
 */
import { readFileSync } from 'node:fs';
const content=readFileSync('Caddyfile','utf8');
test('shared deny includes source collection and item routes with all write verbs',()=>{
  expect(content).toMatch(/@source_write_pre_migration_hold\s*\{\s*path \/api\/writers-studio\/sources \/api\/writers-studio\/sources\/\*\s*method POST PUT PATCH\s*\}/);
  expect(content).toMatch(/handle @source_write_pre_migration_hold\s*\{\s*respond "Source writing temporarily unavailable" 423/);
});
test('source delete and read remain outside the added deny',()=>{
  const matcher=content.match(/@source_write_pre_migration_hold\s*\{([^}]+)\}/)?.[1]||'';
  expect(matcher).not.toMatch(/\bGET\b|\bDELETE\b/);
});
test.each([':80','www.soullab.life','maia.soullab.life','soullab.life','api.soullab.life'])(
  '%s imports the same source-write hold',site=>{
    const target=site.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    expect(content).toMatch(new RegExp('(?:^|\\n)'+target+' \\{\\s*import deny_disabled_routes'));
  },
);
test('the source-write hold is part of the common edge snippet, not an app-only flag',()=>{
  const snippetStart=content.indexOf('(deny_disabled_routes) {');
  const fence=content.indexOf('@source_write_pre_migration_hold');
  const sites=content.indexOf(':80 {');
  expect(snippetStart).toBeGreaterThanOrEqual(0);
  expect(fence).toBeGreaterThan(snippetStart);
  expect(fence).toBeLessThan(sites);
});

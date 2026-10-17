/**
 * Standard-private beta: no member-owned manuscript GET may escape the
 * no-store policy. The route list is discovered, not a hand-picked whitelist:
 * adding a new manuscript/development/readings/editorial GET must be reviewed.
 * This is an HTTP guard, NOT encryption-at-rest or runtime tenancy proof.
 */
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';

const REPO=resolve(process.cwd());
const GET_EXPORT=/export\s+async\s+function\s+GET\s*\(/;
const WRAPPED=/return\s+privateWriterNoStore\s*\(\s*await\s+/;
function walk(directory:string):string[]{
 return readdirSync(directory,{withFileTypes:true}).flatMap((d)=>{
  const p=join(directory,d.name);
  if(d.isDirectory())return walk(p);
  return d.isFile() && d.name==='route.ts'?[p]:[];
 });
}
const directories=[
 'app/api/sovereign/manuscripts',
 'app/api/writers-studio/editorial',
];
const getFiles=[
 ...directories.flatMap(d=>walk(resolve(REPO,d))),
 resolve(REPO,'app/api/sovereign/living-works/route.ts'),
].filter(file=>GET_EXPORT.test(readFileSync(file,'utf8'))).sort();

describe('complete owned-Writer GET private cache protections',()=>{
 it('enumerates all 20 currently known member manuscript/Work/editorial GETs',()=>{
  // Prevent a source edit or refactor from quietly reducing the tested surface.
  expect(getFiles).toHaveLength(20);
  expect(new Set(getFiles).size).toBe(20);
 });
 it.each(getFiles.map(f=>[relative(REPO,f),f] as const))(
  '%s wraps EVERY success, denial and error response in private/no-store',
  (_label,file)=>{
   const code=readFileSync(file,'utf8');
   const begin=code.indexOf('export async function GET(');
   expect(begin).toBeGreaterThan(-1);
   const signatureAndReturn=code.slice(begin,begin+410);
   expect(signatureAndReturn).toMatch(WRAPPED);
   expect(code).toContain('privateWriterNoStore');
   // An export-level wrapper must be invoked before route-specific checks.
   expect(signatureAndReturn.indexOf('privateWriterNoStore(await'))
    .toBeGreaterThan(0);
  },
 );
 it('the existing module helper does not conflate no-store with encryption',()=>{
  const code=readFileSync(resolve(REPO,
   'lib/writersStudio/release/privateWriterNoStore.ts'),'utf8');
  expect(code).toContain('private, no-store, max-age=0');
  expect(code).toContain('not data-at-rest encryption');
 });
});

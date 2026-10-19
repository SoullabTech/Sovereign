/**
 * Stage Q strict-proxy Next16 fixture builder.
 * A disposable reduced app assembled from exact current GitHub-checked-out
 * source files; never rewrites the repository or production deployments.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const expected = 'stageq-next16-fictional-only';
if (process.env.STAGE_Q_NEXT16_DISPOSABLE !== expected ||
    process.env.PGHOST !== '127.0.0.1' ||
    Number(process.env.PGPORT) !== 5549 ||
    process.env.PGDATABASE !== 'stageq_next16_fictional' ||
    process.env.PGUSER !== 'stageq_next16_fixture' ||
    !process.env.DATABASE_URL?.includes('127.0.0.1:5549/stageq_next16_fictional')) {
  throw Error('Refusing non-fictional/non-loopback Next16 fixture');
}
const sha = process.env.GITHUB_SHA || 'isolated-local';
const base = path.join(os.tmpdir(), 'soullab-stageq-next16-' + sha.slice(0, 16));
const marker = path.join(base, '.stageq-fixture');
const originals = [
  'proxy.ts',
  'config/accessMatrix.ts',
  'lib/auth/identityAssertions.ts',
  'lib/auth/verifiedAccess.ts',
  'lib/auth/serverSessions.ts',
  'lib/auth/passwordUtils.ts',
  'lib/db/postgres.ts',
  'lib/writersStudio/canonicalStudioRoute.ts',
  'app/api/members/signout/route.ts',
  // Exact PR #1870 password sign-in source and its real auth dependencies.
  'app/api/members/signin/route.ts',
  'lib/auth/rateLimiter.ts',
  'lib/security/authAudit.ts',
  // Actual member-facing source, copied byte-for-byte into disposable Next.
  'app/signin/page.tsx',
  'components/auth/UnifiedAuth.tsx',
  'app/studio/account/page.tsx',
  'components/auth/SignOutIncompleteDialog.tsx',
  'lib/auth/webSignOut.ts',
  'lib/auth/webBiometricOffer.ts',
];
// Preserve the exact small display-name function without loading unrelated
// practitioner/PHI modules into a fictional authentication-only fixture.
const clientsOriginal=fs.readFileSync(path.join(root,'lib/stellium/clients.ts'),'utf8');
const displayFragment=clientsOriginal.match(/export function resolveMemberDisplayName\([\s\S]*?\n\}/);
if(!displayFragment)throw Error('Reviewed display-name resolver extraction failed');
const fixtureFiles = {
  // Unrelated biometric/device dependencies remain inert: only auth code
  // (server routes, resolver, web signout helper, member-facing React pages)
  // is exact source. No client path can call a real external service here.
  'components/ui/Holoflower.tsx': [
    "'use client';",
    'export function Holoflower(_props:any){return <span data-testid="fixture-visual-only" aria-hidden="true"/>}',
  ].join('\n'),
  'lib/auth/biometricAuth.ts': [
    "'use client';",
    'export const biometricAuth={',
    "getBiometricName:()=> 'Touch ID',",
    'getAvailability:async()=>({available:false,platformAvailable:false}),',
    "authenticate:async()=>({success:false,error:'Disabled in fictional fixture'}),",
    'register:async()=>({success:false}),',
    '};',
  ].join('\n'),
  'lib/auth/unifiedBiometry.ts': [
    "'use client';",
    'export const unifiedBiometry={',
    'getAvailability:async()=>({available:false}),',
    "authenticate:async()=>({success:false,error:'Disabled in fictional fixture'}),",
    '};',
  ].join('\n'),
  'lib/auth/deviceTrust.ts': [
    "'use client';",
    '// Device trust is deliberately not registered in fictional UI testing.',
    'export const deviceTrust={trustDevice:async()=>({success:false})};',
  ].join('\n'),
  'lib/features/flags.ts': 'export function getFeatureFlag(_name:string){return false}',
  'lib/utils/feature-flags.ts': 'export function isFeatureEnabled(_name:string){return false}',
  'lib/http/apiBase.ts': [
    "'use client';",
    '// Fixture transport is strictly relative; never fall back to soullab.life.',
    "export function apiUrl(p:string){if(!p.startsWith('/api/'))throw Error('Nonfixture target refused');return p}",
    "export function apiFetch(p:string,init:RequestInit={}){return fetch(apiUrl(p),{credentials:'same-origin',...init})}",
    "export function isNativeCapacitor(){return false}",
    'export function clearAuthState(){',
    "for(const p of ['maia_session_token','memberId','beta_user','explorerId','explorerName','explorerPreferredName','betaOnboardingComplete','signup_completed','maia_session_version'])localStorage.removeItem(p);",
    '}',
  ].join('\n'),
  'app/home/page.tsx': 'export default function Page(){return <main data-testid="fictional-home">Fictional Home</main>}',
  'app/api/auth/whoami/route.ts': [
    "import {NextResponse} from 'next/server';",
    "import {deriveVerifiedAccess} from '@/lib/auth/verifiedAccess';",
    "export const dynamic='force-dynamic';",
    'export async function GET(req:Request){',
    'const resolved=await deriveVerifiedAccess(req as any);',
    "return NextResponse.json({authed:resolved.authenticated},{headers:{'Cache-Control':'no-store'}});",
    '}',
  ].join('\n'),
  'app/api/members/me/route.ts': [
    "import {NextResponse} from 'next/server';",
    "import {deriveVerifiedAccess} from '@/lib/auth/verifiedAccess';",
    "export const dynamic='force-dynamic';",
    'export async function GET(req:Request){',
    'const a=await deriveVerifiedAccess(req as any);',
    "if(!a.authenticated)return NextResponse.json({error:'Not signed in'},{status:401});",
    "return NextResponse.json({member:{id:a.memberId,username:'fixture_member',name:'Fictional member',preferredName:'Fictional member',email:'fixture_member@example.invalid',circleTier:'explorer',onboarded:true,createdAt:'2026-10-19T00:00:00Z',lastSignIn:null}});",
    '}',
  ].join('\n'),
  'app/api/studio/whoami/route.ts': [
    "import {NextResponse} from 'next/server';",
    "export function GET(){return NextResponse.json({identity:null})}",
  ].join('\n'),
  'lib/stellium/clients.ts': displayFragment[0]+'\n',
  'app/layout.tsx': [
    'export default function Layout({children}:{children:React.ReactNode}){',
    'return <html lang="en"><body>{children}</body></html>;',
    '}',
  ].join('\n'),
  'app/page.tsx': 'export default function Page(){return <main>Fictional Stage Q fixture only</main>}',
  'app/writers-studio/page.tsx': [
    "import {headers} from 'next/headers';",
    'export const dynamic="force-dynamic";',
    'export default async function Page(){',
    'const h=await headers();',
    'return <main data-testid="protected-room" data-authed={h.get("x-access-authed")||""}',
    ' data-roles={h.get("x-access-roles")||""} data-member={h.get("x-access-member-id")||""}>',
    'Fictional private room</main>;',
    '}',
  ].join('\n'),
  'app/api/members/undocumented/route.ts': [
    "import {NextResponse} from 'next/server';",
    "export async function GET(){return NextResponse.json({MUST_NOT_BE_REACHABLE:true})}",
  ].join('\n'),
};
function write(relative, data) {
  const full = path.join(base, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, data);
}
if (process.argv[2] === 'cleanup') {
  if (!fs.existsSync(marker)) throw Error('No owned fixture to clean');
  if (fs.readFileSync(marker,'utf8') !== expected) throw Error('Fixture ownership mismatch');
  fs.rmSync(base,{recursive:true,force:true});
  process.stdout.write('Disposable Next16 fixture cleaned\n');
  process.exit(0);
}
if (process.argv[2] !== 'build') throw Error('Expected build or cleanup subcommand');
if (fs.existsSync(base)) throw Error('Fixture path already exists; refusing overwrite: '+base);
fs.mkdirSync(base,{recursive:true,mode:0o700});
write('.stageq-fixture',expected);
const checks=[];
for (const file of originals) {
  const source=path.join(root,file);
  if(!fs.existsSync(source)) throw Error('Missing reviewed source '+file);
  const bytes=fs.readFileSync(source);
  fs.mkdirSync(path.dirname(path.join(base,file)),{recursive:true});
  fs.copyFileSync(source,path.join(base,file));
  const current=crypto.createHash('sha256').update(bytes).digest('hex');
  const copy=crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex');
  if(current!==copy) throw Error('Copy checksum mismatch '+file);
  checks.push({file,sha256:current});
}
for(const [file,data] of Object.entries(fixtureFiles))write(file,data);
write('package.json',JSON.stringify({
  name:'soullab-stageq-next16-fictional',version:'0.0.1',private:true,
  scripts:{build:'next build --webpack',start:'next start'},
},null,2));
write('tsconfig.json',JSON.stringify({
  compilerOptions:{
    target:'ES2022',lib:['dom','dom.iterable','esnext'],
    allowJs:true,skipLibCheck:true,strict:false,noEmit:true,esModuleInterop:true,
    module:'esnext',moduleResolution:'bundler',resolveJsonModule:true,
    isolatedModules:true,jsx:'preserve',incremental:true,
    baseUrl:'.',paths:{'@/*':['./*']},
  },
  include:['**/*.ts','**/*.tsx','.next/types/**/*.ts'],
  exclude:['node_modules'],
},null,2));
write('next.config.js', [
  'module.exports = {',
  '  typescript: { ignoreBuildErrors: true },',
  '  reactStrictMode: true,',
  "  output: 'standalone',",
  '};',
].join('\n'));
fs.symlinkSync(path.join(root,'node_modules'),path.join(base,'node_modules'),'dir');
const manifest={ sourceCommit:sha,sourceFiles:checks,fixtureOnly:Object.keys(fixtureFiles),
  signinHandlerSource: 'exact PR1870 route', authenticationDependencies: 'exact source',
  displayResolverFragmentSha256:crypto.createHash('sha256').update(displayFragment[0]).digest('hex'),
  renderedUISources:['app/signin/page.tsx','components/auth/UnifiedAuth.tsx','app/studio/account/page.tsx','components/auth/SignOutIncompleteDialog.tsx'],
  stubbedOnly:['biometricAuth','unifiedBiometry','deviceTrust','apiBase','Holoflower','featureFlags','fixtureHome','fixtureWhoami'],
  browserTransport:'fictional same-origin only',
  strictMode:true,realNextProxy:true,fullProduct:false,fixturePath:base };
write('STAGE_Q_BUILD_MANIFEST.json',JSON.stringify(manifest,null,2));
process.stdout.write('Building disposable Next16 fixture from '+checks.length+' exact source files\n');
const result=cp.spawnSync(process.execPath,
 [path.join(root,'node_modules/next/dist/bin/next'),'build','--webpack'],{
  cwd:base,env:{...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
    ACCESS_CONTROL_MODE:'strict',AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS:'https://127.0.0.1:3844',
    NEXT_PUBLIC_ROOT_DOMAIN:'stageq-fiction.invalid'},
  encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024,
});
const output=(result.stdout||'')+'\n'+(result.stderr||'');
process.stdout.write(output.slice(-9000));
if(result.status!==0) {
 process.stderr.write('Stage Q disposable Next16 build failed code '+result.status+'\n');
 process.exit(1);
}
if(!fs.existsSync(path.join(base,'.next/BUILD_ID')))throw Error('No real Next build ID');
const buildId=fs.readFileSync(path.join(base,'.next/BUILD_ID'),'utf8').trim();
process.stdout.write('Stage Q disposable Next16 BUILD PASS '+buildId+'\n');
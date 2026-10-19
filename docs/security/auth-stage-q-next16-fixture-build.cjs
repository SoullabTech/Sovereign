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
];
// Preserve the exact small display-name function without loading unrelated
// practitioner/PHI modules into a fictional authentication-only fixture.
const clientsOriginal=fs.readFileSync(path.join(root,'lib/stellium/clients.ts'),'utf8');
const displayFragment=clientsOriginal.match(/export function resolveMemberDisplayName\\([\\s\\S]*?\\n\\}/);
if(!displayFragment)throw Error('Reviewed display-name resolver extraction failed');
const fixtureFiles = {
  'lib/stellium/clients.ts': displayFragment[0]+'\\n',
  'app/layout.tsx': [
    'export default function Layout({children}:{children:React.ReactNode}){',
    'return <html lang="en"><body>{children}</body></html>;',
    '}',
  ].join('\n'),
  'app/page.tsx': 'export default function Page(){return <main>Fictional Stage Q fixture only</main>}',
  'app/signin/page.tsx': 'export default function Page(){return <main data-testid="signin-only">Fictional sign-in doorway</main>}',
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
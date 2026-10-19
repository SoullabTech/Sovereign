/**
 * Stage Q — build disposable real Next16 auth/proxy fixture from byte-exact
 * reviewed code. The sole test stub is a non-authority display-name helper.
 * Full Soullab product build and independently passed strict type-health are
 * separate qualifications; this fixture tests genuine Next routing only.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
if(process.env.STAGE_Q_NEXT_FIXTURE!=='fictional-next16-ci-only')
  throw Error('Refusing non-fictional Next16 fixture setup');
const root=path.resolve(__dirname,'../..');
const target=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'stageq-next16-fictional');
if(fs.existsSync(target))throw Error('Refusing to overwrite existing fixture directory');
const reviewed={
  'proxy.ts':'0c9f42abc46bd55e67b1857d4864e0a42574d2e6',
  'config/accessMatrix.ts':'aefe00f8fd0c96aae5e05a0ca84a9a49e406cd2f',
  'lib/auth/identityAssertions.ts':'e3b982d0ebb71b56bab21c9b9246885ca3cee247',
  'lib/auth/verifiedAccess.ts':'4d03b40ca72ed60cd1ee8d831c1602d382136b02',
  'lib/auth/passwordUtils.ts':'98903d10eeb350c552171bee4b99a05a76603da5',
  'lib/auth/rateLimiter.ts':'e17611b5b1fd6fce793256151884ae0c92d915c2',
  'lib/auth/serverSessions.ts':'e8802184bffc6335558b237a6ac3632df2b81cba',
  'lib/db/postgres.ts':'be8639085eb8190f336590087ea7b5cd2ccc2609',
  'lib/security/authAudit.ts':'4010df2a6fd016a4a436f8509dbfebfe105ab371',
  'lib/writersStudio/canonicalStudioRoute.ts':'10eca9a96a8e34189598e96b1826c56c0ac1c058',
  'app/api/members/signin/route.ts':'aa645135644c7ad7f12516288ceeb1992c50c543',
  'app/api/members/signout/route.ts':'5ef39a974759dc5d4f60bf5bf2eea375c7e7451e',
  'database/migrations/20260119000001_auth_sessions.sql':'62d0183ac47c6b215df10e33fe760a7a1a19cc9f',
  'database/migrations/20260119000004_auth_rate_limits.sql':'9606a3a09304ba40d9ca22633f952db5b8aed676',
  'database/migrations/20260828000001_audit_logs.sql':'1d2381dfe4c829cfca642d3a7e2f0c2d16737390',
};
for(const [file,expected] of Object.entries(reviewed)){
 const actual=cp.execFileSync('git',['hash-object',path.join(root,file)],{cwd:root,encoding:'utf8'}).trim();
 if(actual!==expected)throw Error('Git source changed: '+file+' expected='+expected+' received='+actual);
}
fs.mkdirSync(target);
function write(file,lines){
 const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,Array.isArray(lines)?lines.join('\n')+'\n':lines,{mode:0o600});
}
for(const file of Object.keys(reviewed)){
 if(file.startsWith('database/'))continue;
 const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.copyFileSync(path.join(root,file),dest);
}
// Test-only pure function equivalent. Production stellium/clients imports PHI
// modules unrelated to authentication; this stub grants no identity/authority.
write('lib/stellium/clients.ts',[
 'export function resolveMemberDisplayName(member: Record<string, any> | null | undefined, fallback="Explorer"): string {',
 '  return member?.preferred_name || member?.name || member?.username || fallback;',
 '}',
]);
write('package.json',JSON.stringify({
 name:'stageq-next16-fictional',version:'0.0.1',private:true,
 scripts:{build:'next build --webpack',start:'next start'},
 dependencies:{next:'16.3.8',react:'19.0.0','react-dom':'19.0.0'},
},null,2)+'\n');
write('next.config.js',[
 'module.exports={',
 '  // Runtime-only fixture; full source typecheck passes separately.',
 '  typescript:{ignoreBuildErrors:true},',
 '  reactStrictMode:true,',
 '};',
]);
write('tsconfig.json',JSON.stringify({
 compilerOptions:{
 target:'ES2022',lib:['dom','dom.iterable','esnext'],allowJs:true,skipLibCheck:true,
 strict:false,noEmit:true,esModuleInterop:true,module:'esnext',
 moduleResolution:'bundler',resolveJsonModule:true,isolatedModules:true,
 jsx:'preserve',incremental:true,paths:{'@/*':['./*']},
 plugins:[{name:'next'}],
 },
 include:['next-env.d.ts','**/*.ts','**/*.tsx','.next/types/**/*.ts'],
 exclude:['node_modules'],
},null,2)+'\n');
write('app/layout.tsx',[
 "import type { ReactNode } from 'react';",
 'export default function RootLayout({children}:{children:ReactNode}){',
 ' return <html lang="en"><body>{children}</body></html>;',
 '}',
]);
write('app/page.tsx',[
 'export default function Entry(){',
 ' return <main>Stage Q fictional Next.js 16 authentication fixture</main>;',
 '}',
]);
write('app/signin/page.tsx',[
 'export default function Signin(){',
 ' return <main>Fictional sign-in gate — no real members accepted</main>;',
 '}',
]);
write('app/admin/page.tsx',[
 'export default function Admin(){',
 ' return <main>Fictional admin-only authorization boundary</main>;',
 '}',
]);
write('app/api/sovereign/stageq/route.ts',[
 "import { NextRequest, NextResponse } from 'next/server';",
 "export const dynamic='force-dynamic';",
 'export async function GET(req:NextRequest){',
 ' return NextResponse.json({',
 "  authed:req.headers.get('x-access-authed'),",
 "  memberId:req.headers.get('x-access-member-id'),",
 "  tier:req.headers.get('x-access-tier'),",
 "  roles:req.headers.get('x-access-roles'),",
 "  rule:req.headers.get('x-access-rule'),",
 "  host:req.headers.get('host'),",
 "  forwardedProto:req.headers.get('x-forwarded-proto'),",
 " },{headers:{'Cache-Control':'no-store'}});",
 '}',
]);
fs.symlinkSync(path.join(root,'node_modules'),path.join(target,'node_modules'),'dir');
console.log(JSON.stringify({fixture:target,verifiedSourceBlobs:Object.keys(reviewed).length,
 codeFiles:Object.keys(reviewed).filter(x=>!x.startsWith('database/')),
 note:'Only display-name helper is bounded test stub; real Next proxy, signin, signout and SQL clients preserved'}));

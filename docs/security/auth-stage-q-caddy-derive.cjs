/**
 * Stage Q: derive a loopback-only Caddy site from the ACTUAL reviewed Caddyfile.
 * No production Caddyfile, member host, certificate or deployment is touched.
 * Only permitted substitutions: apex site name, upstream destination, TLS,
 * loopback bind, and access-log location. All access/CORS/Host directives stay.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const markerValue='stageq-caddy-fictional-ci-only';
if(process.env.STAGE_Q_NEXT16_DISPOSABLE!=='stageq-next16-fictional-only'||
 process.env.STAGE_Q_CADDY_DISPOSABLE!==markerValue||
 process.env.PGHOST!=='127.0.0.1'||Number(process.env.PGPORT)!==5549||
 process.env.PGDATABASE!=='stageq_next16_fictional'||
 process.env.PGUSER!=='stageq_next16_fixture'){
 throw Error('Refusing non-fictional Caddy derivation');
}
const sha=process.env.GITHUB_SHA||'isolated-local';
const base=path.join(os.tmpdir(),'soullab-stageq-caddy-'+sha.slice(0,16));
const marker=path.join(base,'.stageq-owned');
const command=process.argv[2];
if(command==='cleanup'){
 if(!fs.existsSync(marker)||fs.readFileSync(marker,'utf8')!==markerValue)
  throw Error('Refusing to clean unowned Caddy fixture');
 fs.rmSync(base,{recursive:true,force:true});
 process.stdout.write('Stage Q owned Caddy fixture removed\n');
 process.exit(0);
}
if(command!=='derive')throw Error('Expected derive or cleanup');
if(fs.existsSync(base))throw Error('Refusing to overwrite existing fixture directory');
const original=fs.readFileSync(path.join(root,'Caddyfile'),'utf8');
const originalBlob=cp.execFileSync('git',['hash-object','Caddyfile'],{cwd:root,encoding:'utf8'}).trim();
if(originalBlob!=='9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69'){
 throw Error('Reviewed Caddyfile blob drift: abort before derivation');
}
const lines=original.split('\n');
function extract(uniqueStart){
 const starts=lines.map((line,index)=>({line,index})).filter(x=>x.line.trim()===uniqueStart);
 if(starts.length!==1)throw Error('Expected exactly one source block: '+uniqueStart);
 let depth=0,opened=false;
 for(let i=starts[0].index;i<lines.length;i++){
  const stripped=lines[i].trim();
  if(stripped.startsWith('#')||!stripped)continue;
  if(stripped.endsWith('{')){depth++;opened=true;}
  if(stripped==='}')depth--;
  if(opened&&depth===0){
   return lines.slice(starts[0].index,i+1).join('\n');
  }
  if(depth<0)throw Error('Unexpected closing brace while extracting '+uniqueStart);
 }
 throw Error('Could not find closing block: '+uniqueStart);
}
const snippet=extract('(deny_disabled_routes) {');
let site=extract('soullab.life {');
if(!site.startsWith('soullab.life {'))throw Error('Wrong site extracted');
if(!site.includes('import deny_disabled_routes'))throw Error('Canonical edge-deny import missing');
// The production file also carries an intentionally DISABLED admin example:
// its commented reverse_proxy/header_up lines are not active policy and must
// not be rewritten or counted as a live upstream.
const activeLines=site.split('\n').filter(line=>!line.trim().startsWith('#'));
const liveSource=activeLines.join('\n');
const upstream=(liveSource.match(/maia-sovereign:3000/g)||[]).length;
const hosts=(liveSource.match(/header_up Host \{host\}/g)||[]).length;
const allUpstreams=(site.match(/maia-sovereign:3000/g)||[]).length;
const allHosts=(site.match(/header_up Host \{host\}/g)||[]).length;
const corsNull=(liveSource.match(/Access-Control-Allow-Origin "null"/g)||[]).length;
if(upstream!==5||hosts!==5||allUpstreams!==6||allHosts!==6||corsNull!==2){
 throw Error('Unexpected canonical Caddy topology: active upstream='+upstream+
 ' active hosts='+hosts+' commented examples='+(allUpstreams-upstream)+
 ' null-CORS='+corsNull);
}
site=site.replace(/^soullab\.life \{/,
 'stageq-next16.invalid {\n    bind 127.0.0.1\n    tls /etc/stageq/fixture.crt /etc/stageq/fixture.key');
site=site.split('\n').map(line=>
 line.trim().startsWith('#')?line:line.replaceAll('maia-sovereign:3000','127.0.0.1:3829')
).join('\n');
const logBlock=[
'    log {',
'        output file /var/log/caddy/access.log {',
'            roll_size 10mb',
'            roll_keep 5',
'        }',
'    }',
].join('\n');
if(site.split(logBlock).length!==2)throw Error('Original access-log block did not match expected');
site=site.replace(logBlock,'    # Access log sink omitted in disposable fixture; no member data present.');
if(!site.includes('header_up Host {host}')||
   !site.includes('header_up X-Forwarded-Proto {scheme}')||
   !site.includes('Access-Control-Allow-Origin "null"')){
 throw Error('Derived Caddy lost a protected forwarding/CORS directive');
}
const config=[
'{',
'    admin off',
'    auto_https disable_redirects',
'}',
'',
'# Exact original deny snippet, unchanged:',
snippet,
'',
'# Original apex site, transformed only under manifest rules:',
site,
'',
].join('\n');
fs.mkdirSync(base,{recursive:true,mode:0o700});
fs.writeFileSync(marker,markerValue,{mode:0o600});
fs.writeFileSync(path.join(base,'Caddyfile'),config,{mode:0o600});
const manifest={
 sourceCommit:sha,
 sourceCaddyBlob:originalBlob,
 sourceCaddySha256:crypto.createHash('sha256').update(original).digest('hex'),
 snippetSha256:crypto.createHash('sha256').update(snippet).digest('hex'),
 transformedApexSha256:crypto.createHash('sha256').update(site).digest('hex'),
 derivedCaddySha256:crypto.createHash('sha256').update(config).digest('hex'),
 upstreamCount:upstream,
 preservedHostHeaderCount:hosts,
 preservedNullCorsHeaders:corsNull,
 modifications:[
  'apex soullab.life -> stageq-next16.invalid',
  'bind only 127.0.0.1:443 inside disposable runner',
  'explicit ephemeral fixture TLS certificate paths',
  'five maia-sovereign:3000 upstreams -> 127.0.0.1:3829',
  'replace access log file block with no member-data access log',
  'disable ACME and automatic redirects in fixture global options',
 ],
 unchangedCanonicalSnippet:true,
 actualCaddyBinaryRequired:true,
 productionChanged:false,
};
fs.writeFileSync(path.join(base,'STAGE_Q_CADDY_CUSTODY.json'),JSON.stringify(manifest,null,2));
console.log('Stage Q Caddy site derived from original blob '+originalBlob+
 ' with '+upstream+' upstream replacements and '+hosts+' preserved Host mappings.');
console.log('Derived fixture path '+base);

/** WS-RUNTIME-NETWORK-01 · Read-only production topology preflight.
 * Never runs docker network connect/disconnect, compose up, restart, exec SQL,
 * reads credentials, or edits any production configuration.
 *
 * Run on the authorized host: node scripts/witness/ws-runtime-network-gate-20261011.cjs
 * Exit 0=topology/health indications pass; exit 2=HOLD; exit 1=audit failure.
 * A PASS here is NOT a full Writer's Studio release certification.
 */
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');

function docker(args) {
  return execFileSync('docker',args,{encoding:'utf8',timeout:10000,
    stdio:['ignore','pipe','pipe']}).trim();
}
function inspect(name) {
  const response=JSON.parse(docker(['inspect',name]));
  assert.equal(response.length,1,'Unexpected container resolution: '+name);
  return response[0];
}
function nets(item) { return Object.keys(item.NetworkSettings?.Networks??{}); }
function composeInputs(item) {
  return String(item.Config?.Labels?.['com.docker.compose.project.config_files']??'').split(',')
    .map(x=>x.split('/').pop()).filter(Boolean);
}
const api=inspect('maia-api'),db=inspect('maia-postgres'),worker=inspect('maia-summary-worker');
const apiNetworks=nets(api),dbNetworks=nets(db),workerNetworks=nets(worker);
const requiredNetwork=apiNetworks.find(x=>x.endsWith('_maia-internal'));
const shared=requiredNetwork&&dbNetworks.includes(requiredNetwork);
const state=api.State?.Health?.Status??'unknown';
const workerState=worker.State?.Status??'unknown';
const checks={
  api:api.Name.replace('/',''),postgres:db.Name.replace('/',''),worker:worker.Name.replace('/',''),
  apiNetworks,postgresNetworks:dbNetworks,workerNetworks,
  apiComposeFiles:composeInputs(api),postgresComposeFiles:composeInputs(db),
  intendedApiInternalNetwork:requiredNetwork??null,
  postgresSharesApiInternalNetwork:Boolean(shared),
  apiDockerHealth:state,
  workerContainerState:workerState,
  workerRestartCount:worker.RestartCount??null,
};
const failures=[];
if(!requiredNetwork)failures.push('API missing maia-internal');
if(!shared)failures.push('Postgres not on API internal network');
if(state!=='healthy')failures.push('API Docker health not healthy');
if(workerState!=='running')failures.push('Summary worker not steadily running');
console.log('WS_RUNTIME_NETWORK_AUDIT',JSON.stringify(checks,null,2));
console.log('RELEASE_GATE',failures.length?'HOLD':'INDICATIONS_PASS');
if(failures.length)console.log('OPEN_FINDINGS',failures.join('; '));
console.log('AUTHORIZATION','Read-only evidence; no network or runtime configuration changed.');
if(failures.length)process.exitCode=2;

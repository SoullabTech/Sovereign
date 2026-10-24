/** LISTEN-09: source-only mobile route contract with no Capacitor/device mutation.
 * Run from the actual source checkout: node tests/listening/listen09_mobile_web_first_witness.cjs
 * No browser, member, remote streaming account or network.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {stripTypeScriptTypes}=require('node:module');
const filename=path.resolve(__dirname,'../../lib/mobile/mobileAllowlist.ts');
const source=fs.readFileSync(filename,'utf8');
const checksum=crypto.createHash('sha256').update(source).digest('hex');
const expected='b8bd498e4ef903b8577abc78232ed1d868fd65642fbcf296ed9765decb19a019';
if(checksum!==expected)throw Error('Mobile route source has changed; do not reuse old classification: '+checksum);
const script=stripTypeScriptTypes(source).replace(/^export\s/gm,'');
const ctx={};vm.createContext(ctx);
vm.runInContext(script+';this.__route={isMobileRoute,isPhoneRoute,isTabletRoute,isWebOnlyRoute,WEB_STUDIO_BASE_URL};',ctx,{timeout:2000});
const h=ctx.__route;
const checks=[
 ['listen-not-shipped-in-capacitor',!h.isMobileRoute('/listen')],
 ['listen-not-native-phone',!h.isPhoneRoute('/listen')],
 ['listen-not-native-tablet',!h.isTabletRoute('/listen')],
 ['listen-not-explicit-web-only',!h.isWebOnlyRoute('/listen')],
 ['native-web-bridge-already-shipped',h.isMobileRoute('/open-web')],
 ['studio-named-as-web-only',h.isWebOnlyRoute('/studio/media')],
 ['bridge-base-is-apex','https://soullab.life'===h.WEB_STUDIO_BASE_URL],
 ['bridge-to-listen-is-exact','https://soullab.life/listen'===h.WEB_STUDIO_BASE_URL+'/listen']
];
const passed=checks.filter(([,v])=>v).length;
console.log(JSON.stringify({sourceSha256:checksum,status:passed===checks.length?'PASS':'HOLD',passed,total:checks.length,checks:checks.map(([name,pass])=>({name,pass}))},null,2));
if(passed!==checks.length)process.exitCode=2;

/**
 * R61: a mobile/web hatch cannot invent, retain or reinterpret the path
 * to which it is sending a member.
 *
 * This deliberately does NOT authenticate a user, decide Studio entitlement,
 * grant a native route or allow cross-origin redirects. It only constructs
 * a same-origin web URL when an explicit, unambiguous path is present.
 *
 * If Next useSearchParams() is null during hydration, or a path is unsafe,
 * expose the explicit Soullab homepage instead of a stale/guessed route.
 */
import {WEB_STUDIO_BASE_URL} from './mobileAllowlist';

export type R61WebHandoff =
 | Readonly<{kind:'verified_destination';href:string}>
 | Readonly<{kind:'homepage';href:typeof WEB_STUDIO_BASE_URL;
   reason:'missing_destination'|'untrusted_destination'}>;

const LIMIT=2048;
// Never pass an ambient URL credential to the external browser, including
// a query-supplied session. Destination URLs are not session transport.
const SENSITIVE_QUERY_KEYS=new Set([
 'token','session','session_token','access_token','refresh_token',
 'authorization','api_key','apikey','secret','password','credential',
 'member_id','memberid','auth_token','id_token',
]);

export function resolveWebHandoffR61(
 raw:string|null|undefined,
):R61WebHandoff{
 const home=(reason:'missing_destination'|'untrusted_destination'):R61WebHandoff=>
  ({kind:'homepage',href:WEB_STUDIO_BASE_URL,reason});
 if(raw===null||raw===undefined||raw==='')return home('missing_destination');
 if(typeof raw!=='string'||raw.length>LIMIT||
    !raw.startsWith('/')||raw.startsWith('//')||
    /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069\\#]/u.test(raw))
  return home('untrusted_destination');
 const queryStart=raw.indexOf('?');
 const route=queryStart>=0?raw.slice(0,queryStart):raw;
 // Normalize nothing; a route with implicit dot traversal or encoded slashes
 // is not an exact member-chosen destination.
 if(!route||route.includes('//')||
   /(^|\/)\.{1,2}(\/|$)/.test(route)||
   /%(?:0[0-9a-f]|1[0-9a-f]|7f|2f|5c|2e|25(?:2f|5c|2e))/i.test(route)||
   /%(?![0-9a-f]{2})/i.test(route))
  return home('untrusted_destination');
 try{
  const url=new URL(raw,WEB_STUDIO_BASE_URL);
  if(url.origin!==WEB_STUDIO_BASE_URL||
    url.protocol!=='https:'||
    url.username!==''||url.password!==''||
    url.pathname!==route||url.hash!=='')
   return home('untrusted_destination');
  for(const key of url.searchParams.keys()){
   if(SENSITIVE_QUERY_KEYS.has(key.toLowerCase()))
    return home('untrusted_destination');
  }
  // The browser handoff is explicitly same-origin, without fragment,
  // credentials, silently normalized path or any unverified fallback.
  return {kind:'verified_destination',href:url.href};
 }catch{
  return home('untrusted_destination');
 }
}

/** Text query params are not trusted account or destination authority. */
export function verifiedWebHandoffLabelR61(
 raw:string|null|undefined,
):string{
 if(!raw||raw.length>80||/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(raw))
  return 'this tool';
 const clean=raw.trim();
 return clean||'this tool';
}

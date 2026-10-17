/**
 * R61: Next 16 nullable searchParams and untrusted mobile→web deep links.
 * A member can open an explicit Soullab route, but a missing/stale/malformed
 * destination must never become an arbitrary or previously visited URL.
 */
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
 resolveWebHandoffR61,verifiedWebHandoffLabelR61,
} from '../resolvedWebHandoffR61';

let mockSearchParams:URLSearchParams|null=null;
const routerPush=jest.fn();
jest.mock('next/navigation',()=>({
 useSearchParams:()=>mockSearchParams,
 useRouter:()=>({push:routerPush}),
}));
import OpenInWebPage from '@/app/open-in-web/page';
import OpenWebPage from '@/app/open-web/page';

const home='https://soullab.life';
const renderInWeb=()=>renderToStaticMarkup(React.createElement(OpenInWebPage));
const renderWeb=()=>renderToStaticMarkup(React.createElement(OpenWebPage));
const setRoute=(key:string,value:string|null)=>{
 mockSearchParams=value===null?null:new URLSearchParams({[key]:value});
};
beforeEach(()=>{mockSearchParams=null;routerPush.mockClear();});
describe('verified, same-origin mobile-to-web route identity',()=>{
 it.each([
  '/studio','/studio/marketing','/writers-studio','/labtools/admin',
  '/studio?tab=write','/studio?tab=write&view=full','/studio/a%20b',
 ] as const)('accepts explicit, canonical same-origin path %s',raw=>{
  expect(resolveWebHandoffR61(raw)).toMatchObject({
   kind:'verified_destination',href:home+raw,
  });
 });
 it.each([
  [null,'missing_destination'],
  [undefined,'missing_destination'],
  ['','missing_destination'],
  ['https://evil.example/studio','untrusted_destination'],
  ['//evil.example/steal','untrusted_destination'],
  ['/\\evil.example','untrusted_destination'],
  ['javascript:alert(1)','untrusted_destination'],
  ['studio','untrusted_destination'],
  ['///studio','untrusted_destination'],
  ['/studio//admin','untrusted_destination'],
  ['/studio/../account','untrusted_destination'],
  ['/./studio','untrusted_destination'],
  ['/studio/%2e%2e/admin','untrusted_destination'],
  ['/studio/%2Fadmin','untrusted_destination'],
  ['/studio/%5cadmin','untrusted_destination'],
  ['/studio/%252fadmin','untrusted_destination'],
  ['/studio%0d%0aSet-Cookie:test','untrusted_destination'],
  ['/studio%xx','untrusted_destination'],
  ['/studio#session=forged','untrusted_destination'],
  ['/studio?token=secrets','untrusted_destination'],
  ['/studio?access_token=secrets','untrusted_destination'],
  ['/studio?session_token=secrets','untrusted_destination'],
  ['/studio?member_id=private','untrusted_destination'],
  ['/studio?password=private','untrusted_destination'],
  ['/studio?API_KEY=private','untrusted_destination'],
  ['/studio\u202Eevil','untrusted_destination'],
  ['/'+'s'.repeat(3000),'untrusted_destination'],
 ] as const)('holds unsafe or absent navigation %s',(input,reason)=>{
  expect(resolveWebHandoffR61(input)).toEqual({
   kind:'homepage',href:home,reason,
  });
 });
 it('untrusted labels cannot mislead or show excessive text',()=>{
  expect(verifiedWebHandoffLabelR61('')).toBe('this tool');
  expect(verifiedWebHandoffLabelR61(null)).toBe('this tool');
  expect(verifiedWebHandoffLabelR61('x'.repeat(250))).toBe('this tool');
  expect(verifiedWebHandoffLabelR61('Workspace\u202Efoo')).toBe('this tool');
  expect(verifiedWebHandoffLabelR61(' Marketing ')).toBe('Marketing');
 });
});
describe('actual mobile web-hatch pages retain no stale destinations',()=>{
 it('unresolved Next params offer an explicit homepage, never guessed Studio',()=>{
  mockSearchParams=null;
  const html=renderInWeb();
  expect(html).toContain('href="https://soullab.life"');
  expect(html).toContain('Open Soullab homepage');
  expect(html).toContain('Continue on Soullab');
  expect(html).not.toContain('href="https://soullab.life/studio');
  const web=renderWeb();
  expect(web).toContain('Open Soullab homepage');
  expect(web).not.toContain('This destination is available');
 });
 it('verified destinations retain their exact deep-link query',()=>{
  setRoute('path','/studio/marketing?tab=write');
  const html=renderInWeb();
  expect(html).toContain('href="https://soullab.life/studio/marketing?tab=write"');
  expect(html).toContain('Open in Web Studio');
  expect(html).toContain('Available in Web Studio');
  setRoute('to','/studio/marketing?tab=write');
  const web=renderWeb();
  expect(web).toContain('Open in Browser');
  expect(web).not.toContain('Open Soullab homepage');
 });
 it('query removal after a valid route never retains the old destination',()=>{
  setRoute('path','/writers-studio');
  expect(renderInWeb()).toContain('https://soullab.life/writers-studio');
  setRoute('path',null);
  expect(renderInWeb()).not.toContain('https://soullab.life/writers-studio');
  setRoute('to','/writers-studio');
  expect(renderWeb()).toContain('Open in Browser');
  setRoute('to',null);
  const missing=renderWeb();
  expect(missing).toContain('Open Soullab homepage');
  expect(missing).not.toContain('This destination is available');
 });
 it('invalid hatch targets are never echoed into the visible UI',()=>{
  setRoute('path','//evil.example/private');
  const html=renderInWeb();
  expect(html).not.toContain('evil.example');
  expect(html).toContain('href="https://soullab.life"');
  setRoute('to','//evil.example/private');
  const other=renderWeb();
  expect(other).not.toContain('evil.example');
  expect(other).toContain('Open Soullab homepage');
 });
 it('display and browser handoff use the same checked target',()=>{
  const src=readFileSync(path.join(process.cwd(),'app/open-web/page.tsx'),'utf8');
  expect(src).toContain("resolveWebHandoffR61(searchParams?.get('to'))");
  expect(src).toContain("window.open(destination.href, '_blank', 'noopener,noreferrer')");
  expect(src).not.toContain('setDestination(');
  const generic=readFileSync(path.join(process.cwd(),'app/open-in-web/page.tsx'),'utf8');
  expect(generic).toContain("resolveWebHandoffR61(params?.get('path'))");
  expect(generic).toContain('href={destination.href}');
  expect(generic).not.toContain('webUrl =');
 });
});

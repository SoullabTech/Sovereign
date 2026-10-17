/**
 * Next 16 usePathname can be null. A missing native route must not become
 * a web-only hatch, an entitled Studio screen or an authorized member route.
 * The web shell remains a pass-through while its router is hydrating.
 */
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {isResolvedMobileRoutePath} from '@/lib/mobile/resolvedMobileRoutePath';

let mockPathname:string|null=null;
let mockNative=false;
const mockPush=jest.fn();
const mockReplace=jest.fn();
jest.mock('next/navigation',()=>({
 usePathname:()=>mockPathname,
 useRouter:()=>({push:mockPush,replace:mockReplace}),
}));
jest.mock('@capacitor/core',()=>({
 Capacitor:{isNativePlatform:()=>mockNative},
}));
import {MobileRouteGuard} from '../MobileRouteGuard';

const prior=Object.getOwnPropertyDescriptor(globalThis,'window');
beforeEach(()=>{
 mockPathname=null;mockNative=false;mockPush.mockClear();mockReplace.mockClear();
 Object.defineProperty(globalThis,'window',{
  value:{},writable:true,configurable:true,
 });
});
afterAll(()=>{
 if(prior)Object.defineProperty(globalThis,'window',prior);
 else Reflect.deleteProperty(globalThis,'window');
});
const render=()=>renderToStaticMarkup(
 React.createElement(MobileRouteGuard,null,
  React.createElement('div',{'data-author-writing':'yes'},'Private test Work')),
);

describe('resolved mobile route precondition',()=>{
 it.each([
  [null,false],['',false],['maia',false],
  ['https://untrusted.example/path',false],
  ['//untrusted.example',false],
  ['/',true],['/enter',true],['/maia',true],
  ['/writers-studio',true],['/open-web?to=%2Fstudio',true],
 ] as const)('%s is known path=%s', (input,expected)=>{
  expect(isResolvedMobileRoutePath(input)).toBe(expected);
 });
 it('unknown path on native never renders children or opens web-only fallback',()=>{
  mockNative=true;
  mockPathname=null;
  expect(render()).toBe('');
  expect(mockReplace).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
  mockPathname='//external.invalid';
  expect(render()).toBe('');
 });
 it('non-native web route remains an immediate pass-through during hydration',()=>{
  mockNative=false;
  mockPathname=null;
  expect(render()).toContain('Private test Work');
  expect(render()).not.toContain('Open in Web Studio');
  expect(mockReplace).not.toHaveBeenCalled();
 });
 it('native known route continues to wait for entitlement check instead of flashing writing',()=>{
  mockNative=true;
  mockPathname='/studio';
  expect(render()).not.toContain('Private test Work');
 });
 it('the render-time refusal precedes inherited allow and web-only rendering',()=>{
  const source=readFileSync(join(process.cwd(),
   'components/mobile/MobileRouteGuard.tsx'),'utf8');
  const guard=source.lastIndexOf('if (!isResolvedMobileRoutePath(pathname))');
  const checking=source.lastIndexOf("if (state === 'checking')");
  const hatch=source.lastIndexOf("if (state === 'web-only')");
  expect(guard).toBeGreaterThan(0);
  expect(checking).toBeGreaterThan(guard);
  expect(hatch).toBeGreaterThan(checking);
  expect(source).toContain("return isNativePlatform() ? null : <>{children}</>;");
 });
});

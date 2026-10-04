/** @jest-environment jsdom */
import { createElement, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { usePathname } from 'next/navigation';
import { isFeatureEnabled } from '../../utils/feature-flags';
import { requireFounder } from '../../founder/founderAuth';
import { isConstellationFounderPath, shouldShowFounderShell } from '../../founder/constellationShell';
import FounderLayout from '../../../app/founder/layout';
import ConstellationLayout from '../../../app/founder/constellation/layout';

jest.mock('next/navigation', () => ({usePathname: jest.fn()}));
jest.mock('../../utils/feature-flags', () => ({isFeatureEnabled: jest.fn()}));
jest.mock('../../../hooks/useMediaQuery', () => ({useMediaQuery: () => false}));
jest.mock('../../founder/founderAuth', () => ({requireFounder: jest.fn()}));
jest.mock('next/link', () => ({__esModule:true, default: (props: Record<string,unknown>) => {
  const React = require('react'); return React.createElement('a', props);
}}));
let root: Root; let host: HTMLDivElement;
beforeEach(()=>{
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT:boolean }).IS_REACT_ACT_ENVIRONMENT=true;
  host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);
  (isFeatureEnabled as jest.Mock).mockReturnValue(false);
});
afterEach(()=>{act(()=>root.unmount());host.remove();jest.clearAllMocks();});

describe('C8 actual founder shell with the legacy flag off',()=>{
  it.each(['/founder/constellation','/founder/constellation/work','/founder/constellation/pilot'])('renders %s instead of the feature-flag dead end',path=>{
    (usePathname as jest.Mock).mockReturnValue(path);
    act(()=>root.render(createElement(FounderLayout,{children:createElement('p',null,'Authorized child fixture')})));
    expect(host.textContent).toContain('Authorized child fixture');
    expect(host.textContent).not.toContain('Founder console is not enabled.');
    expect(host.querySelector('a[href="/founder/constellation/pilot"]')).not.toBeNull();
    expect(host.querySelector('a[href="/founder/content"]')).toBeNull();
  });
  it.each(['/founder/today','/founder/content','/founder/constellation-other'])('does not activate unrelated route %s',path=>{
    (usePathname as jest.Mock).mockReturnValue(path);
    act(()=>root.render(createElement(FounderLayout,{children:'must remain hidden'})));
    expect(host.textContent).toContain('Founder console is not enabled.');
    expect(host.textContent).not.toContain('must remain hidden');
  });
  it.each([null,undefined,'','/founder/constellationevil','/founder/constellation?next=/private'])('does not widen the exact presentation path for %j',path=>{
    expect(isConstellationFounderPath(path)).toBe(false);
    expect(shouldShowFounderShell(path,false)).toBe(false);
  });
  it('keeps the old enabled-founder-console behavior',()=>{
    expect(shouldShowFounderShell('/founder/today',true)).toBe(true);
  });
  it.each([401,403])('whole subtree refuses status %s without rendering its children',async status=>{
    (requireFounder as jest.Mock).mockResolvedValue({ok:false,status,error:'not allowed'});
    const element=await ConstellationLayout({children:createElement('p',null,'PRIVATE CHILD')});
    act(()=>root.render(element));
    expect(host.textContent).not.toContain('PRIVATE CHILD');
    expect(host.textContent).toContain('Sign in to your workspace');
    expect(host.querySelector('a')?.getAttribute('href')).toContain('next=%2Ffounder%2Fconstellation%2Fwork');
  });
  it('whole subtree renders its children after verified founder authorization',async()=>{
    (requireFounder as jest.Mock).mockResolvedValue({ok:true,memberId:'synthetic-founder'});
    const element=await ConstellationLayout({children:createElement('p',null,'AUTHORIZED CHILD')});
    act(()=>root.render(element));
    expect(host.textContent).toContain('AUTHORIZED CHILD');
    expect(requireFounder).toHaveBeenCalledTimes(1);
  });
});

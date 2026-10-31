/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { AccountMenu } from '../AccountMenu';

const replace = jest.fn();
const apiFetch = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children) }));
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: (...args: unknown[]) => apiFetch(...args) }));
jest.mock('../account-menu.module.css', () => ({ __esModule: true, default: new Proxy({}, { get: (_t, key) => String(key) }) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const ROOT = join(__dirname, '..', '..', '..');
let root: Root, container: HTMLDivElement;
const flush = () => act(async () => { await Promise.resolve(); });
const cog = () => container.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement;
const items = () => Array.from(container.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
const openMenu = () => act(() => cog().click());

beforeEach(() => {
  replace.mockReset(); apiFetch.mockReset();
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  act(() => root.render(React.createElement(AccountMenu)));
});
afterEach(() => { act(() => root.unmount()); container.remove(); localStorage.clear(); });

describe('House account menu', () => {
  it('is a labelled cog that starts closed', () => {
    expect(cog().getAttribute('aria-label')).toBe('Settings and sign out');
    expect(cog().getAttribute('aria-expanded')).toBe('false');
    expect(items()).toHaveLength(0);
  });

  it('offers Settings, Security and Sign out, linking only to pages that exist', () => {
    openMenu();
    expect(items().map(i => i.textContent)).toEqual(['Settings', 'Security', 'Sign out']);
    for (const href of ['/account/settings', '/account/security']) {
      expect(items().some(i => i.getAttribute('href') === href)).toBe(true);
      expect(existsSync(join(ROOT, 'app', href, 'page.tsx'))).toBe(true);
    }
  });

  it('closes on Escape', () => {
    openMenu();
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(items()).toHaveLength(0);
  });

  it('ends the SERVER session, clears local keys, then goes to sign-in', async () => {
    localStorage.setItem('beta_user', 'x');
    apiFetch.mockResolvedValue({ ok: true });
    openMenu();
    await act(async () => { items()[2].click(); });
    await flush();
    expect(apiFetch).toHaveBeenCalledWith('/api/members/signout', { method: 'POST' });
    expect(localStorage.getItem('beta_user')).toBeNull();
    expect(replace).toHaveBeenCalledWith('/signin');
  });

  it('does NOT walk a still-signed-in member to sign-in when the server refuses, and says so', async () => {
    localStorage.setItem('beta_user', 'x');
    apiFetch.mockResolvedValue({ ok: false });
    openMenu();
    await act(async () => { items()[2].click(); });
    await flush();
    expect(replace).not.toHaveBeenCalled();
    expect(localStorage.getItem('beta_user')).toBe('x');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('try again');
  });

  it('treats a network failure the same way', async () => {
    apiFetch.mockRejectedValue(new Error('offline'));
    openMenu();
    await act(async () => { items()[2].click(); });
    await flush();
    expect(replace).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });
});

describe('House page rail', () => {
  const page = readFileSync(join(ROOT, 'app/house/page.tsx'), 'utf8');
  it('no longer links to pages that do not exist (/search, /profile)', () => {
    expect(page).not.toMatch(/href=["']\/search["']/);
    expect(page).not.toMatch(/href=["']\/profile["']/);
    expect(existsSync(join(ROOT, 'app/search/page.tsx'))).toBe(false);
    expect(existsSync(join(ROOT, 'app/profile/page.tsx'))).toBe(false);
  });
  it('mounts the account menu in the rail foot', () => {
    expect(page).toContain("import { AccountMenu } from './AccountMenu'");
    expect(page).toMatch(/<nav className=\{styles\.railFoot\}[^>]*>\s*<AccountMenu \/>\s*<\/nav>/);
  });
});

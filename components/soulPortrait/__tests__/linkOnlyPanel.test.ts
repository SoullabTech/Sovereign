/**
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SendPortraitPanel } from '../SendPortraitPanel';

let container: HTMLDivElement;
let root: Root;
let fetchMock: jest.Mock;
const props = {
  portraitSlug: 'synthetic-private-gift',
  subjectName: 'Fictional Adult',
  alreadyPublished: false,
  existingPath: null,
};

function button(label: string): HTMLButtonElement {
  const element = [...container.querySelectorAll('button')].find(
    item => item.textContent?.trim() === label,
  );
  if (!element) throw new Error('Button absent: ' + label);
  return element;
}

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as typeof fetch;
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
  jest.restoreAllMocks();
});

describe('Soul Portrait member beta private-link panel', () => {
  it('renders no email form, requires consent and explains manual sharing', async () => {
    await act(async () => {
      root.render(React.createElement(SendPortraitPanel, props));
    });
    expect(container.textContent).toContain('No email is sent');
    expect(container.textContent).toContain('without an account');
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
    expect(button('Create private link').disabled).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('creates a private link using consent-only input, with no recipient contacts', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        url: 'https://soullab.test/soul-portrait/view/synthetic-private-gift',
        emailed: false,
        delivery: 'private_link_only',
      }),
    });
    await act(async () => { root.render(React.createElement(SendPortraitPanel, props)); });
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => { checkbox.click(); });
    expect(checkbox.checked).toBe(true);
    await act(async () => { button('Create private link').click(); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/soul-portrait/synthetic-private-gift/send');
    expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toEqual({ consentAttested: true });
    expect(container.textContent).toContain('Your private gift link');
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(button('Copy link')).toBeTruthy();
  });

  it('refuses non-link-only or mismatched API response as unverified delivery', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        url: 'https://soullab.test/soul-portrait/view/synthetic-private-gift',
        emailed: true,
      }),
    });
    await act(async () => { root.render(React.createElement(SendPortraitPanel, props)); });
    await act(async () => {
      (container.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    });
    await act(async () => { button('Create private link').click(); });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'private-link delivery contract could not be verified',
    );
    expect(container.querySelector('a')).toBeNull();
  });

  it('shows a previously published link without sending or rewriting the portrait', async () => {
    await act(async () => {
      root.render(React.createElement(SendPortraitPanel, { ...props, alreadyPublished: true, existingPath: '/soul-portrait/view/synthetic-private-gift' }));
    });
    expect(container.textContent).toContain('Your private gift link');
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(button('Copy link')).toBeTruthy();
  });
});

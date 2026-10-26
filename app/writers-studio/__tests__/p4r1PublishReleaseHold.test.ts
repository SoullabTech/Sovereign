/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const fakePush = jest.fn();
const renderPanel = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/writers-studio',
  useRouter: () => ({ push: fakePush }),
  useSearchParams: () => new URLSearchParams('mode=publish&m=fiction-manuscript'),
}));
jest.mock('@/app/writers-studio/atmosphere/StudioAtmosphere', () => ({
  useAtmosphere: () => ({ id: 'day' }),
}));
jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ work }: { work: React.ReactNode }) =>
    React.createElement('main', { 'data-real-publish-room': '' }, work),
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel', () => ({
  __esModule: true,
  default: (props: { manuscriptId: string; exportsCertified?: boolean }) => {
    renderPanel(props);
    return React.createElement('output', {
      'data-publish-release-state': props.exportsCertified ? 'ENABLED' : 'HELD',
      'data-manuscript': props.manuscriptId,
    });
  },
}));

import P4R1PublishRoom from '@/app/dev/writers-studio-pc3-live/P4R1PublishRoom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Publish release hold — actual six-room owner must not accidentally ship test-mode exports', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    renderPanel.mockClear();
    fakePush.mockClear();
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('renders the real Publish room for one identified Work while withholding uncertified PDF and EPUB generation', () => {
    act(() => root.render(React.createElement(P4R1PublishRoom)));
    const actual = host.querySelector<HTMLElement>('[data-publish-release-state]');
    expect(actual?.dataset.publishReleaseState).toBe('HELD');
    expect(actual?.dataset.manuscript).toBe('fiction-manuscript');
    expect(renderPanel).toHaveBeenCalledWith(expect.objectContaining({
      manuscriptId: 'fiction-manuscript',
      exportsCertified: false,
    }));
  });
});

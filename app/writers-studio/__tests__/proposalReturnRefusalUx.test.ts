/** @jest-environment jsdom */
import { createElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ProposedChange, { type ProposalPreview } from '@/app/writers-studio/ProposedChange';

const preview: ProposalPreview = {
  state: 'acceptable', proposalId: 'p1', executionAuthority: 'inspection_only',
  change: {
    sectionLabel: 'Section 23', sectionId: 's22',
    range: { space: 'projected_section_body', start: 10, end: 20 },
    operation: 'delete_exact_text', changeCount: 1,
  },
};
const COPY = 'I can’t locate the exact passage in the manuscript. Nothing has moved.';
let container: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

const render = async (notice: string | null) => act(async () => {
  root.render(createElement(ProposedChange, { preview, showChangeNotice: notice }));
});

describe('C10 · issuer narrates exact-return refusal', () => {
  it('F8 · refusal is inline, member-facing, and announces that nothing moved', async () => {
    await render(COPY);
    const status = container.querySelector('[data-show-change-notice]');
    expect(status).not.toBeNull();
    expect(status?.getAttribute('role')).toBe('status');
    expect(status?.textContent).toBe(COPY);
    expect(status?.textContent).not.toMatch(/section not found|locus|navigation failed/i);
  });

  it('F9 · a new act can clear the old refusal instead of letting it describe the control forever', async () => {
    await render(COPY);
    expect(container.querySelector('[data-show-change-notice]')).not.toBeNull();
    await render(null);
    expect(container.querySelector('[data-show-change-notice]')).toBeNull();
  });
});

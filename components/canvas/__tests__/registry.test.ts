import { createCanvasRegistry, type CanvasContext } from '../registry';

/**
 * The Canvas extension contract. Both assertions are two-sided on purpose:
 * a test that only proves "the absent panel is absent" is satisfied by a
 * registry that renders nothing at all.
 */

const ctx = (over: Partial<CanvasContext> = {}): CanvasContext => ({
  deployment: 'writer',
  workId: null,
  objectId: 'm-1',
  mode: 'writing',
  ...over,
});

describe('Canvas registry — absence over emptiness', () => {
  it('renders a panel when it is relevant, and omits it entirely when it is not', () => {
    const registry = createCanvasRegistry().registerPanel({
      id: 'reflection',
      label: 'Reflection',
      region: 'context',
      isRelevant: (c) => c.workId !== null,
      render: () => null,
    });

    // Absent — not empty, not greyed, not present at all.
    expect(registry.panelsFor('context', ctx()).map((p) => p.id)).toEqual([]);
    // Present — the same panel, once the Work can carry context.
    expect(registry.panelsFor('context', ctx({ workId: 'w-1' })).map((p) => p.id)).toEqual([
      'reflection',
    ]);
  });

  it('a panel without isRelevant always renders', () => {
    const registry = createCanvasRegistry().registerPanel({
      id: 'work',
      label: 'Work',
      region: 'context',
      render: () => null,
    });
    expect(registry.panelsFor('context', ctx()).map((p) => p.id)).toEqual(['work']);
  });

  it('keeps regions separate — a navigator panel never leaks into context', () => {
    const registry = createCanvasRegistry()
      .registerPanel({ id: 'nav', label: 'Manuscript', region: 'navigator', render: () => null })
      .registerPanel({ id: 'ctx', label: 'Work', region: 'context', render: () => null });

    expect(registry.panelsFor('navigator', ctx()).map((p) => p.id)).toEqual(['nav']);
    expect(registry.panelsFor('context', ctx()).map((p) => p.id)).toEqual(['ctx']);
  });

  it('orders by order, and unordered panels follow in registration order', () => {
    const registry = createCanvasRegistry()
      .registerPanel({ id: 'late', label: 'C', region: 'context', order: 20, render: () => null })
      .registerPanel({ id: 'loose', label: 'D', region: 'context', render: () => null })
      .registerPanel({ id: 'early', label: 'A', region: 'context', order: 10, render: () => null });

    expect(registry.panelsFor('context', ctx()).map((p) => p.id)).toEqual([
      'early',
      'late',
      'loose',
    ]);
  });

  it('re-registering an id replaces it — a re-rendering deployment cannot accumulate copies', () => {
    const registry = createCanvasRegistry()
      .registerPanel({ id: 'work', label: 'Work', region: 'context', render: () => null })
      .registerPanel({ id: 'work', label: 'Work (renamed)', region: 'context', render: () => null });

    const panels = registry.panelsFor('context', ctx());
    expect(panels).toHaveLength(1);
    expect(panels[0].label).toBe('Work (renamed)');
  });

  it('actions follow the same availability law, in both directions', () => {
    const registry = createCanvasRegistry()
      .registerAction({
        id: 'keep',
        label: 'Keep a version',
        isAvailable: (c) => c.objectId !== null,
        run: () => {},
      })
      .registerAction({ id: 'always', label: 'Always', run: () => {} });

    expect(registry.actionsFor(ctx()).map((a) => a.id).sort()).toEqual(['always', 'keep']);
    expect(registry.actionsFor(ctx({ objectId: null })).map((a) => a.id)).toEqual(['always']);
  });
});

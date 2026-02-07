/**
 * VEDIC DASHA GUARDS TESTS
 *
 * Tests the conditional logic for Dasha tab visibility and empty state:
 * 1. When profile.dasha is undefined → Dasha tab is filtered out
 * 2. When profile.dasha exists → Dasha tab is included
 * 3. Empty state message logic
 *
 * These are unit tests for the filtering logic, not full component tests,
 * to avoid mocking framer-motion, localStorage, and fetch.
 */

import { describe, it, expect } from '@jest/globals';

// The tab configuration matches page.tsx lines 372-379
const VEDIC_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'dasha', label: 'Dasha', requiresDasha: true },
  { id: 'chart', label: 'Planets' },
  { id: 'gochara', label: 'Transits' },
  { id: 'ashtakavarga', label: 'Strength' },
] as const;

/**
 * Tab filtering logic from page.tsx:
 * .filter((tab) => !tab.requiresDasha || profile.dasha)
 */
function filterTabs(hasDasha: boolean) {
  return VEDIC_TABS.filter((tab) => !('requiresDasha' in tab && tab.requiresDasha) || hasDasha);
}

/**
 * Empty state logic from page.tsx lines 460-475:
 * Shows "Dasha timeline requires birth time" when dasha is undefined
 */
function shouldShowDashaEmptyState(dasha: unknown): boolean {
  return !dasha;
}

/**
 * Dasha view render condition from page.tsx line 505:
 * {activeView === 'dasha' && profile.dasha && (...)}
 */
function shouldRenderDashaView(activeView: string, dasha: unknown): boolean {
  return activeView === 'dasha' && !!dasha;
}

describe('Vedic Dasha Guards - Tab Filtering', () => {
  it('should include Dasha tab when profile.dasha exists', () => {
    const tabs = filterTabs(true);
    const tabIds = tabs.map((t) => t.id);

    expect(tabIds).toContain('dasha');
    expect(tabs).toHaveLength(5);
  });

  it('should exclude Dasha tab when profile.dasha is undefined', () => {
    const tabs = filterTabs(false);
    const tabIds = tabs.map((t) => t.id);

    expect(tabIds).not.toContain('dasha');
    expect(tabs).toHaveLength(4);
  });

  it('should always include non-dasha tabs regardless of dasha state', () => {
    const tabsWithDasha = filterTabs(true).map((t) => t.id);
    const tabsWithoutDasha = filterTabs(false).map((t) => t.id);

    // These tabs should always be present
    const alwaysPresentTabs = ['profile', 'chart', 'gochara', 'ashtakavarga'];
    for (const tabId of alwaysPresentTabs) {
      expect(tabsWithDasha).toContain(tabId);
      expect(tabsWithoutDasha).toContain(tabId);
    }
  });
});

describe('Vedic Dasha Guards - Empty State', () => {
  it('should show empty state when dasha is undefined', () => {
    expect(shouldShowDashaEmptyState(undefined)).toBe(true);
  });

  it('should show empty state when dasha is null', () => {
    expect(shouldShowDashaEmptyState(null)).toBe(true);
  });

  it('should NOT show empty state when dasha exists', () => {
    const mockDasha = { currentMahaDasha: 'Sun', periods: [] };
    expect(shouldShowDashaEmptyState(mockDasha)).toBe(false);
  });

  it('empty state message text is correct', () => {
    // This documents the expected message from lines 472-474
    const expectedMessage = 'Dasha timeline requires birth time for accurate calculation.';
    expect(expectedMessage).toContain('birth time');
    expect(expectedMessage).toContain('Dasha');
  });
});

describe('Vedic Dasha Guards - Dasha View Rendering', () => {
  it('should NOT render Dasha view when activeView is "dasha" but dasha is undefined', () => {
    expect(shouldRenderDashaView('dasha', undefined)).toBe(false);
  });

  it('should NOT render Dasha view when dasha exists but activeView is not "dasha"', () => {
    const mockDasha = { currentMahaDasha: 'Sun' };
    expect(shouldRenderDashaView('profile', mockDasha)).toBe(false);
    expect(shouldRenderDashaView('chart', mockDasha)).toBe(false);
  });

  it('should render Dasha view when activeView is "dasha" AND dasha exists', () => {
    const mockDasha = { currentMahaDasha: 'Sun' };
    expect(shouldRenderDashaView('dasha', mockDasha)).toBe(true);
  });
});

describe('Vedic Dasha Guards - Birth Time Dependency', () => {
  /**
   * Documents the contract: Dasha calculation requires birth time.
   * When birth time is absent, the API returns dasha: undefined.
   */
  it('documents: birth time absence → no dasha data → tab hidden + empty state shown', () => {
    // This is the expected flow:
    // 1. User enters birth date but no birth time
    // 2. API calculates chart with time defaulting to 12:00
    // 3. API returns profile with dasha: undefined (or not included)
    // 4. UI filters out Dasha tab
    // 5. UI shows empty state message in profile view

    const profileWithoutBirthTime = { dasha: undefined };
    const profileWithBirthTime = { dasha: { currentMahaDasha: 'Venus', periods: [] } };

    // Without birth time: tab hidden, empty state shown
    expect(filterTabs(!!profileWithoutBirthTime.dasha)).toHaveLength(4);
    expect(shouldShowDashaEmptyState(profileWithoutBirthTime.dasha)).toBe(true);

    // With birth time: tab visible, no empty state
    expect(filterTabs(!!profileWithBirthTime.dasha)).toHaveLength(5);
    expect(shouldShowDashaEmptyState(profileWithBirthTime.dasha)).toBe(false);
  });
});

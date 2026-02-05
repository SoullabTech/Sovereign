'use client';

/**
 * useMemberTools - React hook for member tool preferences
 *
 * Handles loading, caching, and optimistic updates for the
 * member's enabled tools and category preferences.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { type HydratedCategory } from '@/lib/services/memberToolsService';
import { type ToolCategory } from '@/config/toolRegistry';

interface UseMemberToolsReturn {
  /** Hydrated categories with tools */
  categories: HydratedCategory[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Add a tool */
  addTool: (toolId: string) => Promise<void>;
  /** Remove a tool */
  removeTool: (toolId: string) => Promise<void>;
  /** Toggle category collapsed state */
  toggleCategory: (category: ToolCategory) => Promise<void>;
  /** Check if a tool is enabled */
  isToolEnabled: (toolId: string) => boolean;
  /** Refresh data from server */
  refresh: () => Promise<void>;
}

export function useMemberTools(): UseMemberToolsReturn {
  const [categories, setCategories] = useState<HydratedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build a set of enabled tool IDs for quick lookup
  const enabledToolIds = new Set(
    categories.flatMap((cat) => cat.tools.map((t) => t.id))
  );

  // Fetch tools from API
  const fetchTools = useCallback(async () => {
    try {
      setError(null);
      const response = await apiFetch('/api/member-tools');

      if (!response.ok) {
        throw new Error('Failed to load tools');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('[useMemberTools] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Add a tool
  const addTool = useCallback(
    async (toolId: string) => {
      try {
        const response = await apiFetch('/api/member-tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', toolId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add tool');
        }

        // Refresh to get updated state
        await fetchTools();
      } catch (err) {
        console.error('[useMemberTools] Add error:', err);
        throw err;
      }
    },
    [fetchTools]
  );

  // Remove a tool
  const removeTool = useCallback(
    async (toolId: string) => {
      try {
        const response = await apiFetch('/api/member-tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'remove', toolId }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove tool');
        }

        // Refresh to get updated state
        await fetchTools();
      } catch (err) {
        console.error('[useMemberTools] Remove error:', err);
        throw err;
      }
    },
    [fetchTools]
  );

  // Toggle category collapsed
  const toggleCategory = useCallback(
    async (category: ToolCategory) => {
      // Optimistic update
      setCategories((prev) =>
        prev.map((cat) =>
          cat.category === category
            ? { ...cat, collapsed: !cat.collapsed }
            : cat
        )
      );

      try {
        const response = await apiFetch('/api/member-tools/category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggle-collapsed', category }),
        });

        if (!response.ok) {
          // Revert on error
          setCategories((prev) =>
            prev.map((cat) =>
              cat.category === category
                ? { ...cat, collapsed: !cat.collapsed }
                : cat
            )
          );
          throw new Error('Failed to toggle category');
        }
      } catch (err) {
        console.error('[useMemberTools] Toggle error:', err);
      }
    },
    []
  );

  // Check if tool is enabled
  const isToolEnabled = useCallback(
    (toolId: string) => enabledToolIds.has(toolId),
    [enabledToolIds]
  );

  return {
    categories,
    isLoading,
    error,
    addTool,
    removeTool,
    toggleCategory,
    isToolEnabled,
    refresh: fetchTools,
  };
}

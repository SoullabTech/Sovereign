// Centralized lazy loading utilities to ensure proper initialization order
// This prevents ReferenceError in production builds

/**
 * Safe lazy loader that handles both client and server environments
 */
export function createLazyGetter<T>(
  factory: () => T,
  name: string = 'module'
): () => T {
  let instance: T | null = null;
  let isInitializing = false;

  return () => {
    // Prevent recursive initialization
    if (isInitializing) {
      console.warn(`Circular dependency detected in ${name}`);
      return {} as T; // Return empty object to prevent crash
    }

    if (!instance) {
      try {
        isInitializing = true;
        instance = factory();
        isInitializing = false;
      } catch (error) {
        isInitializing = false;
        console.error(`Failed to initialize ${name}:`, error);
        throw error;
      }
    }

    return instance;
  };
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Create a browser-only lazy loader
 */
export function createBrowserOnlyGetter<T>(
  factory: () => T,
  fallback: T,
  name: string = 'module'
): () => T {
  if (!isBrowser) {
    return () => fallback;
  }

  return createLazyGetter(factory, name);
}

/**
 * Ensure module is loaded before use
 */
export async function ensureLoaded<T>(
  getter: () => T | Promise<T>
): Promise<T> {
  const result = getter();
  if (result instanceof Promise) {
    return await result;
  }
  return result;
}
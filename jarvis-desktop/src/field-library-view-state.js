'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerViewState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const STORAGE_KEY = 'kellys-world:field-library:view-state:v1';

  function clean(value) {
    const open = Array.isArray(value?.open_groups)
      ? [...new Set(value.open_groups.filter(v => typeof v === 'string' && v.length <= 160))].slice(0, 120)
      : [];
    return {
      browse_query: typeof value?.browse_query === 'string' ? value.browse_query.slice(0, 500) : '',
      grokker_query: typeof value?.grokker_query === 'string' ? value.grokker_query.slice(0, 1000) : '',
      open_groups: open,
      scroll_top: Number.isFinite(value?.scroll_top) && value.scroll_top >= 0
        ? Math.floor(value.scroll_top) : 0,
    };
  }

  function load(storage) {
    try {
      const raw = storage?.getItem?.(STORAGE_KEY);
      return raw ? clean(JSON.parse(raw)) : clean({});
    } catch {
      return clean({});
    }
  }

  function save(storage, value) {
    const next = clean(value);
    storage?.setItem?.(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function clear(storage) {
    storage?.removeItem?.(STORAGE_KEY);
    return clean({});
  }

  return { STORAGE_KEY, clean, load, save, clear };
});

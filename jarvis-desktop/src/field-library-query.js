'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerLibraryQuery = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const STOP = new Set([
    'the','a','an','and','or','of','to','in','for','we','have','has',
    'about','what','show','me','all','our','did','do','is','are','on','with'
  ]);

  function tokens(query) {
    return [...new Set(String(query || '')
      .toLowerCase()
      .replace(/[^a-z0-9'-]+/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP.has(t)))];
  }

  function scoreItem(item, group, kind, queryTokens) {
    const title = String(item?.title || '').toLowerCase();
    const excerpt = String(item?.excerpt || '').toLowerCase();
    const headings = (item?.headings || []).join(' ').toLowerCase();
    const path = String(item?.path || '').toLowerCase();
    const groupText = String(group || '').toLowerCase();
    let score = 0;
    const matched = [];

    for (const token of queryTokens) {
      let hit = 0;
      if (title.includes(token)) hit += 8;
      if (groupText.includes(token)) hit += 5;
      if (headings.includes(token)) hit += 4;
      if (excerpt.includes(token)) hit += 3;
      if (path.includes(token)) hit += 2;
      if (hit) {
        score += hit;
        matched.push(token);
      }
    }

    return score ? { item, group, kind, score, matched } : null;
  }

  function trace(library, query, limit = 18) {
    const queryTokens = tokens(query);
    if (!queryTokens.length || !library) return [];

    const rows = [];
    for (const group of library.conceptGroups || []) {
      for (const item of group.items || []) {
        const row = scoreItem(item, group.title, 'field', queryTokens);
        if (row) rows.push(row);
      }
    }
    for (const group of library.laneGroups || []) {
      for (const item of group.items || []) {
        const row = scoreItem(item, group.title, 'record', queryTokens);
        if (row) rows.push(row);
      }
    }

    return rows
      .sort((a, b) => b.score - a.score ||
        String(a.item.title).localeCompare(String(b.item.title)))
      .slice(0, limit);
  }

  return { tokens, scoreItem, trace };
});

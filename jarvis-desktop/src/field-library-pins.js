'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerFieldPins = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const STORAGE_KEY = 'kellys-world:field-library:pins:v1';

  function validPin(pin) {
    return pin && ['recovery','work','field'].includes(pin.kind)
      && typeof pin.key === 'string' && pin.key.length > 0
      && typeof pin.label === 'string' && pin.label.length > 0;
  }

  function load(storage) {
    try {
      const raw = storage?.getItem?.(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      return parsed.filter(validPin).filter(pin => {
        const id = pin.kind + ':' + pin.key;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).map(pin => ({ kind:pin.kind, key:pin.key, label:pin.label }));
    } catch {
      return [];
    }
  }

  function save(storage, pins) {
    const clean = (pins || []).filter(validPin).map(pin => ({
      kind: pin.kind, key: pin.key, label: pin.label,
    }));
    storage?.setItem?.(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  }

  function idOf(pin) { return pin.kind + ':' + pin.key; }
  function has(pins, pin) {
    const id = idOf(pin);
    return (pins || []).some(existing => idOf(existing) === id);
  }
  function toggle(storage, pins, pin) {
    if (!validPin(pin)) return [...(pins || [])];
    const id = idOf(pin);
    const next = has(pins, pin)
      ? (pins || []).filter(existing => idOf(existing) !== id)
      : [...(pins || []), { kind:pin.kind, key:pin.key, label:pin.label }];
    return save(storage, next);
  }

  function resolveOne(pin, library, governedWork) {
    if (pin.kind === 'recovery') {
      const item = (library?.recoveryCandidates || []).find(x => x.programme_key === pin.key);
      return item ? { ...pin, resolved:true, source:item } : { ...pin, resolved:false, source:null };
    }
    if (pin.kind === 'work') {
      const groups = ['needs_kelly','in_motion','watching','historical'];
      for (const group of groups) {
        const item = (governedWork?.[group] || []).find(x => x.work_unit_id === pin.key);
        if (item) return { ...pin, resolved:true, source:item, group };
      }
      return { ...pin, resolved:false, source:null };
    }
    if (pin.kind === 'field') {
      const [groupTitle, ...rest] = pin.key.split('/');
      const title = rest.join('/');
      const group = (library?.conceptGroups || []).find(g => g.title === groupTitle);
      const item = (group?.items || []).find(x => x.title === title);
      return item ? { ...pin, resolved:true, source:item, group:groupTitle } : { ...pin, resolved:false, source:null };
    }
    return { ...pin, resolved:false, source:null };
  }

  function resolve(pins, library, governedWork) {
    return (pins || []).map(pin => resolveOne(pin, library, governedWork));
  }

  return { STORAGE_KEY, validPin, load, save, has, toggle, resolveOne, resolve };
});

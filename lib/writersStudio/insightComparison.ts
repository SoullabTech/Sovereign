/** A conservative single-span diff. It never hides removed words or claims to
 * identify separate edits. Unicode code points keep surrogate pairs intact. */
export function comparisonSpan(original: string, proposed: string) {
  const a = Array.from(original), b = Array.from(proposed);
  let prefix = 0, suffix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  while (suffix < a.length - prefix && suffix < b.length - prefix
    && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++;
  return {
    before: a.slice(0, prefix).join(''),
    removed: a.slice(prefix, a.length - suffix).join(''),
    added: b.slice(prefix, b.length - suffix).join(''),
    after: a.slice(a.length - suffix).join(''),
  };
}

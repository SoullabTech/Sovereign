/**
 * FWE01 test-only response fixture for the installed Next font loader.
 * NEXT_FONT_GOOGLE_MOCKED_RESPONSES reads this module instead of contacting
 * Google Fonts. Bytes are intentionally invalid font bytes: the browser may
 * use fallback glyphs. This is not visual-font-fidelity acceptance.
 */
'use strict';
module.exports = new Proxy(Object.create(null), {
  get(_target, fontCSSUrl) {
    if (typeof fontCSSUrl !== 'string' || !fontCSSUrl.startsWith('https://fonts.googleapis.com/')) {
      throw new Error('FWE01 refused non-Google-font test fixture lookup');
    }
    const url = new URL(fontCSSUrl);
    const family = (url.searchParams.get('family') || 'Inter').split(':')[0]
      .replace(/[^a-zA-Z0-9 +\-]/g, '');
    const safeFamily = family || 'Inter';
    return [
      '/* latin */',
      '@font-face {',
      "  font-family: '" + safeFamily + "';",
      '  font-style: normal;',
      '  font-weight: 100 900;',
      '  font-display: swap;',
      '  src: url(https://fwe01.invalid/mock-font.woff2) format("woff2");',
      '}',
    ].join('\n');
  },
});
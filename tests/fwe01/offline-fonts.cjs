/*
 * FWE-01 test-only Next Google font response: never fetches external fonts.
 * Browser may fall back to system fonts. Not a production asset.
 */
module.exports = new Proxy({}, {
  get(_unused, url) {
    if (typeof url !== 'string' || !url.startsWith('https://fonts.googleapis.com/')) {
      return undefined;
    }
    const family = new URL(url).searchParams.get('family')?.split(':')[0]
      .replaceAll('+', ' ') || 'FWE Fictional';
    return [
      '/* latin */',
      '@font-face {',
      "  font-family: '" + family + "';",
      '  font-style: normal;',
      '  font-weight: 100 900;',
      '  src: url(fwe01-synthetic-font-data) format("woff2");',
      '}',
    ].join('\n');
  },
});

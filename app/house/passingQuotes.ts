import type { PassingQuote } from './passingContext';

// Small reviewed shelf, not the legacy mood-tagged quotation collections.
// Text checked in the linked works on 2026-09-25. No AI generation at page load.
// The display window is an editorial review bound; it does not date the quotations.
const window = { verifiedOn: '2026-09-25', displayFrom: '2026-09-25', displayUntil: '2026-12-25' } as const;
export const PASSING_QUOTES = [
  {
    id: 'walden-spring-nature', kind: 'quote', audience: 'public',
    text: 'We can never have enough of Nature.',
    author: 'Henry David Thoreau', work: 'Walden', locator: 'Spring',
    sourceUrl: 'https://www.gutenberg.org/files/205/205-h/205-h.htm#:~:text=We%20can%20never%20have%20enough%20of%20Nature.',
    ...window,
  },
  {
    id: 'gitanjali-69-life', kind: 'quote', audience: 'public',
    text: 'I feel my limbs are made glorious by the touch of this world of life.',
    author: 'Rabindranath Tagore', work: 'Gitanjali', locator: '69',
    sourceUrl: 'https://poets.org/poem/gitanjali-69',
    ...window,
  },
  {
    id: 'walden-conclusion-universe', kind: 'quote', audience: 'public',
    text: 'The universe is wider than our views of it.',
    author: 'Henry David Thoreau', work: 'Walden', locator: 'Conclusion',
    sourceUrl: 'https://www.gutenberg.org/files/205/205-h/205-h.htm#:~:text=The%20universe%20is%20wider%20than%20our%20views%20of%20it.',
    ...window,
  },
] as const satisfies readonly PassingQuote[];

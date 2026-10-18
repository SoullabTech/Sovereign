/**
 * Glenn Perry — official outbound wisdom-keeper references.
 *
 * Public bibliographic navigation only: no copyrighted source text, scraping,
 * model instruction, embed, training license, founder endorsement, or admission.
 * Only known author's web properties and landing pages are listed. The links
 * are ordinary, user-initiated navigation; they never cause auto-fetches.
 *
 * Source custody: docs/wisdom/source-candidates/glenn-perry/sources.json
 * Verified against the author's own site and Academy pages (2026-10-17).
 */
export type PerryKeeperResourceKind = 'author' | 'academy' | 'book' | 'collection';

export type PerryKeeperLink = Readonly<{
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly kind: PerryKeeperResourceKind;
  readonly description: string;
}>;

export const GLENN_PERRY_WISDOM_KEEPER_LINKS: readonly PerryKeeperLink[] = Object.freeze([
  {
    id: 'author-website',
    label: 'Glenn Perry’s website',
    url: 'https://aaperry.com/',
    kind: 'author',
    description: 'The author’s original essays, lectures and publications.',
  },
  {
    id: 'academy',
    label: 'Academy of AstroPsychology',
    url: 'https://astropsychology.org/',
    kind: 'academy',
    description: 'The school and training programme associated with Glenn Perry.',
  },
  {
    id: 'introduction-book',
    label: 'An Introduction to AstroPsychology',
    url: 'https://aaperry.com/product/an-introduction-to-astropsychology/',
    kind: 'book',
    description: 'The author’s book on astrology and depth psychology.',
  },
  {
    id: 'depth-analysis-book',
    label: 'Depth Analysis of the Natal Chart',
    url: 'https://aaperry.com/product/depth-analysis-of-the-natal-chart-advanced-therapeutic-astrology/',
    kind: 'book',
    description: 'The author’s work on advanced therapeutic astrology.',
  },
  {
    id: 'books-collection',
    label: 'All books by Glenn Perry',
    url: 'https://aaperry.com/astrology-books/',
    kind: 'collection',
    description: 'Explore his full book catalogue at the author’s website.',
  },
  {
    id: 'essays-collection',
    label: 'Articles, concepts and theory',
    url: 'https://aaperry.com/concepts-and-theory/',
    kind: 'collection',
    description: 'Visit his original essays and evolving theoretical work.',
  },
]);

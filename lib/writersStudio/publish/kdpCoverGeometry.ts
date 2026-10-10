export type KdpPaperbackPaper = 'white' | 'cream';

export type KdpPaperbackCoverGeometry = {
  trimWidthIn: number;
  trimHeightIn: number;
  bleedIn: number;
  pageCount: number;
  paper: KdpPaperbackPaper;
  spineWidthIn: number;
  fullWidthIn: number;
  fullHeightIn: number;
  spineTextEligible: boolean;
};

const TRIM_WIDTH_IN = 6;
const TRIM_HEIGHT_IN = 9;
const COVER_BLEED_IN = 0.125;

const SPINE_PER_PAGE_IN: Readonly<Record<KdpPaperbackPaper, number>> = {
  white: 0.002252,
  cream: 0.0025,
};

export function kdpPaperbackCoverGeometry(
  pageCount: number,
  paper: KdpPaperbackPaper,
): KdpPaperbackCoverGeometry {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error('KDP paperback cover geometry requires a positive whole page count.');
  }

  const spineWidthIn = pageCount * SPINE_PER_PAGE_IN[paper];
  const fullWidthIn = COVER_BLEED_IN + TRIM_WIDTH_IN + spineWidthIn + TRIM_WIDTH_IN + COVER_BLEED_IN;
  const fullHeightIn = COVER_BLEED_IN + TRIM_HEIGHT_IN + COVER_BLEED_IN;

  return {
    trimWidthIn: TRIM_WIDTH_IN,
    trimHeightIn: TRIM_HEIGHT_IN,
    bleedIn: COVER_BLEED_IN,
    pageCount,
    paper,
    spineWidthIn,
    fullWidthIn,
    fullHeightIn,
    spineTextEligible: pageCount > 79,
  };
}

export function inches(value: number, digits = 3): string {
  return value.toFixed(digits).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1');
}

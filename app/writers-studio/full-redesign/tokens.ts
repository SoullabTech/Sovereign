import type { Appearance, FixtureStateId, ShellGeometry } from './types';

/**
 * Colour ROLES for the Light Shell, sampled from the founder originals
 * (#10 Themes Writing Workspace, #11 Manuscript Analysis Dashboard).
 * Appearance modes redefine roles only; no component reads a literal colour.
 */
type RoleTokens = Record<
  | 'ground' | 'bar' | 'panel' | 'panelSoft' | 'line' | 'lineSoft'
  | 'ink' | 'ink2' | 'muted' | 'quiet' | 'title'
  | 'action' | 'actionDeep' | 'actionSoft' | 'actionLine'
  | 'maiaCard' | 'held' | 'heldPassage' | 'gold' | 'shadow',
  string
>;

export const APPEARANCE_TOKENS: Record<Appearance, RoleTokens> = {
  light: {
    ground: '#F3F3F3',
    bar: '#F8F8F8',
    panel: '#FEFEFE',
    panelSoft: '#F4F5F7',
    line: '#E6E7EA',
    lineSoft: '#EEEFF1',
    ink: '#08143B',
    ink2: '#3A4257',
    muted: '#697084',
    quiet: '#9AA0AE',
    title: '#08143B',
    action: '#1F6FC4',
    actionDeep: '#23508B',
    actionSoft: '#F2F8FD',
    actionLine: '#B9D3F0',
    maiaCard: '#F0F4F7',
    held: '#FAF2E7',
    heldPassage: '#EEF3FB',
    gold: '#B8893E',
    shadow: '0 1px 2px rgba(8,20,59,.04), 0 4px 14px rgba(8,20,59,.035)',
  },
  // Derived Night proof: same roles, same geometry, lower light.
  night: {
    ground: '#0F1422',
    bar: '#131A2A',
    panel: '#171E30',
    panelSoft: '#1C2438',
    line: '#27314A',
    lineSoft: '#222B41',
    ink: '#E6EAF4',
    ink2: '#C3CAD9',
    muted: '#98A1B6',
    quiet: '#6E778C',
    title: '#EEF1F8',
    action: '#7FB0EA',
    actionDeep: '#9CC2EF',
    actionSoft: '#1D2A44',
    actionLine: '#3A5680',
    maiaCard: '#1D2539',
    held: '#2E2A22',
    heldPassage: '#1E2A42',
    gold: '#D4A95E',
    shadow: '0 1px 2px rgba(0,0,0,.25), 0 6px 18px rgba(0,0,0,.22)',
  },
};

export function appearanceVars(appearance: Appearance): Record<string, string> {
  const t = APPEARANCE_TOKENS[appearance];
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(t)) out[`--fr-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`] = v;
  return out;
}

/** Geometry per state, measured from each founder original at 1536×1024. */
export const STATE_GEOMETRY: Record<FixtureStateId, ShellGeometry> = {
  // #10 — manuscript 13–311 · work 333–1175 on the ground · MAIA 1193–1524 · panels 63–1011
  'develop-themes': {
    padLeft: 13, padRight: 12, manuscriptWidth: 298, manuscriptFloor: 236,
    maiaWidth: 331, maiaFloor: 288, gapLeft: 22, gapRight: 18, top: 7, bottom: 13, workPanel: false,
  },
  // #11 — manuscript 11–305 · work panel 318–1112 · MAIA 1125–1527 · panels 66–1009
  'develop-manuscript': {
    padLeft: 11, padRight: 9, manuscriptWidth: 294, manuscriptFloor: 224,
    maiaWidth: 402, maiaFloor: 300, gapLeft: 13, gapRight: 13, top: 10, bottom: 15, workPanel: true,
  },
  // #23 — manuscript 19–256 · work 273–1164 on the ground · MAIA 1182–1517 · panels 66–976
  'review-chapter': {
    padLeft: 19, padRight: 19, manuscriptWidth: 237, manuscriptFloor: 212,
    maiaWidth: 335, maiaFloor: 288, gapLeft: 17, gapRight: 18, top: 10, bottom: 48, workPanel: false,
  },
};

export const REFERENCE_WIDTH = 1536;

/** CSS custom properties that place the regions; narrower desktops scale toward the floors. */
export function geometryVars(g: ShellGeometry): Record<string, string> {
  const vw = (px: number) => `${((px / REFERENCE_WIDTH) * 100).toFixed(4)}vw`;
  return {
    '--fr-pad-l': `${g.padLeft}px`,
    '--fr-pad-r': `${g.padRight}px`,
    '--fr-ms-w': `clamp(${g.manuscriptFloor}px, ${vw(g.manuscriptWidth)}, ${g.manuscriptWidth}px)`,
    '--fr-maia-w': `clamp(${g.maiaFloor}px, ${vw(g.maiaWidth)}, ${g.maiaWidth}px)`,
    '--fr-gap-l': `${g.gapLeft}px`,
    '--fr-gap-r': `${g.gapRight}px`,
    '--fr-top': `${g.top}px`,
    '--fr-bottom': `${g.bottom}px`,
  };
}

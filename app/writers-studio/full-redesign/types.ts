/**
 * PC3-S1 — canonical Light Shell types.
 *
 * Presentation-only. Nothing here names a Work id, a manuscript id, a reading,
 * or any runtime authority: the shell composes regions; it never mints identity.
 */

/** The four primary movements of the Studio (PC2 §I). No others are primary. */
export type StudioMode = 'home' | 'write' | 'develop' | 'review';

export const PRIMARY_MODES: ReadonlyArray<{ id: StudioMode; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'write', label: 'Write' },
  { id: 'develop', label: 'Develop' },
  { id: 'review', label: 'Review' },
];

/** Appearance changes atmosphere, never architecture or authority (PC1 VS-06). */
export type Appearance = 'light' | 'night';
export const DEFAULT_APPEARANCE: Appearance = 'light';

/** The controlled founder-review fixture states PC3-S1 renders. */
export type FixtureStateId = 'develop-themes' | 'develop-manuscript' | 'review-chapter';

/** Region order is part of the shell's meaning and must not vary by appearance. */
export type ShellRegion = 'topbar' | 'manuscript' | 'work' | 'maia';
export const REGION_ORDER: ReadonlyArray<ShellRegion> = ['topbar', 'manuscript', 'work', 'maia'];

/**
 * Desktop geometry, in px at the 1536-wide reference viewport, measured from the
 * founder original each state is bound to. Narrower desktops scale the side
 * regions proportionally down to their floors; MAIA never leaves the right.
 */
export type ShellGeometry = {
  padLeft: number;
  padRight: number;
  manuscriptWidth: number;
  manuscriptFloor: number;
  maiaWidth: number;
  maiaFloor: number;
  gapLeft: number;
  gapRight: number;
  top: number;
  bottom: number;
  /** Whether the Work region is a framed surface (#11) or sits on the ground (#10, #23). */
  workPanel: boolean;
};

export type FounderReference = {
  corpusCommit: string;
  path: string;
  sha256: string;
  label: string;
};

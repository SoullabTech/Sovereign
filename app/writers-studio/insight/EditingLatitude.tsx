'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  EDITORIAL_LATITUDES, LATITUDE_BANDS, type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';
import {
  readSequenceOverride, readStoredLatitude, writeSequenceOverride, writeStoredLatitude,
} from '@/lib/writersStudio/editingLatitude';

/**
 * ⭐⭐ THE AUTHOR'S EDITING CONTROLS — TWO OF THEM, AND THAT IS THE POINT.
 *
 * The slider says HOW MUCH rewording one suggestion may carry. The checkbox
 * says whether MAIA may arrive with a whole paragraph already gone.
 *
 * ⛔ THEY ARE NOT ONE CONTROL. Sliding to "Open" asks for free rewriting; it
 * does not ask for silent deletion. Collapsing them into a single dial would
 * teach the writer that wanting a bolder edit means accepting lost paragraphs,
 * which is exactly the conflation that made this surface unreadable.
 *
 * ⭐ Both are shown as plain statements of what will happen, not settings behind
 * a gear. **The writer should never discover the rule by being shown their own
 * paragraphs struck through.**
 */

/**
 * ⭐ ONE SOURCE FOR BOTH SURFACES. ⛔ A second copy of this state is a second
 * place the default can drift, and the default is the safety property.
 */
export function useEditingLatitude(workId = '') {
  const [latitude, setLatitudeState] = useState<EditorialLatitude>(1);
  const [mayRemoveParagraphs, setMayRemoveParagraphs] = useState(false);
  /** ⭐ The writer's per-Work release of the discuss-first order. */
  const [mayProposeImmediately, setMayProposeState] = useState(false);

  /* ⛔ Restored in an effect, not in the initializer: `window` does not exist
     during server render, and the protective default is the correct first
     paint either way. */
  useEffect(() => {
    const restored = readStoredLatitude();
    setLatitudeState(restored.latitude);
    setMayProposeState(readSequenceOverride(workId));
    /* ⛔ `restored.mayRemoveParagraphs` is always false by construction — see
       `restoreDeclaration`. Not read here, so this surface cannot become the
       place the asymmetry is quietly undone. */
  }, [workId]);

  const setMayProposeImmediately = useCallback((v: boolean) => {
    setMayProposeState(v);
    writeSequenceOverride(workId, v);
  }, [workId]);

  const setLatitude = useCallback((v: EditorialLatitude) => {
    setLatitudeState(v);
    writeStoredLatitude(v);
  }, []);

  return {
    latitude, setLatitude, mayRemoveParagraphs, setMayRemoveParagraphs,
    mayProposeImmediately, setMayProposeImmediately,
  };
}

export default function EditingLatitude({
  latitude, onLatitude, mayRemoveParagraphs, onMayRemoveParagraphs, disabled,
  mayProposeImmediately = false, onMayProposeImmediately,
}: {
  latitude: EditorialLatitude; onLatitude: (v: EditorialLatitude) => void;
  mayRemoveParagraphs: boolean; onMayRemoveParagraphs: (v: boolean) => void;
  disabled?: boolean;
  /**
   * ⭐ The per-Work release of the discuss-first order. ⛔ Shown ONLY at
   * latitude 1, because that is the only latitude it governs — a control
   * visible where it does nothing teaches the writer that controls do nothing.
   */
  mayProposeImmediately?: boolean; onMayProposeImmediately?: (v: boolean) => void;
}) {
  const band = LATITUDE_BANDS[latitude];
  const first = EDITORIAL_LATITUDES[0];
  const last = EDITORIAL_LATITUDES[EDITORIAL_LATITUDES.length - 1];
  return <section className="wsi-latitude" aria-label="How much MAIA may change">
    <label>How much may MAIA change?
      <input type="range" min={first} max={last} step={1} value={latitude} disabled={disabled}
        aria-valuetext={band.label}
        onChange={e => onLatitude(Number(e.target.value) as EditorialLatitude)} />
    </label>
    <div className="wsi-latitude-scale" aria-hidden="true">
      <span>{LATITUDE_BANDS[first].label}</span><span>{LATITUDE_BANDS[last].label}</span>
    </div>
    <p className="wsi-latitude-band"><strong>{band.label}</strong> · {band.description}</p>
    <label className="wsi-latitude-paragraphs">
      <input type="checkbox" checked={mayRemoveParagraphs} disabled={disabled}
        onChange={e => onMayRemoveParagraphs(e.target.checked)} />
      MAIA may suggest removing a whole paragraph
    </label>
    <p className="wsi-muted">{mayRemoveParagraphs
      ? 'She may bring you wording with a paragraph taken out. You still decide.'
      : 'She can tell you a paragraph should go, and you decide — but she cannot bring you wording with it already removed.'}</p>
    {/* ⭐⭐ THE SEQUENCE OVERRIDE — at latitude 1 only, where it applies.
        The default is that MAIA talks with you about a passage before offering
        words for it. ⛔ Shown as the writer's choice, never as a restriction
        being lifted for them. */}
    {latitude === 1 && onMayProposeImmediately && <>
      <label className="wsi-latitude-paragraphs">
        <input type="checkbox" checked={mayProposeImmediately} disabled={disabled}
          onChange={e => onMayProposeImmediately(e.target.checked)} />
        Suggest wording straight away
      </label>
      <p className="wsi-muted">{mayProposeImmediately
        ? 'MAIA may offer wording on her first reply about a passage.'
        : 'MAIA talks with you about a passage first, then offers wording once you have. This setting is remembered for this Work.'}</p>
    </>}
    {/* ⭐ Said plainly, because a permission the writer forgot granting is not
        one they gave. The slider is remembered; this is not. */}
    <p className="wsi-muted">Your slider is remembered. Paragraph removal starts off each visit.</p>
  </section>;
}

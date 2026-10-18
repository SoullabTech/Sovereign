'use client';

/**
 * Glenn Perry — founder-only, fixture-backed preview of the *choice*.
 *
 * No live member/session/chart data, MAIA endpoint, provider call, source
 * ingestion, or live privacy-setting read. Displayed responses are STATIC
 * invented examples, not MAIA-generated outputs. This component is mounted
 * only by a server-side requireFounder() + default-OFF preview route.
 */
import { useState } from 'react';
import {
  preparePerryClientSelection,
  PERRY_CLIENT_SOURCE_CHOICE,
} from '@/lib/maia/knowledge/perryClientPostureGate';

type Choice = 'usual' | 'perry';
type SimulatedPosture = 'ordinary' | 'sanctuary' | 'unresolved';
type PreviewResult = 'idle' | 'usual' | 'perry' | 'blocked_sanctuary' | 'blocked_unresolved';

const SAMPLE_MESSAGE = 'I want closeness, but sometimes it feels like I lose myself.';

const USUAL_REPLY =
  'Wanting closeness and wanting room for yourself can both matter. What happens in the moments when closeness starts to feel crowded?';

const PERRY_INSPIRED_REPLY =
  'As an optional symbolic perspective, Glenn Perry’s AstroPsychology explores how different needs and psychological functions can interact across a developing life story. One question here might be how intimacy and autonomy can both have a place. Does that lens illuminate your experience, or would you rather set it aside?';

export default function PerryLensFounderPreview() {
  const [choice, setChoice] = useState<Choice>('usual');
  const [posture, setPosture] = useState<SimulatedPosture>('ordinary');
  const [result, setResult] = useState<PreviewResult>('idle');

  const selectChoice = (next: Choice) => {
    setChoice(next);
    setResult('idle');
  };

  const selectPosture = (next: SimulatedPosture) => {
    setPosture(next);
    setResult('idle');
  };

  const previewFictionalTurn = () => {
    if (choice === 'usual') {
      setResult('usual');
      return;
    }

    // IMPORTANT: the posture below is a FICTIONAL preview control, NOT a
    // lookup of the founder's actual localStorage or account. It simulates
    // the existing pure per-turn carriage helper and makes NO request.
    const fictitiousStorage = {
      getItem(key: string): string | null {
        if (key !== 'maia_settings' || posture === 'unresolved') return null;
        return JSON.stringify({ sanctuary: posture === 'sanctuary' });
      },
    };
    const prepared = preparePerryClientSelection(
      PERRY_CLIENT_SOURCE_CHOICE,
      { sanctuaryEnteredByCurrentTurn: false },
      fictitiousStorage,
    );

    if (prepared.status === 'prepared') {
      setResult('perry');
    } else if (prepared.reason === 'sanctuary_active') {
      setResult('blocked_sanctuary');
    } else {
      setResult('blocked_unresolved');
    }
  };

  const currentText =
    result === 'usual' ? USUAL_REPLY
    : result === 'perry' ? PERRY_INSPIRED_REPLY
    : null;

  return (
    <main className="perryDemo">
      <style>{`
        .perryDemo{min-height:100vh;background:#f6f5ef;color:#25332f;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:clamp(22px,5vw,64px) 16px;}
        .perryDemo *{box-sizing:border-box;}
        .perryDemo .perryFrame{max-width:800px;margin:0 auto;}
        .perryDemo .perryEyebrow{font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#56766c;}
        .perryDemo h1{font-size:clamp(30px,5vw,45px);line-height:1.13;letter-spacing:-.03em;font-weight:550;margin:14px 0;}
        .perryDemo .perryIntro{font-size:17px;line-height:1.6;color:#51605a;max-width:670px;}
        .perryDemo .perryNotice{margin-top:20px;padding:15px 18px;border:1px solid #d2d9cf;border-radius:13px;background:#edf0e9;font-size:14px;line-height:1.55;color:#394f44;}
        .perryDemo h2{font-size:20px;font-weight:650;letter-spacing:-.015em;margin:0 0 14px;}
        .perryDemo .perryPanel{background:#fffefa;border-radius:18px;border:1px solid #dce1d7;padding:24px;margin-top:22px;box-shadow:0 8px 28px rgba(36,54,45,.04);}
        .perryDemo .perryChoices{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .perryDemo .perryChoice{border:1px solid #ccd4cb;border-radius:14px;background:#fcfdf9;padding:18px;text-align:left;cursor:pointer;color:#243a34;min-height:125px;}
        .perryDemo .perryChoice[data-selected="true"]{border:2px solid #356a5d;padding:17px;background:#eff6f1;}
        .perryDemo .perryChoice:focus-visible,.perryDemo .perryAction:focus-visible,.perryDemo select:focus-visible{outline:3px solid #559f89;outline-offset:3px;}
        .perryDemo .perryChoice strong{display:block;font-size:16px;margin-bottom:7px;}
        .perryDemo .perryChoice span{display:block;color:#5d6a62;line-height:1.45;font-size:14px;}
        .perryDemo .perryControl{display:flex;align-items:center;gap:14px;justify-content:space-between;margin-top:20px;flex-wrap:wrap;}
        .perryDemo label{font-size:14px;font-weight:600;color:#4a5d52;}
        .perryDemo select{padding:11px 13px;border-radius:9px;border:1px solid #a9baae;background:#fffefa;color:#263c33;font-size:15px;min-width:240px;}
        .perryDemo .perrySample{border-left:3px solid #77998c;padding:2px 0 2px 16px;color:#42564d;font-size:17px;line-height:1.6;}
        .perryDemo .perryAction{padding:14px 22px;font-size:16px;border-radius:11px;border:0;background:#315d53;color:#fff;cursor:pointer;font-weight:650;margin-top:20px;}
        .perryDemo .perryAction:hover{background:#25463f;}
        .perryDemo .perryAnswer{background:#f1f4ee;border-radius:12px;padding:18px 20px;line-height:1.65;font-size:16px;color:#2b443a;margin-top:18px;}
        .perryDemo .perrySmall{font-size:13px;color:#617267;line-height:1.55;margin-top:14px;}
        @media(max-width:560px){.perryDemo .perryChoices{grid-template-columns:1fr}.perryDemo .perryPanel{padding:18px}.perryDemo .perryChoice{min-height:0}}
      `}</style>

      <div className="perryFrame">
        <div className="perryEyebrow">MAIA · Founder review · Fictional preview</div>
        <h1>Explore a symbolic perspective</h1>
        <p className="perryIntro">
          A proposed way for members to choose an interpretive lens inspired by Glenn Perry’s AstroPsychology,
          without losing MAIA’s own voice or the member’s right to decide what a symbol means.
        </p>
        <div className="perryNotice" role="note" data-testid="preview-notice">
          <strong>Preview only.</strong> No conversation is sent, no personal chart is read, and
          Glenn Perry’s books are not available to this feature. The source remains under editorial and rights review.
        </div>

        <section className="perryPanel" aria-labelledby="lens-heading">
          <h2 id="lens-heading">How would you like MAIA to approach this?</h2>
          <div className="perryChoices">
            <button
              type="button" className="perryChoice" data-selected={choice === 'usual'}
              data-testid="usual-choice" aria-pressed={choice === 'usual'}
              onClick={() => selectChoice('usual')}>
              <strong>Stay with MAIA</strong>
              <span>A grounded conversation, without an added astrological perspective.</span>
            </button>
            <button
              type="button" className="perryChoice" data-selected={choice === 'perry'}
              data-testid="perry-choice" aria-pressed={choice === 'perry'}
              onClick={() => selectChoice('perry')}>
              <strong>Explore with Glenn Perry’s perspective</strong>
              <span>Consider emotional needs, symbolic tensions, and the evolving personal story.</span>
            </button>
          </div>
          <div className="perryControl">
            <label htmlFor="perry-fixture-posture">Simulated privacy setting</label>
            <select
              id="perry-fixture-posture" data-testid="fixture-posture"
              value={posture}
              onChange={(e) => selectPosture(e.target.value as SimulatedPosture)}>
              <option value="ordinary">Ordinary conversation</option>
              <option value="sanctuary">Sanctuary</option>
              <option value="unresolved">Setting unavailable</option>
            </select>
          </div>
          <p className="perrySmall">
            This dropdown changes only a fictional test setting. It does not change your account or MAIA’s privacy mode.
          </p>
        </section>

        <section className="perryPanel" aria-labelledby="sample-heading">
          <h2 id="sample-heading">An example conversation</h2>
          <p className="perrySample" data-testid="sample-message">“{SAMPLE_MESSAGE}”</p>
          <button type="button" className="perryAction" data-testid="preview-turn"
            onClick={previewFictionalTurn}>Preview example response</button>
          <div aria-live="polite" aria-atomic="true" role="status" data-testid="preview-result">
            {currentText ? (
              <div className="perryAnswer">
                <strong>Illustrative MAIA wording, not generated by a model</strong>
                <p style={{margin:'10px 0 0'}}>{currentText}</p>
              </div>
            ) : result === 'blocked_sanctuary' ? (
              <div className="perryAnswer">The optional Perry lens is withheld while Sanctuary is active in this simulated turn.</div>
            ) : result === 'blocked_unresolved' ? (
              <div className="perryAnswer">The optional Perry lens is withheld because the simulated privacy setting is unresolved.</div>
            ) : null}
          </div>
          <p className="perrySmall">
            The eventual member experience must be optional, clearly attributed, and immediately reversible.
            This preview does not make the teaching available in live MAIA.
          </p>
        </section>
      </div>
    </main>
  );
}

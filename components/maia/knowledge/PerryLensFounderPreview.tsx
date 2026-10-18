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
import { GLENN_PERRY_WISDOM_KEEPER_LINKS } from '@/lib/maia/knowledge/perryWisdomKeeperLinks';
import {
  FIRST_WISDOM_CIRCLE_MOVEMENTS,
  FIRST_WISDOM_CIRCLE_DURATION_MINUTES,
} from '@/lib/maia/knowledge/wisdomFirstCircleRehearsal';
import {
  WISDOM_GATHERING_DELIVERY_PREVIEW,
  type WisdomGatheringPreviewMode,
} from '@/lib/maia/knowledge/wisdomGatheringDeliveryPreview';

type Choice = 'usual' | 'perry';
type SimulatedPosture = 'ordinary' | 'sanctuary' | 'unresolved';
type PreviewResult = 'idle' | 'usual' | 'perry' | 'blocked_sanctuary' | 'blocked_unresolved';
type HostedFieldPerspective = 'member' | 'keeper';

const SAMPLE_MESSAGE = 'I want closeness, but sometimes it feels like I lose myself.';

const USUAL_REPLY =
  'Wanting closeness and wanting room for yourself can both matter. What happens in the moments when closeness starts to feel crowded?';

const PERRY_INSPIRED_REPLY =
  'As an optional symbolic perspective, Glenn Perry’s AstroPsychology explores how different needs and psychological functions can interact across a developing life story. One question here might be how intimacy and autonomy can both have a place. Does that lens illuminate your experience, or would you rather set it aside?';

export default function PerryLensFounderPreview() {
  const [choice, setChoice] = useState<Choice>('usual');
  const [posture, setPosture] = useState<SimulatedPosture>('ordinary');
  const [result, setResult] = useState<PreviewResult>('idle');
  const [hostedFieldPerspective, setHostedFieldPerspective] = useState<HostedFieldPerspective>('member');
  const [firstCircleStep, setFirstCircleStep] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState<WisdomGatheringPreviewMode>('online');
  const currentMovement = FIRST_WISDOM_CIRCLE_MOVEMENTS[firstCircleStep];
  const delivery = WISDOM_GATHERING_DELIVERY_PREVIEW[deliveryMode];

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
        .perryDemo .keeperIntro{color:#4b6056;font-size:15px;line-height:1.6;margin:0 0 20px;}
        .perryDemo .keeperList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
        .perryDemo .keeperLink{display:block;border:1px solid #d4dcd3;border-radius:13px;padding:15px 16px;color:#255d50;text-decoration:none;min-width:0;background:#fafcf8;}
        .perryDemo .keeperLink:hover{background:#edf5ef;border-color:#85aea0;text-decoration:underline;text-underline-offset:3px;}
        .perryDemo .keeperLink:focus-visible{outline:3px solid #559f89;outline-offset:3px;}
        .perryDemo .keeperLink strong{display:block;font-size:15px;font-weight:650;overflow-wrap:anywhere;line-height:1.5;}
        .perryDemo .keeperLink small{display:block;margin-top:5px;color:#586d60;font-size:13px;line-height:1.45;}
        .perryDemo .keeperNote{font-size:13px;line-height:1.6;margin-top:18px;color:#62736a;}
        .perryDemo .commonsSteps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:20px;}
        .perryDemo .commonsStep{padding:17px 18px;border:1px solid #d4dcd3;background:#fafcf8;border-radius:13px;min-width:0;}
        .perryDemo .commonsStep .number{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#677e6d;font-weight:700;}
        .perryDemo .commonsStep strong{display:block;font-size:17px;margin:8px 0;color:#294d42;}
        .perryDemo .commonsStep p{margin:0;color:#576a5c;font-size:14px;line-height:1.55;}
        .perryDemo .commonsGuard{margin-top:18px;padding:14px 18px;border-radius:12px;background:#edf1e9;border:1px solid #d3ded2;font-size:14px;line-height:1.6;color:#4a6053;}
        .perryDemo .hostedViewSwitch{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 23px;}
        .perryDemo .hostedViewOption{border:1px solid #c9d6cc;border-radius:11px;background:#fafcf8;padding:11px 15px;color:#2c5447;font-size:14px;font-weight:650;cursor:pointer;}
        .perryDemo .hostedViewOption[data-selected="true"]{border-color:#3d7665;background:#eaf3ec;color:#204b3d;}
        .perryDemo .hostedViewOption:focus-visible{outline:3px solid #559f89;outline-offset:3px;}
        .perryDemo .hostedFieldGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;}
        .perryDemo .hostedFieldCell{border:1px solid #dae2d7;border-radius:13px;background:#fcfdf9;padding:18px;min-width:0;}
        .perryDemo .hostedFieldCell strong{font-size:16px;display:block;color:#28483f;margin-bottom:8px;}
        .perryDemo .hostedFieldCell p{font-size:14px;line-height:1.6;color:#5a695f;margin:0;}
        .perryDemo .hostedFieldBoundary{margin-top:19px;padding:15px 18px;border-left:3px solid #6f9681;border-radius:8px;background:#eff3ec;font-size:14px;line-height:1.6;color:#435f4e;}
        .perryDemo .rehearsalSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0 21px;}
        .perryDemo .rehearsalStep{border:1px solid #cbd6cc;border-radius:11px;background:#fafcf8;padding:12px;text-align:left;color:#365349;cursor:pointer;min-height:76px;}
        .perryDemo .rehearsalStep[aria-current="step"]{border-color:#316b57;background:#e8f2e9;}
        .perryDemo .rehearsalStep:focus-visible,.perryDemo .rehearsalControl:focus-visible{outline:3px solid #559f89;outline-offset:3px;}
        .perryDemo .rehearsalStep small{font-size:12px;display:block;color:#657769;margin-bottom:5px;}
        .perryDemo .rehearsalStep strong{display:block;font-size:14px;line-height:1.35;}
        .perryDemo .rehearsalContent{padding:21px;border-radius:15px;border:1px solid #d5dfd4;background:#f1f5ef;}
        .perryDemo .rehearsalContent .cueTime{font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#497263;}
        .perryDemo .rehearsalContent h3{margin:8px 0 10px;font-size:22px;font-weight:650;color:#29453b;}
        .perryDemo .rehearsalContent p{margin:9px 0;color:#3f5549;line-height:1.65;font-size:15px;}
        .perryDemo .rehearsalControls{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;}
        .perryDemo .rehearsalControl{padding:12px 16px;border-radius:10px;background:#315d53;color:white;font-weight:650;border:1px solid #315d53;cursor:pointer;}
        .perryDemo .rehearsalControl[data-variant="secondary"]{background:transparent;color:#315d53;border-color:#b4c8ba;}
        .perryDemo .rehearsalControl:disabled{opacity:.45;cursor:not-allowed;}
        .perryDemo .deliverySwitch{display:flex;flex-wrap:wrap;gap:10px;margin:19px 0 22px;}
        .perryDemo .deliveryOption{padding:12px 17px;border:1px solid #c4d5c9;border-radius:10px;background:#f8faf6;color:#325e4e;cursor:pointer;font-weight:650;font-size:15px;}
        .perryDemo .deliveryOption[aria-pressed="true"]{background:#e7f1e9;border-color:#447a67;}
        .perryDemo .deliveryOption:focus-visible{outline:3px solid #559f89;outline-offset:3px;}
        .perryDemo .deliveryGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:20px 0;}
        .perryDemo .deliveryCell{background:#fafcf8;border:1px solid #d5dfd6;border-radius:13px;padding:18px;min-width:0;}
        .perryDemo .deliveryCell strong{display:block;font-size:15px;color:#244d3d;margin-bottom:7px;}
        .perryDemo .deliveryCell p{font-size:14px;color:#53645a;line-height:1.6;margin:0;}
        .perryDemo .deliveryBoundary{margin-top:18px;background:#edf2e9;border-radius:12px;padding:16px 18px;color:#3d594a;line-height:1.6;font-size:14px;}
        @media(max-width:560px){.perryDemo .deliveryGrid{grid-template-columns:1fr}}
        @media(max-width:560px){.perryDemo .rehearsalSteps{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.perryDemo .hostedFieldGrid{grid-template-columns:1fr}}
        @media(max-width:560px){.perryDemo .commonsSteps{grid-template-columns:1fr}}
        @media(max-width:560px){.perryDemo .keeperList{grid-template-columns:1fr}}
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

        <section className="perryPanel" aria-labelledby="keeper-heading" data-testid="wisdom-keeper-links">
          <div className="perryEyebrow">Honoring the source</div>
          <h2 id="keeper-heading" style={{marginTop:10}}>Explore Glenn Perry’s original work</h2>
          <p className="keeperIntro">
            The original writer, teacher, and school remain visible. Visit his websites,
            explore his books and essays, or study directly with the Academy of AstroPsychology.
            MAIA’s commentary is separate from his own voice.
          </p>
          <div className="keeperList" role="list">
            {GLENN_PERRY_WISDOM_KEEPER_LINKS.map((resource) => (
              <div role="listitem" key={resource.id}>
                <a className="keeperLink" href={resource.url}
                  data-testid={`keeper-link-${resource.id}`}
                  target="_blank" rel="noopener noreferrer">
                  <strong>{resource.label} <span aria-hidden="true">↗</span></strong>
                  <small>{resource.description}</small>
                </a>
              </div>
            ))}
          </div>
          <p className="keeperNote">
            External links go directly to the author’s and Academy’s websites. This is an
            independent, attributed research preview—not a licensed edition of his texts or
            a claim that Glenn Perry endorses MAIA. Following a link is always your choice.
          </p>
        </section>

        <section className="perryPanel" aria-labelledby="commons-heading" data-testid="wisdom-keepers-commons-concept">
          <div className="perryEyebrow">Possible Soullab community service · Founder concept</div>
          <h2 id="commons-heading" style={{marginTop:10}}>A living Commons of wisdom and relationship</h2>
          <p className="keeperIntro">
            Beyond books and links, Soullab could help interested people discover one another,
            gather around meaningful questions, and invite original wisdom keepers into genuine
            encounters when those keepers choose to participate. There are no pay-to-meet
            rankings or automatic introductions.
          </p>
          <div className="commonsSteps" role="list">
            <div className="commonsStep" role="listitem">
              <span className="number">01 · Begin with the source</span>
              <strong>Discover and honor</strong>
              <p>Read the keeper’s original work at its source and see a transparent, accurate attribution.</p>
            </div>
            <div className="commonsStep" role="listitem">
              <span className="number">02 · Choose an interest</span>
              <strong>Gather around a question</strong>
              <p>Intentionally declare an interest and, when available, enter a consensual study Circle—never matched from private MAIA material.</p>
            </div>
            <div className="commonsStep" role="listitem">
              <span className="number">03 · An optional human invitation</span>
              <strong>Encounter a wisdom keeper</strong>
              <p>A keeper may accept a carefully scoped conversation or gathering, with mutually agreed time, care and compensation.</p>
            </div>
            <div className="commonsStep" role="listitem">
              <span className="number">04 · A contribution freely offered</span>
              <strong>Return a gift to the field</strong>
              <p>Support may mean gratitude, study, service, a direct book purchase or a voluntary contribution—without ranking or obligation.</p>
            </div>
          </div>
          <div className="commonsGuard" role="note" data-testid="commons-proposal-only">
            <strong>Concept only.</strong> Glenn Perry is currently an independently referenced author,
            <strong> not a participating Soullab partner.</strong> There is no active interest sign-up,
            gathering, invitation, recording, fund or member-to-keeper introduction on this page.
            Private and Sanctuary conversations are never used to recruit or profile participants.
          </div>
        </section>

        <section className="perryPanel" aria-labelledby="hosted-field-heading" data-testid="keeper-hosted-field-concept">
          <div className="perryEyebrow">Future invitation · Fictional field prototype</div>
          <h2 id="hosted-field-heading" style={{marginTop:10}}>Inside a keeper-hosted field</h2>
          <p className="keeperIntro">
            Imagine a real teacher who has accepted a scoped Soullab invitation, and members
            who freely choose to gather with them. This is a possible human studio—not an
            automated mentor, clinical service, marketplace, or new category of field.
          </p>
          <div className="hostedViewSwitch" role="group" aria-label="View hypothetical field as">
            <button type="button" className="hostedViewOption" data-testid="field-member-view"
              data-selected={hostedFieldPerspective === 'member'}
              aria-pressed={hostedFieldPerspective === 'member'}
              onClick={() => setHostedFieldPerspective('member')}>
              Visiting as a member
            </button>
            <button type="button" className="hostedViewOption" data-testid="field-keeper-view"
              data-selected={hostedFieldPerspective === 'keeper'}
              aria-pressed={hostedFieldPerspective === 'keeper'}
              onClick={() => setHostedFieldPerspective('keeper')}>
              Viewing as an invited keeper
            </button>
          </div>

          <div className="hostedFieldGrid" data-testid="hosted-field-content">
            {hostedFieldPerspective === 'member' ? (
              <>
                <div className="hostedFieldCell">
                  <strong>Enter by choice</strong>
                  <p>Know who the real human host is, what the gathering offers, what is shared, and how to leave without explanation.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Read and listen</strong>
                  <p>Encounter author-selected public or specifically licensed resources with intact source names and boundaries.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Gather and ask</strong>
                  <p>Join an agreed study Circle or salon, ask questions if the host invites them, or participate through quiet presence.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Keep your own meaning</strong>
                  <p>Reflect privately first. Nothing from MAIA, Sanctuary, or a Circle is promoted to the Commons without valid authorship and consent.</p>
                </div>
              </>
            ) : (
              <>
                <div className="hostedFieldCell">
                  <strong>Speak in your own voice</strong>
                  <p>Review your introduction and decide what your name, lineage, and teachings mean to this specific gathering.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Choose what to share</strong>
                  <p>Offer resources you have the rights to share, or direct people to your original books, essays, recordings, and school.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Set the invitation</strong>
                  <p>Agree on your topics, time, facilitation, accessibility, boundaries, fair compensation, and whether questions are welcome.</p>
                </div>
                <div className="hostedFieldCell">
                  <strong>Pause or withdraw</strong>
                  <p>Do not take on members' private lives or therapy. End new participation without surrendering your name, original work, or authorship.</p>
                </div>
              </>
            )}
          </div>
          <div className="hostedFieldBoundary" role="note" data-testid="hosted-field-not-active">
            <strong>Not an active room.</strong> No keeper has been approved through this design.
            Glenn Perry remains an unaffiliated referenced author. No invitations, signups,
            member information, recordings, calendar events, payments, or messages are handled here.
            A real Keeper Field would require separate founder, keeper, member, and technical approvals.
          </div>
        </section>

        <section className="perryPanel" aria-labelledby="rehearsal-heading" data-testid="first-circle-rehearsal">
          <div className="perryEyebrow">Founder-led human pilot · Fictional guided rehearsal</div>
          <h2 id="rehearsal-heading" style={{marginTop:10}}>Where Symbols Meet Life</h2>
          <p className="keeperIntro">
            Rehearse a proposed {FIRST_WISDOM_CIRCLE_DURATION_MINUTES}-minute educational gathering:
            six movements, one human host, and no compulsory sharing. Glenn Perry is an
            attributed public reference, not a host, partner or guest.
          </p>
          <div className="rehearsalSteps" role="group" aria-label="Choose a rehearsal movement">
            {FIRST_WISDOM_CIRCLE_MOVEMENTS.map((movement, index) => (
              <button type="button" className="rehearsalStep" key={movement.id}
                data-testid={`rehearsal-stage-${movement.id}`}
                aria-current={index === firstCircleStep ? 'step' : undefined}
                onClick={() => setFirstCircleStep(index)}>
                <small>{movement.startMinute}–{movement.endMinute} min</small>
                <strong>{movement.title}</strong>
              </button>
            ))}
          </div>
          <div className="rehearsalContent" aria-live="polite" aria-atomic="true"
            data-testid="rehearsal-active">
            <span className="cueTime">
              Movement {firstCircleStep + 1} of {FIRST_WISDOM_CIRCLE_MOVEMENTS.length} ·
              {' '}{currentMovement.startMinute}–{currentMovement.endMinute} min · {currentMovement.element}
            </span>
            <h3>{currentMovement.title}</h3>
            <p><strong>Host invitation:</strong> “{currentMovement.invitation}”</p>
            <p><strong>Protect this boundary:</strong> {currentMovement.boundary}</p>
          </div>
          <div className="rehearsalControls">
            <button type="button" className="rehearsalControl"
              data-testid="rehearsal-next"
              disabled={firstCircleStep === FIRST_WISDOM_CIRCLE_MOVEMENTS.length - 1}
              onClick={() => setFirstCircleStep((index) => Math.min(
                index + 1, FIRST_WISDOM_CIRCLE_MOVEMENTS.length - 1
              ))}>Next movement</button>
            <button type="button" className="rehearsalControl"
              data-testid="rehearsal-restart" data-variant="secondary"
              onClick={() => setFirstCircleStep(0)}>Start again</button>
          </div>
          <p className="keeperNote" data-testid="rehearsal-safety">
            Rehearsal only: this does not run a clock, schedule or register participants,
            record a meeting, call MAIA, or send any invitation. Real hosting requires
            a separately verified Circle/venue, privacy controls and a founder go/no-go.
          </p>
        </section>

        <section className="perryPanel" aria-labelledby="delivery-heading" data-testid="wisdom-gathering-delivery-preview">
          <div className="perryEyebrow">Proposed sequence · Founder review</div>
          <h2 id="delivery-heading" style={{marginTop:10}}>Online first, then hybrid</h2>
          <p className="keeperIntro">
            Let the human community find its rhythm online before introducing venues,
            microphones and local gatherings. The same consent and author boundaries apply
            in either format. This is a future service design, not a meeting link.
          </p>
          <div className="deliverySwitch" role="group" aria-label="Compare proposed gathering formats">
            <button type="button" className="deliveryOption" data-testid="format-online"
              aria-pressed={deliveryMode === 'online'}
              onClick={() => setDeliveryMode('online')}>Online first</button>
            <button type="button" className="deliveryOption" data-testid="format-hybrid"
              aria-pressed={deliveryMode === 'hybrid'}
              onClick={() => setDeliveryMode('hybrid')}>Hybrid later</button>
          </div>
          <div data-testid="delivery-selected">
            <div className="perryEyebrow">{delivery.status}</div>
            <h3 style={{fontSize:22,color:'#29453b',fontWeight:650,margin:'8px 0 12px'}}>
              {delivery.heading}
            </h3>
            <p className="keeperIntro">{delivery.description}</p>
            <div className="deliveryGrid" role="list">
              {delivery.promises.map((promise) => (
                <div className="deliveryCell" role="listitem" key={promise.heading}>
                  <strong>{promise.heading}</strong>
                  <p>{promise.explanation}</p>
                </div>
              ))}
            </div>
            <div className="deliveryBoundary" role="note" data-testid="delivery-not-live">
              {delivery.boundary}
            </div>
          </div>
          <p className="keeperNote" data-testid="delivery-access-note">
            No participants are being enrolled; no provider is selected; no room or public stream is running.
            Any future keeper-led gathering requires the keeper's consent, event-specific
            participation terms, and separate human and technical approval.
          </p>
        </section>
      </div>
    </main>
  );
}

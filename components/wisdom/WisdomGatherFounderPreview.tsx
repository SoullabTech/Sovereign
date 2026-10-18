'use client';

/**
 * Founder-only read-only representation of the intended Wisdom-room placement.
 * Page gateway: app/wisdom-keepers/wisdom/gather-preview/page.tsx.
 *
 * No real Circle, enrolment, keeper approval, provider, member data, session,
 * MAIA inference, logging, recording or commerce. This is NOT rendered in the
 * normal /wisdom-keepers/wisdom page and can be accessed only if the separate
 * server-side founder preview door is enabled.
 */
import { useState } from 'react';
import {
  WISDOM_GATHER_STAGES,
  WISDOM_GATHER_FICTIONAL_PILOT,
  type WisdomGatherStageId,
} from '@/lib/wisdom/wisdomGatherPreview';

export default function WisdomGatherFounderPreview() {
  const [stageId, setStageId] = useState<WisdomGatherStageId>('source');
  const currentStage = WISDOM_GATHER_STAGES.find(stage => stage.id === stageId)
    ?? WISDOM_GATHER_STAGES[0];

  return (
    <main className="gatherPreview">
      <style>{`
        .gatherPreview{box-sizing:border-box;min-height:100vh;padding:clamp(22px,5vw,58px) 16px 88px;background:radial-gradient(ellipse 65% 32% at 20% 0%,#253b3e 0%,transparent 80%),linear-gradient(120deg,#10191d,#1d2630 54%,#172329);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f4f1e9;}
        .gatherPreview *{box-sizing:border-box}
        .gatherPreview .wrap{max-width:930px;margin:0 auto}
        .gatherPreview .breadcrumb{font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#e1c69a;font-weight:650;}
        .gatherPreview .hero{border:1px solid #3a4848;background:#19262a;border-radius:22px;padding:clamp(23px,4vw,42px);margin-top:18px;}
        .gatherPreview h1{font-weight:560;font-size:clamp(34px,6vw,53px);letter-spacing:-.04em;line-height:1.06;margin:16px 0 15px}
        .gatherPreview .lead{font-size:17px;line-height:1.7;color:#d1dcd2;max-width:690px;margin:0}
        .gatherPreview .status{display:inline-block;background:#344942;border:1px solid #739583;padding:6px 11px;border-radius:30px;color:#e3eadc;font-size:12px;font-weight:700;letter-spacing:.03em}
        .gatherPreview .guard{margin-top:23px;padding:17px 20px;border-radius:13px;background:#253536;color:#e2e8df;border:1px solid #51685e;line-height:1.65;font-size:14px}
        .gatherPreview h2{font-size:24px;letter-spacing:-.02em;font-weight:600;margin:0 0 8px}
        .gatherPreview .sectionIntro{color:#c4cfc7;font-size:15px;line-height:1.65;margin:0 0 18px}
        .gatherPreview .panel{margin-top:24px;border:1px solid #3a4949;border-radius:20px;padding:clamp(20px,3vw,30px);background:#1b292d}
        .gatherPreview .stageGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
        .gatherPreview .stage{padding:16px 13px;border-radius:13px;border:1px solid #4b6260;background:#223439;color:#d9e6dd;min-width:0;min-height:112px;text-align:left;cursor:pointer}
        .gatherPreview .stage[data-active="true"]{background:#365248;border-color:#b7cdaa;color:#ffffff;}
        .gatherPreview .stage:hover{background:#304a47}
        .gatherPreview .stage:focus-visible,.gatherPreview a:focus-visible{outline:3px solid #cfb27d;outline-offset:3px}
        .gatherPreview .stage small{display:block;color:#c4d6c7;margin-bottom:9px;font-size:12px;font-weight:650}
        .gatherPreview .stage strong{font-size:14px;line-height:1.36;display:block}
        .gatherPreview .stageBody{margin-top:18px;border:1px solid #506563;border-radius:15px;padding:23px;background:#25373a}
        .gatherPreview .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#d8c397;font-weight:700}
        .gatherPreview .stageBody h3{font-size:25px;letter-spacing:-.025em;margin:11px 0 10px;font-weight:600}
        .gatherPreview .stageBody p{font-size:15px;line-height:1.7;color:#e0e7dd;max-width:760px}
        .gatherPreview .rule{margin-top:16px;padding:13px 16px;border-left:3px solid #d0b784;background:#233335;border-radius:8px;font-size:14px;line-height:1.6;color:#dce5d8}
        .gatherPreview .standing{margin-top:14px;font-size:13px;line-height:1.6;color:#edd8b5}
        .gatherPreview .summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
        .gatherPreview .detail{border:1px solid #3d5450;background:#233238;border-radius:12px;padding:16px}
        .gatherPreview .detail dt{color:#c5d4ca;font-size:12px;margin:0 0 8px}
        .gatherPreview .detail dd{font-size:15px;line-height:1.5;margin:0;color:#f4f0e8}
        .gatherPreview .sourceLinks{display:flex;gap:12px;flex-wrap:wrap;margin-top:17px}
        .gatherPreview .sourceLinks a{padding:11px 15px;display:inline-block;text-decoration:none;border-radius:10px;border:1px solid #71958b;color:#edf0de;background:#2d4240;font-size:14px;font-weight:600}
        .gatherPreview .sourceLinks a:hover{text-decoration:underline;text-underline-offset:3px}
        .gatherPreview .minor{font-size:13px;line-height:1.65;color:#c0cec5;margin-top:15px}
        @media(max-width:640px){.gatherPreview .stageGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.gatherPreview .stage{min-height:86px}.gatherPreview .summary{grid-template-columns:1fr}}
      `}</style>

      <div className="wrap">
        <div className="breadcrumb" data-testid="gather-placement">Home / Wisdom Keepers / Gather Together</div>
        <header className="hero">
          <span className="status" data-testid="founder-review-status">Founder review · Interactive prototype · Not yet open</span>
          <h1>Gather Together</h1>
          <p className="lead">
            A place where members can discover original teachers, choose
            to gather, and encounter one another in consenting Circles.
            Review how this could become a living part of Soullab.
          </p>
          <div className="guard" role="note" data-testid="not-available">
            <strong>Not a live gathering.</strong> You're reviewing an interactive
            concept for Soullab's Wisdom room. These steps do not create a Circle,
            register an interest, issue an invitation, join a video room, or give
            any wisdom keeper access to members. The actual Wisdom room
            and its members remain unchanged.
          </div>
        </header>

        <section className="panel" aria-labelledby="journey-heading" data-testid="gather-journey">
          <h2 id="journey-heading">One human pathway</h2>
          <p className="sectionIntro">
            Follow the proposed journey. Each step is an illustration, not a working door.
            Nothing here enrolls you or transfers information.
          </p>
          <div role="group" aria-label="Choose an illustrative gathering stage" className="stageGrid">
            {WISDOM_GATHER_STAGES.map((stage,index) => (
              <button
                type="button"
                key={stage.id}
                className="stage"
                data-active={stageId===stage.id}
                data-testid={`gather-stage-${stage.id}`}
                aria-pressed={stageId===stage.id}
                onClick={()=>setStageId(stage.id)}
              >
                <small>{String(index+1).padStart(2,'0')} · {stage.subtitle}</small>
                <strong>{stage.title}</strong>
              </button>
            ))}
          </div>
          <div className="stageBody" aria-live="polite" aria-atomic="true" data-testid="gather-active-stage">
            <div className="eyebrow">{currentStage.subtitle}</div>
            <h3>{currentStage.title}</h3>
            <p>{currentStage.why}</p>
            <p>{currentStage.memberExperience}</p>
            <div className="standing"><strong>Current standing:</strong> {currentStage.currentStanding}</div>
            <div className="rule" data-testid="gather-current-boundary">
              <strong>What stays protected:</strong> {currentStage.boundary}
            </div>
          </div>
        </section>

        <section className="panel" data-testid="gather-pilot" aria-labelledby="pilot-heading">
          <div className="eyebrow">An example first Circle · Not announced</div>
          <h2 id="pilot-heading" style={{marginTop:9}}>{WISDOM_GATHER_FICTIONAL_PILOT.title}</h2>
          <p className="sectionIntro">
            A proposed small online gathering where two human needs can be heard
            without either one being declared wrong. The host holds the group
            procedure; members choose their own meaning.
          </p>
          <dl className="summary">
            <div className="detail"><dt>Human host</dt><dd>{WISDOM_GATHER_FICTIONAL_PILOT.humanHost}</dd></div>
            <div className="detail"><dt>Duration</dt><dd>{WISDOM_GATHER_FICTIONAL_PILOT.durationMinutes} minutes · {WISDOM_GATHER_FICTIONAL_PILOT.group}</dd></div>
            <div className="detail"><dt>Date</dt><dd>{WISDOM_GATHER_FICTIONAL_PILOT.date}</dd></div>
            <div className="detail"><dt>Room</dt><dd>{WISDOM_GATHER_FICTIONAL_PILOT.room}</dd></div>
          </dl>
          <p className="minor">{WISDOM_GATHER_FICTIONAL_PILOT.recording}</p>
        </section>

        <section className="panel" aria-labelledby="keeper-heading" data-testid="gather-keeper-source">
          <h2 id="keeper-heading">Meet the original voices</h2>
          <p className="sectionIntro">{WISDOM_GATHER_FICTIONAL_PILOT.originalSource}.
            His public work may be explored without implying that he participates
            in Soullab or has licensed his books for AI use.
          </p>
          <div className="sourceLinks">
            <a data-testid="gather-link-author" href={WISDOM_GATHER_FICTIONAL_PILOT.authorWebsite}
              target="_blank" rel="noopener noreferrer">Glenn Perry’s website ↗</a>
            <a data-testid="gather-link-academy" href={WISDOM_GATHER_FICTIONAL_PILOT.academyWebsite}
              target="_blank" rel="noopener noreferrer">Academy of AstroPsychology ↗</a>
          </div>
          <p className="minor">
            Links open only if you choose them. No purchase, spiritual ranking,
            public contribution or additional platform membership is required.
            No keeper has been invited or approved through this preview.
          </p>
        </section>
      </div>
    </main>
  );
}

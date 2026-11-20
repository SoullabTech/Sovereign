'use client';

/**
 * The Spark door: Writer's Studio's first-visit opening (JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1).
 *
 * MAIA asks one question (Fire, alone — founder Q4), reflects, and checks she heard right. Holding the spark is a
 * SEPARATE act (ARRIVAL-EXPERIENCE finding 1). The opening conversation itself is never kept (founder Q1): the
 * reflection route stores nothing, and this component keeps the exchange in memory only. The single decision about
 * what reaches the Work is `sparkCommitPlan`, evaluated at the moment the writer chooses where to begin, against the
 * Sanctuary posture as it is THEN. An unreadable posture keeps nothing.
 */
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { applySessionSanctuary } from '@/lib/settings/sessionSanctuaryInit';
import { writeWorkingStyle } from '@/lib/writersStudio/workingStyle';
import {
  CARRY_COPY,
  FACET_COPY,
  INSPIRATION_COPY as C,
  INSPIRATION_UNSURE_ANSWER,
  MAX_SPARK_CHARS,
  facetWorkingStyle,
  sparkCommitPlan,
  type FacetChoice,
  type HeardAnswer,
  type HoldChoice,
} from '@/lib/writersStudio/inspirationOpening';
import { builtStages, type StudioPath } from '@/lib/writersStudio/studioPaths';
import { FORM_CHOICES, FORM_MAX_CHARS, FORM_OWN_WORD_LABEL, FORM_QUESTION, formToSave, formVocabulary, type FormChoice } from '@/lib/writersStudio/formVocabulary';
// Styles: inspiration-opening.css, imported by the Studio pages beside the other Studio stylesheets.

export type DoorDestination = 'write' | 'import' | 'look';

type Turn = { speaker: 'author' | 'maia'; body: string };
type Step = 'door' | 'reflect' | 'hold' | 'begin' | 'talk';
type Posture = 'ordinary' | 'sanctuary' | 'unknown';

function readPosture(): Posture {
  const read = readCurrentSanctuaryPosture();
  if (!read.resolved) return 'unknown';
  return read.sanctuary ? 'sanctuary' : 'ordinary';
}

export default function StudioInspirationOpening(props: {
  busy: boolean;
  error: string | null;
  /**
   * 'door' (S1): the first-visit opening. 'carry' (S4, C · Bring What You Carry): the same reflection and separate hold,
   * asked inside import before anyone reads a word, ending by handing back what may be kept instead of asking where to begin.
   */
  variant?: 'door' | 'carry';
  /** The writer chose where to begin. `purpose` is exactly what `sparkCommitPlan` allows, or null. `form` is what the writer said
   *  it is becoming (founder 2026-11-20), or null if they did not say: never inferred. */
  onBegin?: (destination: DoorDestination, purpose: string | null, form: string | null) => void;
  /** 'carry' only: the import's question is finished. `purpose` is exactly what `sparkCommitPlan` allows, or null. */
  onCarry?: (purpose: string | null) => void;
  onJustWrite?: () => void;
  onHavePages?: () => void;
  /**
   * Studio paths: the member's own link chose this environment (`?path=`). Its first prompt, arena and Begin replace the
   * generic Spark question and destinations. The recommended Work setting is offered pre-ticked and applied only on Begin.
   */
  studioPath?: StudioPath | null;
  onPathBegin?: (choice: { title: string; revisionsPausedConfirmed: boolean; purpose: string | null }) => void;
}) {
  const carry = props.variant === 'carry';
  const studioPath = carry ? null : props.studioPath ?? null;
  const [pathTitle, setPathTitle] = useState(studioPath?.suggestedTitle ?? '');
  const [pathRevisionsPaused, setPathRevisionsPaused] = useState(studioPath?.recommended.maiaRevisionsPaused === true);
  const [step, setStep] = useState<Step>('door');
  const [answer, setAnswer] = useState('');
  const [unsure, setUnsure] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [understood, setUnderstood] = useState<HeardAnswer | null>(null);
  const [revising, setRevising] = useState(false);
  const [holdReached, setHoldReached] = useState(false);
  const [hold, setHold] = useState<HoldChoice | null>(null);
  const [facet, setFacet] = useState<FacetChoice | null>(null);
  const [talkDraft, setTalkDraft] = useState('');
  /* "What is it becoming?" (founder 2026-11-20): the writer's own choice, optional. Nothing is guessed from the spark. */
  const [formChoice, setFormChoice] = useState<FormChoice | null>(null);
  const [formOwn, setFormOwn] = useState('');
  const [formOwnOpen, setFormOwnOpen] = useState(false);
  const chosenForm = formToSave(formChoice, formOwnOpen ? formOwn : '');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [posture, setPosture] = useState<Posture>('unknown');
  /* Founder ruling 2026-11-16 (#1900): at a program students may use, MAIA does not speak until the member has said they are
     18+, or 13–17 with a parent, guardian or teacher supervising. Under 13 is turned away and nothing is kept. The server
     enforces the same at the door and at Begin; this is the member's way to say it. */
  const needsAge = Boolean(studioPath?.requiresAgeAttestation);
  const [age, setAge] = useState<'checking' | 'ask' | 'teen' | 'under13' | 'ok' | 'error'>(needsAge ? 'checking' : 'ok');
  const [supervised, setSupervised] = useState(false);
  const [ageBusy, setAgeBusy] = useState(false);
  useEffect(() => {
    if (!needsAge) return;
    let live = true;
    void (async () => {
      try {
        const r = await apiFetch('/api/sovereign/writers-studio/age-attestation', { method: 'GET' });
        const b = await r.json().catch(() => null) as { attested?: unknown } | null;
        if (!live) return;
        if (r.ok && (b?.attested === 'adult' || b?.attested === 'minor')) setAge('ok');
        else if (r.ok) setAge('ask');
        else setAge('error');
      } catch { if (live) setAge('error'); }
    })();
    return () => { live = false; };
  }, [needsAge]);
  const attest = async (band: 'adult' | 'minor') => {
    setAgeBusy(true);
    try {
      const r = await apiFetch('/api/sovereign/writers-studio/age-attestation', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(band === 'adult' ? { band, path: studioPath?.id } : { band, supervised: true, path: studioPath?.id }),
      });
      setAge(r.ok ? 'ok' : 'error');
    } catch { setAge('error'); } finally { setAgeBusy(false); }
  };

  useEffect(() => {
    // Ordinary is the default (founder ruling 2026-11-16, "we should have Ordinary as default"; Sanctuary invariant 5,
    // "Default off: Sanctuary is an explicit opt-in"). A browser with NO session setting yet starts in Ordinary, shown
    // pressed, with Sanctuary one tap away. Only the absent case: a setting that exists but cannot be read, or storage
    // that cannot be read, stays 'unknown' and keeps nothing (fail-closed), exactly as before.
    const first = readCurrentSanctuaryPosture();
    if (!first.resolved && first.reason === 'no_live_settings') applySessionSanctuary(false);
    setPosture(readPosture());
    const onChange = () => setPosture(readPosture());
    window.addEventListener('maia-settings-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('maia-settings-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  /* The writer's own act, exactly like the Quick Settings toggle. The only default is Ordinary when nothing is set. */
  const choosePosture = (sanctuary: boolean) => {
    applySessionSanctuary(sanctuary);
    setPosture(readPosture());
  };

  const ask = useCallback(async (words: string, prior: Turn[]): Promise<string | null> => {
    setAsking(true);
    setAskError(null);
    try {
      const response = await apiFetch('/api/sovereign/writers-studio/arrival', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answer: words, history: prior, sanctuary: posture === 'sanctuary',
          // The path's id only; MAIA's frame for it is looked up on the server (F20).
          ...(studioPath ? { path: studioPath.id } : {}),
        }),
      });
      const body = await response.json().catch(() => null) as { reply?: unknown } | null;
      if (!response.ok || typeof body?.reply !== 'string') throw new Error(String(response.status));
      return body.reply;
    } catch {
      setAskError(C.unreachable);
      return null;
    } finally {
      setAsking(false);
    }
  }, [posture]);

  const tell = async (words: string, isUnsure: boolean, prior: Turn[]) => {
    const reply = await ask(words, prior);
    if (reply === null) return;
    setAnswer(words);
    setUnsure(isUnsure);
    setReflection(reply);
    setHistory([...prior, { speaker: 'author', body: words }, { speaker: 'maia', body: reply }]);
    setUnderstood(null);
    setRevising(false);
    setStep('reflect');
  };

  const heard = (value: HeardAnswer) => {
    setUnderstood(value);
    if (value !== 'yes') {
      // An unsure answer is the button's words, never the writer's: revising starts from an empty box.
      if (unsure) setAnswer('');
      setRevising(true);
      return;
    }
    // An unsure answer is complete; there is nothing to hold, so the hold question is never shown (F5).
    if (unsure) {
      if (carry) props.onCarry?.(null);
      else setStep('begin');
      return;
    }
    setHoldReached(true);
    setStep('hold');
  };

  const planNow = (holdChoice: HoldChoice | null = hold) => sparkCommitPlan({
    // Evaluated NOW, against the posture as it is now. Anything but a readable Ordinary keeps nothing.
    answer, unsure, reflection, understood, holdReached, hold: holdChoice, sanctuary: posture !== 'ordinary',
  });

  const begin = (destination: DoorDestination) => {
    props.onBegin?.(destination, planNow().purpose, chosenForm);
  };

  /* The hold answer. On the door it leads to "Where would you like to begin?"; inside import (C) it finishes. */
  const decideHold = (choice: HoldChoice) => {
    setHold(choice);
    if (carry) props.onCarry?.(planNow(choice).purpose);
    else setStep('begin');
  };

  const chooseFacet = (choice: FacetChoice) => {
    setFacet(choice);
    const style = facetWorkingStyle(choice);
    if (style) writeWorkingStyle(style);
  };

  const sendTalk = async () => {
    const words = talkDraft.trim() ? talkDraft : '';
    if (!words) return;
    const reply = await ask(words, history);
    if (reply === null) return;
    setHistory([...history, { speaker: 'author', body: words }, { speaker: 'maia', body: reply }]);
    setTalkDraft('');
  };

  const postureControl = (
    <div className="wsio-posture" role="group" aria-label="Ordinary or Sanctuary">
      <button type="button" aria-pressed={posture === 'ordinary'} onClick={() => choosePosture(false)}>Ordinary</button>
      <button type="button" aria-pressed={posture === 'sanctuary'} onClick={() => choosePosture(true)} data-sanctuary>Sanctuary</button>
    </div>
  );

  const tooLong = answer.length > MAX_SPARK_CHARS;
  let body: React.ReactNode;

  if (step === 'door') {
    body = (
      <>
        <div className="wsio-ember" aria-hidden="true" />
        {studioPath ? (
          <div className="wsio-path-head" data-studio-path={studioPath.id}>
            <p className="wsio-path-name">{studioPath.name} · in Writer’s Studio</p>
            <p className="wsio-note">{studioPath.arena}</p>
            {/* Claim discipline: only stages that exist in the Studio today are shown. */}
            <p className="wsio-path-stage">You’re at: {builtStages(studioPath)[0]?.stage}</p>
          </div>
        ) : null}
        <p className="wsio-who">MAIA</p>
        {carry ? <h2 className="wsio-maia wsio-small">{CARRY_COPY.question}</h2>
          : studioPath ? <h1 className="wsio-maia wsio-small">{studioPath.firstPrompt}</h1>
          : <h1 className="wsio-maia">{C.question}</h1>}
        <p className="wsio-note">{carry ? CARRY_COPY.invitation : studioPath ? studioPath.invitation : C.invitation}</p>
        <label className="wsio-label" htmlFor="wsio-answer">{C.answerLabel}</label>
        <textarea id="wsio-answer" className="wsio-input" rows={3} value={answer} autoFocus
          onChange={(e) => setAnswer(e.target.value)} />
        <div className="wsio-row">
          <button type="button" className="fr-home-primary" disabled={asking || !answer.trim()}
            onClick={() => void tell(answer, false, [])}>{asking ? 'MAIA is listening…' : C.tell}</button>
          <button type="button" className="fr-home-quiet" disabled={asking}
            onClick={() => void tell(INSPIRATION_UNSURE_ANSWER, true, [])}>{C.unsure}</button>
        </div>
        {carry ? (
          <div className="wsio-row wsio-ways">
            <button type="button" className="wsio-link" onClick={() => props.onCarry?.(null)}>Skip this</button>
          </div>
        ) : (
          <div className="wsio-row wsio-ways">
            <button type="button" className="wsio-link" disabled={props.busy}
              onClick={studioPath ? () => setStep('begin') : props.onJustWrite}>{C.justWrite}</button>
            <button type="button" className="wsio-link" onClick={props.onHavePages}>{C.havePages}</button>
          </div>
        )}
        {posture === 'sanctuary' ? <p className="wsio-note wsio-sanctuary">Sanctuary is on. This session won’t be remembered. Speak freely.</p> : null}
      </>
    );
  } else if (step === 'reflect') {
    body = (
      <>
        <p className="wsio-who">You</p>
        <p className="wsio-writer">{answer}</p>
        <p className="wsio-who">MAIA</p>
        <p className="wsio-maia wsio-small" data-maia-reflection>{reflection}</p>
        {!revising ? (
          <div className="wsio-row" role="group" aria-label={C.heardQuestion}>
            <button type="button" className="fr-home-primary" onClick={() => heard('yes')}>{C.heard.yes}</button>
            <button type="button" className="fr-home-quiet" onClick={() => heard('partly')}>{C.heard.partly}</button>
            <button type="button" className="fr-home-quiet" onClick={() => heard('not_quite')}>{C.heard.not_quite}</button>
            <button type="button" className="fr-home-quiet" onClick={() => heard('differently')}>{C.heard.differently}</button>
          </div>
        ) : (
          <div className="wsio-stack">
            <label className="wsio-label" htmlFor="wsio-revise">{C.whatChange}</label>
            <textarea id="wsio-revise" className="wsio-input" rows={3} value={answer} autoFocus
              onChange={(e) => setAnswer(e.target.value)} />
            <div className="wsio-row">
              <button type="button" className="fr-home-primary" disabled={asking || !answer.trim()}
                onClick={() => void tell(answer, false, history)}>{asking ? 'MAIA is listening…' : C.tell}</button>
              <button type="button" className="fr-home-quiet" onClick={() => setRevising(false)}>Back</button>
            </div>
          </div>
        )}
      </>
    );
  } else if (step === 'hold') {
    body = posture === 'unknown' ? (
      <>
        <p className="wsio-who">MAIA</p>
        <p className="wsio-maia wsio-small">Before I ask about keeping anything: is this an Ordinary session, or Sanctuary?</p>
        <p className="wsio-note">Ordinary can keep what you choose. Sanctuary keeps nothing.</p>
        {postureControl}
      </>
    ) : posture === 'sanctuary' ? (
      <>
        <div className="wsio-ember wsio-water" aria-hidden="true" />
        <p className="wsio-maia wsio-small">{C.sanctuaryHold}</p>
        <div className="wsio-row">
          <button type="button" className="fr-home-primary" onClick={() => decideHold('not_yet')}>Continue</button>
          <button type="button" className="wsio-link" onClick={() => choosePosture(false)}>{C.switchToOrdinary}</button>
        </div>
      </>
    ) : (
      <>
        <p className="wsio-who">MAIA</p>
        <p className="wsio-maia wsio-small">{C.holdQuestion}</p>
        {tooLong ? <p className="wsio-note" role="status">{C.tooLong}</p> : null}
        <div className="wsio-choices">
          {!tooLong ? (
            <button type="button" className="wsio-choice" onClick={() => decideHold('own')}>
              <b>{C.holdOwn}</b><span>{C.holdOwnHint}</span>
            </button>
          ) : (
            <button type="button" className="wsio-choice" onClick={() => { setRevising(true); setStep('reflect'); }}>
              <b>Say it in fewer words</b><span>Your full words can still go on the page</span>
            </button>
          )}
          <button type="button" className="wsio-choice" onClick={() => decideHold('not_yet')}>
            <b>{C.notYet}</b><span>{C.notYetHint}</span>
          </button>
        </div>
        <p className="wsio-note">{C.holdScope}</p>
      </>
    );
  } else if (step === 'begin' && studioPath) {
    const setting = studioPath.recommendedCopy.maiaRevisionsPaused;
    body = (
      <section className="wsio-stack" data-path-begin={studioPath.id}>
        <p className="wsio-who">MAIA</p>
        <p className="wsio-maia wsio-small">Let’s begin your {studioPath.name.toLowerCase()}.</p>
        <label className="wsio-label" htmlFor="wsio-path-title">Its name, for now. You can change it any time.</label>
        <input id="wsio-path-title" className="wsio-input" value={pathTitle} onChange={(e) => setPathTitle(e.target.value)} />
        {setting ? (
          <label className="wsio-check" htmlFor="wsio-path-revisions">
            <input id="wsio-path-revisions" type="checkbox" checked={pathRevisionsPaused}
              onChange={(e) => setPathRevisionsPaused(e.target.checked)} />
            <span><b>{setting.label}</b><br /><span className="wsio-note">{setting.hint}</span></span>
          </label>
        ) : null}
        <div className="wsio-row">
          <button type="button" className="fr-home-primary" disabled={props.busy}
            onClick={() => props.onPathBegin?.({ title: pathTitle, revisionsPausedConfirmed: pathRevisionsPaused, purpose: planNow().purpose })}>
            {props.busy ? 'Beginning…' : 'Begin'}
          </button>
          <button type="button" className="wsio-link" disabled={props.busy} onClick={() => begin('look')}>Look around first</button>
        </div>
        {hold === 'own' && posture === 'ordinary' && !unsure ? (
          <p className="wsio-note wsio-held">Your words will be kept with this Work.</p>
        ) : null}
      </section>
    );
  } else if (step === 'begin') {
    body = (
      <>
        <p className="wsio-who">MAIA</p>
        <p className="wsio-maia wsio-small">{FORM_QUESTION}</p>
        <div className="wsio-posture" role="group" aria-label={FORM_QUESTION} data-form-choices>
          {FORM_CHOICES.map((f) => (
            <button key={f.id} type="button" aria-pressed={formChoice === f.id}
              onClick={() => { setFormChoice((v) => (v === f.id ? null : f.id)); setFormOwnOpen(false); }}>{f.label}</button>
          ))}
          <button type="button" aria-pressed={formOwnOpen} onClick={() => { setFormOwnOpen((v) => !v); setFormChoice(null); }}>{FORM_OWN_WORD_LABEL}</button>
        </div>
        {formOwnOpen ? (
          <input className="wsio-input" aria-label="What it is becoming, in your own word" maxLength={FORM_MAX_CHARS}
            value={formOwn} onChange={(e) => setFormOwn(e.target.value)} placeholder="A letter, a liturgy, a blog series…" />
        ) : null}
        <p className="wsio-note">You can skip this, or change it any time.</p>
        <p className="wsio-maia wsio-small">{C.beginQuestion}</p>
        <div className="wsio-choices">
          <button type="button" className="wsio-choice" disabled={props.busy} onClick={() => begin('write')}>
            <b>Write the first page</b><span>I’ll be here when you want me</span>
          </button>
          <button type="button" className="wsio-choice" disabled={props.busy} onClick={() => begin('import')}>
            <b>Bring what I’ve written</b><span>{formVocabulary(chosenForm).bringHint}</span>
          </button>
          <button type="button" className="wsio-choice" disabled={props.busy} onClick={() => setStep('talk')}>
            <b>Keep talking</b><span>We can stay with this a while</span>
          </button>
          <button type="button" className="wsio-choice" disabled={props.busy} onClick={() => begin('look')}>
            <b>I don’t know yet</b><span>Look around first. Nothing is lost</span>
          </button>
        </div>
        <p className="wsio-note wsio-facet-q">{C.facetQuestion}</p>
        <div className="wsio-posture" role="group" aria-label={C.facetQuestion}>
          {(Object.keys(FACET_COPY) as FacetChoice[]).map((choice) => (
            <button key={choice} type="button" aria-pressed={facet === choice} onClick={() => chooseFacet(choice)}>{FACET_COPY[choice]}</button>
          ))}
        </div>
        <p className="wsio-note">{C.facetNote}</p>
        {hold === 'own' && posture === 'ordinary' && !unsure ? (
          <p className="wsio-note wsio-held">Your spark will be kept with the Work you begin.</p>
        ) : null}
      </>
    );
  } else {
    body = (
      <>
        <div className="wsio-talk" aria-live="polite">
          {history.map((turn, i) => (
            <div key={i} className={turn.speaker === 'maia' ? 'wsio-turn wsio-turn-maia' : 'wsio-turn'}>
              <p className="wsio-who">{turn.speaker === 'maia' ? 'MAIA' : 'You'}</p>
              <p className={turn.speaker === 'maia' ? 'wsio-maia wsio-small' : 'wsio-writer'}>{turn.body}</p>
            </div>
          ))}
        </div>
        <label className="wsio-label" htmlFor="wsio-talk">Say more</label>
        <textarea id="wsio-talk" className="wsio-input" rows={3} value={talkDraft} onChange={(e) => setTalkDraft(e.target.value)} />
        <div className="wsio-row">
          <button type="button" className="fr-home-primary" disabled={asking || !talkDraft.trim()} onClick={() => void sendTalk()}>
            {asking ? 'MAIA is listening…' : 'Send'}
          </button>
          <button type="button" className="fr-home-quiet" onClick={() => setStep('begin')}>I’m ready to begin</button>
        </div>
        <p className="wsio-note">This conversation isn’t kept.</p>
      </>
    );
  }

  if (needsAge && age !== 'ok') {
    body = (
      <div className="wsio-age" data-age-gate={age}>
        {age === 'checking' ? <p className="wsio-note" role="status">One moment…</p> : null}
        {age === 'ask' ? (
          <>
            <p className="wsio-maia wsio-small">Before we begin: how old are you?</p>
            <p className="wsio-note">This Studio is for students working on their own college essay.</p>
            <div className="wsio-row">
              <button type="button" className="fr-home-quiet" disabled={ageBusy} onClick={() => void attest('adult')}>I’m 18 or older</button>
              <button type="button" className="fr-home-quiet" disabled={ageBusy} onClick={() => setAge('teen')}>I’m 13 to 17</button>
              <button type="button" className="fr-home-quiet" disabled={ageBusy} onClick={() => setAge('under13')}>I’m under 13</button>
            </div>
          </>
        ) : null}
        {age === 'teen' ? (
          <>
            <p className="wsio-maia wsio-small">You can use this Studio with an adult’s supervision.</p>
            <label className="wsio-check">
              <input type="checkbox" checked={supervised} onChange={(e) => setSupervised(e.target.checked)} data-age-supervised />
              <span>A parent, guardian or teacher is supervising my use of this Studio.</span>
            </label>
            <div className="wsio-row">
              <button type="button" className="fr-home-primary" disabled={!supervised || ageBusy} onClick={() => void attest('minor')}>Continue</button>
              <button type="button" className="wsio-link" onClick={() => { setSupervised(false); setAge('ask'); }}>Back</button>
            </div>
          </>
        ) : null}
        {age === 'under13' ? (
          <>
            <p className="wsio-maia wsio-small">College Essay Studio is for students 13 and older.</p>
            <p className="wsio-note">Nothing about you has been saved. A parent or teacher can help you find other ways to work on your writing.</p>
            <button type="button" className="wsio-link" onClick={() => setAge('ask')}>Back</button>
          </>
        ) : null}
        {age === 'error' ? (
          <p className="p4r1-error" role="alert">This couldn’t be checked just now. Nothing was saved. Please try again in a moment.</p>
        ) : null}
      </div>
    );
  }

  return (
    <section className="wsio" data-inspiration-opening data-step={step} aria-label="The Spark">
      {/* One Ordinary/Sanctuary control at a time (founder polish 2026-11-16): while MAIA asks the posture question in place
          (an unreadable setting), that question carries the only control; otherwise the one control sits at the top. */}
      {step === 'hold' && posture === 'unknown' ? null : <div className="wsio-top">{postureControl}</div>}
      <div className="wsio-body">{body}</div>
      {askError ? <p className="p4r1-error" role="alert">{askError}</p> : null}
      {props.error ? <p className="p4r1-error" role="alert">{props.error}</p> : null}
    </section>
  );
}

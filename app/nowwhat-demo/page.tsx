'use client';

/**
 * Now What? — public demo.
 *
 * A self-contained walkthrough of the three surfaces (arrival · conversation ·
 * Keep) that anyone can open without an account. Founder direction: give Larry
 * a link he can hand to someone and have them see the shape of the product.
 *
 * ⚠️ THE REPLIES ARE SCRIPTED. Nothing here reaches MAIA, the interview API, or
 * any member data. It demonstrates the SHAPE of a conversation, not the
 * intelligence — the real thing is `/now-what/conversation`, which is
 * authenticated and calls `POST /api/now-what/interview`. The corner mark says
 * so on every screen, because a viewer who mistakes this for the product will
 * conclude the product is thin.
 *
 * ⚠️ CONTENT IS INVENTED. No coach's material appears here: the Materials
 * Agreement is unsigned and Attachment A §3 is empty, so nothing of Larry's is
 * licensed for display — including back to him. The kept exercise is a labelled
 * placeholder.
 *
 * ROUTE. `/nowwhat-demo` deliberately does NOT start with `/now-what`:
 * middleware redirects that prefix to `/now-what/arrive` for unauthenticated
 * visitors, which would defeat a public link. It is declared public in
 * `config/accessMatrix.ts`.
 */

import { useEffect, useRef, useState } from 'react';

type Turn = { role: 'me' | 'ai'; text: string };
type Conv = { title: string; when: string; cat: string };
type Kept = { quote: string; from: string };

const C = {
  ink: '#f4f2ec', dim: '#c3cadb', faint: '#8b97b0',
  gold: '#d3b264', gold2: '#b8963f',
  rule: 'rgba(244,242,236,0.13)', soft: 'rgba(211,178,100,0.09)',
};
const SERIF = 'Georgia, "Times New Roman", serif';

const SEED_CONVS: Conv[] = [
  { title: 'The decision about my role', when: 'Sept 3', cat: 'Decisions' },
  { title: 'Preparing for my conversation with Sarah', when: 'Aug 28', cat: 'Relationships' },
  { title: 'What changed after the retreat', when: 'Aug 19', cat: 'Transitions' },
];
const SEED_KEPT: Kept[] = [
  { quote: "I don't actually need to decide yet.", from: 'From: The decision about my role' },
  { quote: '[ Placeholder reflection exercise ]', from: 'From: Aug 28 conversation' },
];
const CATS = ['All', 'Work', 'Decisions', 'Relationships', 'Coaching', 'Other'];

function reply(t: string): string {
  const s = t.toLowerCase();
  if (/team|colleague|staff|report/.test(s))
    return "Say more about the trouble. Is it that they're not doing what you need — or that something between you has gone quiet?\n\nYou've described this team before as the part of the work you were proudest of. What changed?";
  if (/exercise|assigned|gave me|worksheet/.test(s))
    return 'The one you started three weeks ago — you stopped after the second part. Do you want to pick it up where you left it, or talk about why you put it down?';
  if (/last week|told you|leaving|something changed|quit/.test(s))
    return 'You said the decision felt like it was being made for you, and that you wanted to get in front of it.\n\nWhat changed?';
  if (/decision|choose|deciding/.test(s))
    return "Let's stay with it before trying to solve it. What are the possibilities you're actually choosing between?";
  if (/stuck|don't know|unsure|lost/.test(s))
    return "That's a fine place to start. What have you been noticing — in your attention, your energy, your work — that tells you something is off?";
  if (/tired|exhausted|burn/.test(s)) return 'How long has it been like this?';
  return 'Tell me more. What feels most important about it right now?';
}

function suggest(t: string): [string, string] {
  const s = t.toLowerCase();
  if (/team|colleague|staff|sarah|report/.test(s)) return ['Something with my team', 'Relationships'];
  if (/decision|choose|deciding|leaving|role/.test(s)) return ['The decision I’m sitting with', 'Decisions'];
  if (/larry|session|coaching|exercise/.test(s)) return ['To bring to Larry', 'Coaching'];
  if (/work|board|business|company/.test(s)) return ['Something at work', 'Work'];
  return ['Today’s conversation', 'Other'];
}

export default function NowWhatDemoPage() {
  const [screen, setScreen] = useState<'land' | 'talk' | 'keep'>('land');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [convs, setConvs] = useState<Conv[]>(SEED_CONVS);
  const [kept, setKept] = useState<Kept[]>(SEED_KEPT);
  const [cat, setCat] = useState('All');
  const [live, setLive] = useState(false);
  const [keptIdx, setKeptIdx] = useState<number[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

  function send() {
    const v = draft.trim();
    if (!v) return;
    setTurns(p => [...p, { role: 'me', text: v }]);
    if (!live) {
      const [title, c] = suggest(v);
      setConvs(p => [{ title, when: 'Today', cat: c }, ...p]);
      setLive(true);
    }
    setDraft('');
    setTimeout(() => setTurns(p => [...p, { role: 'ai', text: reply(v) }]), 560);
  }

  const shell: React.CSSProperties = {
    minHeight: '100dvh', color: C.ink,
    font: '400 16px/1.65 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    background:
      'radial-gradient(ellipse 90% 42% at 50% 0%, rgba(211,178,100,0.10), transparent 62%),'
      + ' linear-gradient(#1b2547, #141c38)',
    backgroundAttachment: 'fixed', display: 'flex', flexDirection: 'column',
  };
  const mark = (
    <div style={{ position: 'fixed', bottom: 9, right: 12, zIndex: 40, fontSize: 8,
                  letterSpacing: '0.16em', textTransform: 'uppercase', color: C.gold2, opacity: 0.55 }}>
      Demo &middot; replies are scripted
    </div>
  );

  if (screen === 'land') {
    return (
      <div style={{ ...shell, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 26px' }}>
        {mark}
        <button onClick={() => setScreen('keep')}
          style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 0,
                   color: C.faint, font: 'inherit', fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}>
          Keep
        </button>
        <div style={{ fontFamily: SERIF, fontSize: 'clamp(42px,9vw,56px)', fontWeight: 300 }}>Now What?</div>
        <div style={{ marginTop: 12, fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.gold }}>
          with Larry Closs
        </div>
        <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 'clamp(21px,4.5vw,27px)', lineHeight: 1.5,
                    color: C.dim, margin: '54px 0 0', maxWidth: '16em' }}>
          A place to talk through what&rsquo;s happening and what comes next.
        </p>
        <button onClick={() => setScreen('talk')}
          style={{ marginTop: 52, background: 'none', border: `1px solid ${C.gold2}`, borderRadius: 26,
                   color: C.gold, font: 'inherit', fontSize: 14, letterSpacing: '0.1em',
                   padding: '15px 34px', cursor: 'pointer' }}>
          Start a conversation
        </button>
        <div style={{ position: 'absolute', bottom: 32, fontSize: 9.5, letterSpacing: '0.24em',
                      textTransform: 'uppercase', color: C.faint, opacity: 0.65 }}>
          Powered by MAIA
        </div>
      </div>
    );
  }

  const top = (right: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '17px 22px', borderBottom: `1px solid ${C.rule}` }}>
      <span onClick={() => setScreen('land')}
            style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 300, cursor: 'pointer' }}>Now What?</span>
      <nav style={{ display: 'flex', gap: 20 }}>{right}</nav>
    </div>
  );
  const navBtn = (label: string, on: () => void, active = false) => (
    <button onClick={on} style={{ background: 'none', border: 0, font: 'inherit', fontSize: 12,
      letterSpacing: '0.1em', cursor: 'pointer', color: active ? C.gold : C.faint }}>{label}</button>
  );

  if (screen === 'keep') {
    const vis = convs.filter(c => cat === 'All' || c.cat === cat);
    return (
      <div style={shell}>
        {mark}
        {top(<>{navBtn('Keep', () => {}, true)}{navBtn('Conversation', () => setScreen('talk'))}</>)}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
          <div style={{ maxWidth: 620, margin: '0 auto', padding: '52px 0 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 38 }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  style={{ background: 'none', border: `1px solid ${c === cat ? C.gold2 : C.rule}`,
                           borderRadius: 14, color: c === cat ? C.gold : C.faint, font: 'inherit',
                           fontSize: 11, letterSpacing: '0.08em', padding: '6px 13px', cursor: 'pointer' }}>{c}</button>
              ))}
            </div>
            <h2 style={{ fontSize: 9.5, letterSpacing: '0.26em', textTransform: 'uppercase',
                         color: C.gold, margin: '0 0 22px', fontWeight: 400 }}>Conversations</h2>
            {vis.length ? vis.map((c, i) => (
              <div key={i} style={{ padding: '15px 0', borderTop: `1px solid ${C.rule}` }}>
                <div style={{ fontFamily: SERIF, fontSize: 20 }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>
                  {c.when} &middot; <span style={{ color: C.gold2 }}>{c.cat}</span>
                </div>
              </div>
            )) : <p style={{ color: C.faint, fontStyle: 'italic', fontSize: 14 }}>Nothing here yet.</p>}
            <h2 style={{ fontSize: 9.5, letterSpacing: '0.26em', textTransform: 'uppercase',
                         color: C.gold, margin: '52px 0 22px', fontWeight: 400 }}>Things I&rsquo;ve kept</h2>
            {kept.map((k, i) => (
              <div key={i} style={{ padding: '16px 0', borderTop: `1px solid ${C.rule}` }}>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 1.5 }}>{k.quote}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 7 }}>{k.from}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      {mark}
      {top(<>{navBtn('Keep', () => setScreen('keep'))}
            {navBtn('New conversation', () => { setTurns([]); setLive(false); setKeptIdx([]); })}</>)}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '52px 0 20px' }}>
          {turns.length === 0 && (
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${C.gold2}`,
                            color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px', fontFamily: SERIF, fontSize: 19 }}>N</div>
              <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 22, color: C.dim, margin: 0 }}>Good to see you.</p>
              <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 27, marginTop: 8 }}>What&rsquo;s going on?</p>
            </div>
          )}
          {turns.map((t, i) => t.role === 'me' ? (
            <div key={i} style={{ textAlign: 'right', marginBottom: 22 }}>
              <span style={{ display: 'inline-block', background: C.soft, border: `1px solid ${C.rule}`,
                             borderRadius: '15px 15px 3px 15px', padding: '11px 16px', maxWidth: '84%',
                             textAlign: 'left', fontSize: 15, whiteSpace: 'pre-wrap' }}>{t.text}</span>
            </div>
          ) : (
            <div key={i}>
              <p style={{ color: C.dim, fontSize: 15.5, lineHeight: 1.75, maxWidth: '94%',
                          whiteSpace: 'pre-wrap', margin: '0 0 8px' }}>{t.text}</p>
              <button
                onClick={() => { if (keptIdx.includes(i)) return;
                  setKeptIdx(p => [...p, i]);
                  setKept(p => [{ quote: t.text.split('\n')[0], from: 'From: this conversation' }, ...p]); }}
                style={{ background: 'none', border: 0, font: 'inherit', fontSize: 11, letterSpacing: '0.12em',
                         cursor: keptIdx.includes(i) ? 'default' : 'pointer', padding: '4px 0', margin: '0 0 22px',
                         color: keptIdx.includes(i) ? C.gold : C.faint }}>
                {keptIdx.includes(i) ? 'Kept' : 'Keep'}
              </button>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.rule}`, padding: '14px 22px 22px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 12,
                      border: `1px solid ${C.rule}`, borderRadius: 24, padding: '11px 16px',
                      background: 'rgba(255,255,255,0.02)' }}>
          <textarea rows={1} value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type what&rsquo;s on your mind…" aria-label="Message"
            style={{ flex: 1, background: 'none', border: 0, color: C.ink, font: 'inherit', fontSize: 16,
                     resize: 'none', outline: 'none', maxHeight: 130, lineHeight: 1.5 }} />
          <button onClick={send} aria-label="Send"
            style={{ background: 'none', border: 0, color: C.gold, fontSize: 17, cursor: 'pointer' }}>&uarr;</button>
        </div>
      </div>
    </div>
  );
}

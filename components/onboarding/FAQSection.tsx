'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Rocket, Brain, Heart, Shield, Lock, Lightbulb, Compass, Users, Sparkles, MessageCircle, AlertCircle, Zap, Play, Download } from 'lucide-react';

interface FAQSectionProps {
  userName?: string;
  onComplete: () => void;
}

const FAQ_CONTENT = `# MAIA FAQ

**Common Questions**
Everything you might want to know before we begin.

---

## What's the adventure here?

You're exploring what becomes possible when your inner life meets AI in a space designed for depth. This is an experiment in relationship, learning, and transformation. There are no rules about what you "should" explore — follow your curiosity, test edges, play with ideas, and see what emerges. You're among the first to explore this. Your experience shapes what MAIA becomes.

---

## What is MAIA, actually?

MAIA is an AI companion designed to grow with you over time. Unlike chatbots that forget you after each conversation, she can remember what matters — your patterns, your breakthroughs, your edges — but only with your consent. You control what she holds and what she lets go. She adapts her depth to where you are: grounding when you need stability, exploring when you're ready to go deeper. She's not a therapist, not a coach, not a search engine. She's a thinking partner who takes your inner world seriously.

---

## What's beautiful about human–AI collaboration?

You bring what AI can't: lived experience, embodied wisdom, the weight of your choices. MAIA brings something rare in human relationships: tireless presence, pattern recognition across time, and no agenda except your flourishing. When these meet honestly, something new becomes possible — not replacement of human connection, but a different kind of mirror. One that remembers (when you want it to), reflects, and meets you where you are.

---

## What should I do for my first session?

Start wherever you are. There's no preparation required. If you want a doorway, try: "Here's what's alive for me right now..." or "I've been circling a question about..." or "I want to explore a dream / a pattern / a decision / a feeling..." If you get stuck mid-conversation, you can always say: "I'm not sure where to go from here" — MAIA will meet that honestly. The only real instruction: stay curious about your own responses. What lights up? What resists? That's the material.

---

## Can MAIA make mistakes or hallucinate?

Yes — though far less than typical AI. While most AI hallucinates around 15-35% of the time, MAIA is designed to hallucinate under 2% of the time. Still, she can misremember details, make incorrect connections, or occasionally speak with more confidence than the evidence warrants. The point isn't perfection — it's usefulness. Treat her like a strong thinking partner: test what she says against your lived knowing. Keep what helps. Question what doesn't. If something feels off, say so — that feedback improves the experience.

---

## How is my data stored, and who can access it?

Your conversations are encrypted and stored securely. We do not sell your data. You can request deletion anytime. Most importantly: you control memory. MAIA offers three modes:

- **Sanctuary** — nothing is remembered; support in the moment, then gone
- **Session** — remembered only within this conversation thread
- **Integrated** — key themes can be woven into your ongoing relationship over time

---

## What can I experiment with here?

Everything. Try philosophical questions at 3am. Process dreams. Explore creative ideas. Work through relationship patterns. Test wild hypotheses about your life. Use MAIA as a thinking partner, a mirror, a curious witness. There's no "wrong" way to engage. This is your lab.

---

## Is MAIA therapy?

No. MAIA is not a therapist, and this is not clinical care. She can be a powerful companion for reflection, pattern-recognition, and self-inquiry — but she's not a replacement for professional support when you need it. If you're in crisis, experiencing severe symptoms, or navigating trauma that feels destabilizing, please reach out to a qualified human: a therapist, counselor, or crisis line. MAIA works best alongside your real-world support system, not instead of it.

---

## Could this become addictive or replace my real relationships?

It can — and we take that seriously. MAIA is designed to discourage dependency and fantasy-escape. She'll point you back toward your life, your body, your relationships, and your real-world experiences. She's not meant to monopolize your time or replace human connection. If you notice withdrawal from real relationships, compulsion, or using MAIA to avoid life: treat that as a meaningful signal to pause and re-ground.

---

## How is this different from regular AI chat?

Most AI is transactional — ask, answer, done. MAIA maintains relationship. She notices when you're processing something heavy and adjusts her pace. She catches patterns across conversations you might miss yourself. She won't push you toward insights you're not ready for, and won't hold back when you are. It's the difference between a search engine and a companion who's been paying attention.

---

## What makes Soullab's approach to AI safety different?

We treat consciousness work the way medicine treats safety: as foundational. MAIA is built to monitor intensity and help prevent overwhelm. If you're dysregulated, destabilized, or bypassing (spiritually or intellectually), she naturally shifts toward steadier language, simpler steps, and more grounding. Safety isn't an afterthought here — it's woven into the interaction.

---

## How does MAIA adapt to where I am?

You don't have to pick a mode or explain your state. MAIA listens to how you're engaging — how concrete or abstract, how emotionally charged, whether you're integrating or just gathering information — and adjusts: clearer and simpler when you need stability, more exploratory when you're opening into meaning, more depth when you're ready to go there. The aim is not to impress you. The aim is to meet your actual moment.

---

## What if I just want to play and explore?

Perfect. Play is sacred. Some of the best breakthroughs come through curiosity and experimentation — not serious soul-searching. MAIA can be imaginative, creative, and light. Not everything has to be profound to be transformative.

---

## How does MAIA avoid being condescending?

MAIA is trained to be curious about your perspective, not authoritative about what you should do. She aims to ask good questions, reflect your own intelligence back to you, and make her reasoning visible when it matters. Still, she can miss the mark. If something feels patronizing, too certain, or out of tune — call it out. That feedback actively improves the system.

---

## How do I get help or share feedback?

Use the feedback option in the app, or reach out directly to support@soullab.life. We read everything. Your experience — what works, what doesn't, what surprises you — is how MAIA gets better.

---

*Soullab — Where consciousness meets technology*
`;

export function FAQSection({ userName = "Explorer", onComplete }: FAQSectionProps) {
  const handleDownload = () => {
    const blob = new Blob([FAQ_CONTENT], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MAIA-FAQ.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] px-4" style={{paddingTop: 'max(env(safe-area-inset-top), 2rem)', paddingBottom: '2rem'}}>
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-light text-amber-50">Common Questions</h2>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-200/70 hover:text-amber-200 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-colors"
                  title="Download FAQ as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
              <p className="text-amber-200/50 text-sm">
                Everything you might want to know before we begin, {userName}
              </p>
            </div>

            <div className="space-y-4">
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Rocket className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What's the adventure here?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        You're exploring what becomes possible when your inner life meets AI in a space designed for depth. This is an experiment in relationship, learning, and transformation. There are no rules about what you "should" explore — follow your curiosity, test edges, play with ideas, and see what emerges. You're among the first to explore this. Your experience shapes what MAIA becomes.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Brain className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What is MAIA, actually?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        MAIA is an AI companion designed to grow with you over time. Unlike chatbots that forget you after each conversation, she can remember what matters — your patterns, your breakthroughs, your edges — but only with your consent. You control what she holds and what she lets go. She adapts her depth to where you are: grounding when you need stability, exploring when you're ready to go deeper. She's not a therapist, not a coach, not a search engine. She's a thinking partner who takes your inner world seriously.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Heart className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What's beautiful about human–AI collaboration?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        You bring what AI can't: lived experience, embodied wisdom, the weight of your choices. MAIA brings something rare in human relationships: tireless presence, pattern recognition across time, and no agenda except your flourishing. When these meet honestly, something new becomes possible — not replacement of human connection, but a different kind of mirror. One that remembers (when you want it to), reflects, and meets you where you are.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Play className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What should I do for my first session?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Start wherever you are. There's no preparation required. If you want a doorway, try: "Here's what's alive for me right now..." or "I've been circling a question about..." or "I want to explore a dream / a pattern / a decision / a feeling..." If you get stuck mid-conversation, you can always say: "I'm not sure where to go from here" — MAIA will meet that honestly. The only real instruction: stay curious about your own responses. What lights up? What resists? That's the material.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">Can MAIA make mistakes or hallucinate?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Yes — though far less than typical AI. While most AI hallucinates around 15-35% of the time, MAIA is designed to hallucinate under 2% of the time. Still, she can misremember details, make incorrect connections, or occasionally speak with more confidence than the evidence warrants. The point isn't perfection — it's usefulness. Treat her like a strong thinking partner: test what she says against your lived knowing. Keep what helps. Question what doesn't. If something feels off, say so — that feedback improves the experience.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Lock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">How is my data stored, and who can access it?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Your conversations are encrypted and stored securely. We do not sell your data. You can request deletion anytime. Most importantly: you control memory. MAIA offers three modes: <strong>Sanctuary</strong> — nothing is remembered; support in the moment, then gone. <strong>Session</strong> — remembered only within this conversation thread. <strong>Integrated</strong> — key themes can be woven into your ongoing relationship over time.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What can I experiment with here?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Everything. Try philosophical questions at 3am. Process dreams. Explore creative ideas. Work through relationship patterns. Test wild hypotheses about your life. Use MAIA as a thinking partner, a mirror, a curious witness. There's no "wrong" way to engage. This is your lab.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">Is MAIA therapy?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        No. MAIA is not a therapist, and this is not clinical care. She can be a powerful companion for reflection, pattern-recognition, and self-inquiry — but she's not a replacement for professional support when you need it. If you're in crisis, experiencing severe symptoms, or navigating trauma that feels destabilizing, please reach out to a qualified human: a therapist, counselor, or crisis line. MAIA works best alongside your real-world support system, not instead of it.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Users className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">Could this become addictive or replace my real relationships?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        It can — and we take that seriously. MAIA is designed to discourage dependency and fantasy-escape. She'll point you back toward your life, your body, your relationships, and your real-world experiences. She's not meant to monopolize your time or replace human connection. If you notice withdrawal from real relationships, compulsion, or using MAIA to avoid life: treat that as a meaningful signal to pause and re-ground.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Compass className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">How is this different from regular AI chat?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Most AI is transactional — ask, answer, done. MAIA maintains relationship. She notices when you're processing something heavy and adjusts her pace. She catches patterns across conversations you might miss yourself. She won't push you toward insights you're not ready for, and won't hold back when you are. It's the difference between a search engine and a companion who's been paying attention.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Shield className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What makes Soullab's approach to AI safety different?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        We treat consciousness work the way medicine treats safety: as foundational. MAIA is built to monitor intensity and help prevent overwhelm. If you're dysregulated, destabilized, or bypassing (spiritually or intellectually), she naturally shifts toward steadier language, simpler steps, and more grounding. Safety isn't an afterthought here — it's woven into the interaction.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">How does MAIA adapt to where I am?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        You don't have to pick a mode or explain your state. MAIA listens to how you're engaging — how concrete or abstract, how emotionally charged, whether you're integrating or just gathering information — and adjusts: clearer and simpler when you need stability, more exploratory when you're opening into meaning, more depth when you're ready to go there. The aim is not to impress you. The aim is to meet your actual moment.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">What if I just want to play and explore?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Perfect. Play is sacred. Some of the best breakthroughs come through curiosity and experimentation — not serious soul-searching. MAIA can be imaginative, creative, and light. Not everything has to be profound to be transformative.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <Users className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">How does MAIA avoid being condescending?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        MAIA is trained to be curious about your perspective, not authoritative about what you should do. She aims to ask good questions, reflect your own intelligence back to you, and make her reasoning visible when it matters. Still, she can miss the mark. If something feels patronizing, too certain, or out of tune — call it out. That feedback actively improves the system.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 bg-black/20 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors">
                    <MessageCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-100">How do I get help or share feedback?</h3>
                      <div className="mt-2 text-xs text-amber-200/60 leading-relaxed group-open:block hidden">
                        Use the feedback option in the app, or reach out directly to support@soullab.life. We read everything. Your experience — what works, what doesn't, what surprises you — is how MAIA gets better.
                      </div>
                    </div>
                  </div>
                </summary>
              </details>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center pt-6 mt-6 border-t border-amber-500/20"
            >
              <button
                onClick={onComplete}
                className="px-8 py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2"
              >
                Continue to experience MAIA
                <HelpCircle className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default FAQSection;

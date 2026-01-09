'use client';

// app/patrons/page.tsx
// Patron landing page with Stripe checkout integration
// Enhanced with annual pricing, one-time gifts, and Elder sponsorship

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Benefit thresholds - what you get at each level
const benefitTiers = [
  {
    minAmount: 5,
    name: "Supporter",
    benefits: ["Monthly build letters", "Name (optional) on Supporter Wall"],
  },
  {
    minAmount: 25,
    name: "Seedkeeper",
    benefits: ["Monthly build letters", "Early access notes + previews", "Name (optional) on Supporter Wall"],
  },
  {
    minAmount: 75,
    name: "Story Weaver",
    benefits: ["All Seedkeeper benefits", "Patron Q&A and circle updates", "Priority feedback channel"],
  },
  {
    minAmount: 250,
    name: "Sanctuary Builder",
    benefits: ["All Story Weaver benefits", "Quarterly behind-the-scenes brief", "Direct input on roadmap priorities"],
  },
  {
    minAmount: 500,
    name: "Founding Patron",
    benefits: ["All Sanctuary Builder benefits", "Named dedication (if desired)", "Direct founder channel", "Quarterly vision session"],
  },
];

const getCurrentTier = (amount: number) => {
  let current = benefitTiers[0];
  for (const tier of benefitTiers) {
    if (amount >= tier.minAmount) {
      current = tier;
    }
  }
  return current;
};

const oneTimeOptions = [
  { id: 'gift-50', name: "Blessing", amount: 50, description: "A meaningful gesture of support" },
  { id: 'gift-150', name: "Offering", amount: 150, description: "Help fund a month of development" },
  { id: 'gift-500', name: "Foundation Stone", amount: 500, description: "Lay groundwork for the sanctuary" },
  { id: 'gift-custom', name: "Custom Amount", amount: 0, description: "Give what feels right" },
];

const faqs = [
  {
    q: "What does my patronage actually fund?",
    a: "Build time, infrastructure, and the consent/governance layer that keeps MAIA trustworthy. This includes privacy engineering, stability, accessibility, and the journaling/legacy capture experience.",
  },
  {
    q: "Do you store or sell people's private writing?",
    a: "No. Sanctuary-first design means private stays private. Sharing is explicit and consent-based. Your inner life is yours.",
  },
  {
    q: "Is this an investment?",
    a: "No — it's patronage. You're funding a sanctuary you want to exist in the world. If we later open investment pathways, patrons will be the first invited.",
  },
  {
    q: "How will I stay connected?",
    a: "Monthly build letters for all patrons. Story Weaver and above join the monthly Patron Circle call. Sanctuary Builders and Founders get additional direct access.",
  },
  {
    q: "Does my employer match charitable giving?",
    a: "Many companies match employee donations to nonprofits and mission-driven organizations. Check with your HR department — your contribution could be doubled.",
  },
];

// Separate component for search params (needs Suspense boundary)
function PatronsContent() {
  const searchParams = useSearchParams();

  if (!searchParams) return null;

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sliderAmount, setSliderAmount] = useState(25);
  const currentTier = getCurrentTier(sliderAmount);

  const handleJoin = async (tierId: string, amount: number, isAnnual: boolean = false) => {
    setLoading(tierId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierId,
          amount,
          interval: isAnnual ? 'year' : 'month',
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout. Please try again.');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const handleOneTimeGift = async (giftId: string, amount: number) => {
    if (giftId === 'gift-custom') {
      const customValue = parseInt(customAmount);
      if (!customValue || customValue < 5) {
        alert('Please enter an amount of at least $5');
        return;
      }
      amount = customValue;
    }

    setLoading(giftId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'one-time-gift',
          amount,
          interval: 'one_time',
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout. Please try again.');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const handleElderSponsor = async () => {
    setLoading('elder-sponsor');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'elder-sponsor',
          amount: 500,
          interval: 'one_time',
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout. Please try again.');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setEmailStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'patrons-page' }),
      });

      if (response.ok) {
        setEmailStatus('success');
        setEmail('');
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
      {/* Success/Cancel Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 px-6 py-4">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Thank you for joining the Founding Circle! Check your email for confirmation.
            </p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-6 py-4">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-amber-800 dark:text-amber-200">
              Checkout was canceled. Feel free to explore or reach out if you have questions.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16">
        <p className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400">
          Soullab / MAIA
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight text-stone-900 dark:text-stone-100">
          A Sanctuary Needs Stewards.
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-stone-700 dark:text-stone-300 max-w-3xl">
          MAIA is a living wisdom sanctuary — a place to preserve what matters,
          learn from it, and share only by consent.
        </p>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
          No harvesting. No attention economy. Consent-based sharing only.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="#tiers"
            className="inline-flex items-center justify-center rounded-2xl bg-stone-900 dark:bg-stone-100 px-6 py-3 text-base font-medium text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            Join the Founding Circle
          </a>
          <a
            href="#one-time"
            className="inline-flex items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 px-6 py-3 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Make a One-Time Gift
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <div className="flex -space-x-2">
            {/* Avatar placeholders for founding members */}
            {[
              'from-amber-400 to-orange-500',
              'from-violet-400 to-purple-500',
              'from-emerald-400 to-teal-500',
              'from-blue-400 to-indigo-500',
              'from-rose-400 to-pink-500',
            ].map((gradient, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-white dark:border-stone-900 flex items-center justify-center`}
              >
                <span className="text-white text-xs font-medium">
                  {['K', 'S', 'M', 'J', 'A'][i]}
                </span>
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white dark:border-stone-900 flex items-center justify-center">
              <span className="text-stone-600 dark:text-stone-300 text-xs font-medium">+</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              Join our founding stewards
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Building MAIA together since 2024
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
              The Story
            </h2>
            <div className="mt-5 space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed">
              <p>
                We're building MAIA because something precious is disappearing:
                the stories, insights, teachings, and inner life of real people
                — especially elders — are slipping away without a place to land.
              </p>
              <p>
                MAIA is AI as a <strong>sanctuary</strong>: a private,
                consent-based environment where your life material can be held,
                organized, and distilled into wisdom — without being harvested,
                sold, or flattened into noise.
              </p>
              <p>
                It grew out of Spiralogic and decades of shamanic journeywork:
                development is elemental, cyclical, and relational. What
                transforms us most is not information, but{" "}
                <em>meaning made through experience</em>.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
              What Patronage Funds
            </h2>
            <ul className="mt-5 space-y-3 text-stone-700 dark:text-stone-300 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400">●</span>
                <span>
                  <strong>Stability + reliability</strong> — so MAIA "holds"
                  people safely
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400">●</span>
                <span>
                  <strong>Journaling + legacy capture</strong> — for elders and
                  storytellers
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400">●</span>
                <span>
                  <strong>Consent architecture</strong> — privacy by design, not
                  afterthought
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400">●</span>
                <span>
                  <strong>Real-world deployment</strong> — usable, not
                  theoretical
                </span>
              </li>
            </ul>

            {/* Elder Story Seat - Now Clickable */}
            <button
              onClick={handleElderSponsor}
              disabled={loading === 'elder-sponsor'}
              className="mt-8 w-full rounded-2xl border-2 border-amber-400 dark:border-amber-600 p-5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Sponsor an Elder Story Seat
                </p>
                <span className="text-amber-700 dark:text-amber-400 font-medium">$500</span>
              </div>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                Help an elder preserve their stories with dignity. Your gift funds one person's
                full year of access to MAIA's legacy capture tools.
              </p>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
                {loading === 'elder-sponsor' ? 'Loading...' : 'Click to sponsor →'}
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Tiers - Slider Approach */}
      <section id="tiers" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
          Join the Founding Circle
        </h2>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-2xl">
          Patrons aren't customers. You're stewards of a different future — a
          platform that treats inner life as sacred.
        </p>
        <p className="mt-2 text-stone-500 dark:text-stone-500 italic">
          Choose what feels right for you.
        </p>

        {/* Slider Card */}
        <div className="mt-10 max-w-xl mx-auto">
          <div className="rounded-3xl border border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 via-white to-stone-50 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-950 p-8 shadow-lg">

            {/* Amount Display */}
            <div className="text-center mb-6">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                Monthly contribution
              </p>
              <p className="text-4xl font-light text-stone-900 dark:text-stone-100">
                ${sliderAmount}
              </p>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ${sliderAmount * 10}/year (2 months free)
                </p>
              )}
            </div>

            {/* Slider */}
            <div className="mb-8">
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={sliderAmount}
                onChange={(e) => setSliderAmount(parseInt(e.target.value))}
                className="w-full h-2 rounded-full cursor-pointer accent-amber-500
                  [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-stone-200 dark:[&::-webkit-slider-runnable-track]:bg-stone-700
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:hover:bg-amber-600 [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:-mt-2
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-stone-200 dark:[&::-moz-range-track]:bg-stone-700
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                style={{ WebkitAppearance: 'none', appearance: 'none', background: 'transparent' }}
              />
              <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500 mt-2">
                <span>$5</span>
                <span>$500+</span>
              </div>
            </div>

            {/* Current Tier Display */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm">✦</span>
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {currentTier.name}
                </h3>
              </div>
              <ul className="space-y-2">
                {currentTier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-amber-500">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transparency - The Real Numbers */}
            <div className="bg-stone-100 dark:bg-stone-800/50 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 mb-6">
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-3 uppercase tracking-wide">
                The real numbers
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>AI + infrastructure</span>
                  <span className="font-mono text-stone-500">$500/mo</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Full-time development</span>
                  <span className="font-mono text-stone-500">70+ hrs/week</span>
                </div>
                <div className="border-t border-stone-200 dark:border-stone-700 pt-2 mt-2">
                  <div className="flex justify-between text-stone-700 dark:text-stone-300 font-medium">
                    <span>What keeps this running</span>
                    <span className="font-mono">$3,500/mo</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                No venture capital. No ads. No data harvesting. For us by us.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                Annual
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>

            {/* Join Button */}
            <button
              onClick={() => {
                setLoading('founding-circle');
                handleJoin(
                  'founding-circle',
                  billingCycle === 'annual' ? sliderAmount * 10 : sliderAmount,
                  billingCycle === 'annual'
                );
              }}
              disabled={loading === 'founding-circle'}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'founding-circle' ? 'Loading...' : `Join as ${currentTier.name}`}
            </button>

            <p className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
              Secure payment via Stripe · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* One-Time Gifts */}
      <section id="one-time" className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            One-Time Gifts
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            Can't commit to monthly? A single gift still makes a difference.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {oneTimeOptions.map((option) => (
              <div
                key={option.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-700 p-4 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
              >
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {option.name}
                </p>
                {option.id === 'gift-custom' ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-stone-500">$</span>
                      <input
                        type="number"
                        min="5"
                        placeholder="Amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full px-2 py-1 text-lg font-semibold bg-transparent border-b border-stone-300 dark:border-stone-600 focus:border-amber-500 focus:outline-none text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-100">
                    ${option.amount}
                  </p>
                )}
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {option.description}
                </p>
                <button
                  onClick={() => handleOneTimeGift(option.id, option.amount)}
                  disabled={loading === option.id}
                  className="mt-3 w-full px-3 py-2 text-sm font-medium rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {loading === option.id ? 'Loading...' : 'Give'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer Matching */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                Double Your Impact with Employer Matching
              </h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Many companies match employee donations. Check with your HR department
                — your contribution could be doubled at no extra cost to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where Support Goes - Transparency Section */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-50 via-white to-amber-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-amber-950/20 p-8 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-sm tracking-widest uppercase text-amber-600 dark:text-amber-500">
              Transparency
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">
              Where Your Support Goes
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
              Every contribution builds the sanctuary. Here's how your support takes shape.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Development */}
            <div className="text-center p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/50 dark:to-violet-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">Development</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Building features, refining presence, making MAIA more helpful
              </p>
            </div>

            {/* Infrastructure */}
            <div className="text-center p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">Infrastructure</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Servers, AI processing, secure storage for your private data
              </p>
            </div>

            {/* Elder Access */}
            <div className="text-center p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">Elder Access</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Subsidizing seats for those who carry stories but not means
              </p>
            </div>

            {/* Community */}
            <div className="text-center p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">Community</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Documentation, support, and sacred gathering spaces
              </p>
            </div>
          </div>

          {/* Subtle note */}
          <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400 italic">
            We run lean. No bloated team, no VC pressure, no advertising.
            <br className="hidden sm:block" />
            Every dollar goes toward building something worthy of trust.
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-8 shadow-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Not Ready to Commit?
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              Join our monthly build letters — honest updates on what we're building,
              why it matters, and what's next. No spam, just substance.
            </p>

            <form onSubmit={handleNewsletterSignup} className="mt-6">
              {emailStatus === 'success' ? (
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Welcome! Check your inbox to confirm.</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 max-w-xs px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700
                             bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100
                             placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'loading'}
                    className="px-6 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900
                             font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailStatus === 'loading' ? 'Joining...' : 'Get Build Letters'}
                  </button>
                </div>
              )}
              {emailStatus === 'error' && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>

            <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
              Unsubscribe anytime. Your email stays private.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            Questions
          </h2>
          <div className="mt-6 space-y-5">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-stone-100 dark:border-stone-800 p-5"
              >
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {faq.q}
                </p>
                <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-950 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            If you've ever wished for a place where the soul can speak without
            being exploited —
          </h2>
          <p className="mt-2 text-xl text-stone-700 dark:text-stone-300">
            this is that.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tiers"
              className="inline-flex items-center justify-center rounded-2xl bg-stone-900 dark:bg-stone-100 px-6 py-3 text-base font-medium text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              Join the Founding Circle
            </a>
            <a
              href="mailto:Soullab1@gmail.com?subject=Question%20about%20MAIA%20Patronage"
              className="inline-flex items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 px-6 py-3 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Talk with Kelly
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// Default export with Suspense boundary for useSearchParams
export default function PatronsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 flex items-center justify-center">
        <div className="text-stone-500 dark:text-stone-400">Loading...</div>
      </main>
    }>
      <PatronsContent />
    </Suspense>
  );
}

// app/patrons/page.tsx
// Patron landing page - activate by adding Stripe payment links

export const metadata = {
  title: "Patrons | MAIA by Soullab",
  description:
    "Join the MAIA Founding Patron Circle — a privacy-first sanctuary for journaling, story, and soul.",
};

// Stripe Payment Links - set NEXT_PUBLIC_PATRON_JOIN_URL in env for a unified join link
// Or replace individual tier links with actual Stripe payment links
const PATRON_JOIN_URL =
  process.env.NEXT_PUBLIC_PATRON_JOIN_URL ||
  "mailto:Soullab1@gmail.com?subject=MAIA%20Patron%20Circle";

const STRIPE_LINKS = {
  seedkeeper: process.env.NEXT_PUBLIC_STRIPE_SEEDKEEPER || PATRON_JOIN_URL,
  storyWeaver: process.env.NEXT_PUBLIC_STRIPE_STORYWEAVER || PATRON_JOIN_URL,
  sanctuaryBuilder: process.env.NEXT_PUBLIC_STRIPE_SANCTUARYBUILDER || PATRON_JOIN_URL,
  founder: process.env.NEXT_PUBLIC_STRIPE_FOUNDER || PATRON_JOIN_URL,
};

const tiers = [
  {
    name: "Seedkeeper",
    price: "$25/month",
    tagline: "For steady-hearted supporters who want MAIA to exist.",
    bullets: [
      "Monthly build letters",
      "Early access notes + previews",
      "Name (optional) on Supporter Wall",
    ],
    href: STRIPE_LINKS.seedkeeper,
  },
  {
    name: "Story Weaver",
    price: "$75/month",
    tagline: "For patrons who want to participate in the unfolding.",
    bullets: [
      "Everything in Seedkeeper",
      "Patron Q&A and circle updates",
      "Priority feedback channel",
    ],
    href: STRIPE_LINKS.storyWeaver,
    featured: true,
  },
  {
    name: "Sanctuary Builder",
    price: "$250/month",
    tagline: "For patrons actively funding the sanctuary infrastructure.",
    bullets: [
      "Everything in Story Weaver",
      "Quarterly behind-the-scenes brief",
      "Direct input on roadmap priorities",
    ],
    href: STRIPE_LINKS.sanctuaryBuilder,
  },
  {
    name: "Founding Patron",
    price: "$1,000/month",
    tagline: "For major stewards anchoring MAIA into the world.",
    bullets: [
      "Everything in Sanctuary Builder",
      "Named dedication (if desired)",
      "Direct founder channel",
      "Quarterly vision session",
    ],
    href: STRIPE_LINKS.founder,
  },
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
];

export default function PatronsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
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
            href="/patron-packet.pdf"
            className="inline-flex items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 px-6 py-3 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Read the Patron Packet
          </a>
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

            <div className="mt-8 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 bg-stone-50 dark:bg-stone-800">
              <p className="font-medium text-stone-900 dark:text-stone-100">
                Sponsor an Elder Story Seat
              </p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                Help an elder preserve their stories with dignity. Limited seats
                as we refine the experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
          Join the Founding Circle
        </h2>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-2xl">
          Patrons aren't customers. You're stewards of a different future — a
          platform that treats inner life as sacred.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col ${
                tier.featured
                  ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30"
                  : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {tier.tagline}
              </p>
              <p className="mt-4 text-2xl font-semibold text-stone-900 dark:text-stone-100">
                {tier.price}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-stone-600 dark:text-stone-400 flex-1">
                {tier.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  tier.featured
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                Become a {tier.name}
              </a>
            </div>
          ))}
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
              href="/contact?topic=patrons"
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

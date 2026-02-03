import Link from "next/link";

export default function OnboardingPrelude() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Set up your practice platform</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        In about 5 minutes, you'll have a live client portal with your brand, your voice, and your tools —
        powered by SOULLAB's core.
      </p>

      <div className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-medium">What you'll do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Choose a vibe preset (or start simple)</li>
          <li>Add your name, practice name, logo (optional)</li>
          <li>Set your AI companion's name + tone</li>
          <li>Pick which tools your clients will see</li>
          <li>Publish and invite your first client</li>
        </ul>

        <div className="mt-6 flex gap-3">
          <Link
            href="/practitioners/onboarding/step/1"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Start setup
          </Link>
          <Link
            href="/practitioners/dashboard"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium"
          >
            I'll do this later
          </Link>
        </div>
      </div>
    </main>
  );
}

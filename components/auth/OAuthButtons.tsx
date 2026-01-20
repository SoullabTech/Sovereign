/**
 * OAuth Buttons
 *
 * One-click OAuth sign-in with Google and Apple.
 */
'use client';

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-1 gap-2">
      <a
        href="/api/auth/signin/google"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm hover:bg-white/10"
      >
        Continue with Google
      </a>
      <a
        href="/api/auth/signin/apple"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm hover:bg-white/10"
      >
        Continue with Apple
      </a>
    </div>
  );
}

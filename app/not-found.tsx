import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center p-6">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <h1 className="text-2xl font-semibold text-teal-900 mb-4">
          Page Not Found
        </h1>

        <p className="text-teal-700/80 text-base mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <div className="space-y-3">
          <Link
            href="/signin"
            className="block w-full py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-600 transition"
          >
            Sign In
          </Link>

          <Link
            href="/begin"
            className="block w-full py-3 rounded-xl font-medium text-teal-700 bg-white/30 hover:bg-white/40 transition"
          >
            New? Start Here
          </Link>
        </div>

        <p className="text-white/60 text-xs mt-6">
          Have a passkey? Go to{' '}
          <Link href="/test-elemental" className="text-white/80 hover:text-white underline underline-offset-2">
            soullab.life/test-elemental
          </Link>
        </p>
      </div>
    </div>
  );
}
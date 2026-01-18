'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Check if a string looks like a passkey
function isPasskeyFormat(slug: string): boolean {
  const upper = slug.toUpperCase();
  const passkeyPatterns = [
    /^SOULLAB-[A-Z0-9-]+$/,
    /^MAIA-[A-Z0-9-]+$/,
    /^PIONEER-[A-Z0-9-]+$/,
    /^FOUNDING-[A-Z0-9-]+$/,
    /^SOUL-PIONEER-\d+$/,
    /^CONSCIOUSNESS\d+$/,
  ];
  const universalKeys = ['DAIMON', 'ORACLE', 'SOULLAB', 'MAIA'];

  return passkeyPatterns.some(pattern => pattern.test(upper)) || universalKeys.includes(upper);
}

export default function PortalNotFound() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If it looks like a passkey, redirect to the passkey entry page
    if (slug && isPasskeyFormat(slug)) {
      setIsRedirecting(true);
      const passkey = slug.toUpperCase();
      router.replace(`/test-elemental?passkey=${passkey}`);
    }
  }, [slug, router]);

  // If redirecting, show a brief message
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-light">Taking you to the right place...</p>
        </div>
      </div>
    );
  }

  // Otherwise show the not found page with helpful links
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
          Portal Not Found
        </h1>

        <p className="text-teal-700/80 text-base mb-6">
          This practitioner portal doesn&apos;t exist or isn&apos;t available yet.
        </p>

        <div className="space-y-3">
          <p className="text-teal-800 text-sm font-medium mb-2">
            Looking to sign in to Soullab?
          </p>

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

"use client";

/**
 * CONTENT GENERATION PAGE
 *
 * MAIA-powered content creation
 */

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ContentGenerator from '@/components/stellium/ContentGenerator';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function GeneratePage() {
  const router = useRouter();
  const { practitionerId, isLoading } = usePractitionerContext();

  if (isLoading || !practitionerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-800/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-gray-100">Generate Content</h1>
          <p className="text-gray-500">MAIA writes in your voice</p>
        </div>
      </div>

      <ContentGenerator
        practitionerId={practitionerId}
        onSaved={() => {
          // Could show a toast notification here
        }}
      />
    </div>
  );
}

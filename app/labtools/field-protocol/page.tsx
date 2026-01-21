'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Radio } from 'lucide-react';

export default function FieldProtocolPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push('/labtools')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lab Tools
        </button>

        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Radio className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-3">Field Protocol</h1>
          <p className="text-gray-500 mb-8">
            Document explorations
          </p>
          <div className="inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { betaSession } from '@/lib/auth/betaSession';
import ContentPipelinePanel from '@/components/content/ContentPipelinePanel';

export default function ContentPipelinePage() {
  const router = useRouter();

  useEffect(() => {
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-stone-200 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-stone-500 hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-medium text-stone-200">Content Pipeline</h1>
            <p className="text-xs text-stone-500">Manuscript → meaning → distribution</p>
          </div>
        </div>

        <ContentPipelinePanel />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
    />
  );
}

// Hero Card Skeleton
export function DailyTransmissionSkeleton() {
  return (
    <div className="rounded-2xl bg-maia-navy-850 border border-white/10 p-8">
      <div className="space-y-4">
        {/* Badge */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Title */}
        <Skeleton className="w-3/4 h-8" />

        {/* Subtitle */}
        <Skeleton className="w-1/2 h-5" />

        {/* Content preview */}
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
}

// Featured Card Skeleton
export function FeaturedCardSkeleton() {
  return (
    <div className="rounded-xl bg-maia-navy-850 border border-white/10 p-6 h-full">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-5 h-5 rounded" />
        </div>

        {/* Title */}
        <Skeleton className="w-3/4 h-5" />

        {/* Subtitle */}
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />

        {/* Tags */}
        <div className="flex gap-2 mt-auto">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// Default Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-maia-navy-850 border border-white/10 p-5">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>

        {/* Title */}
        <Skeleton className="w-3/4 h-4" />

        {/* Subtitle */}
        <Skeleton className="w-full h-3" />

        {/* Preview */}
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-1/2 h-3" />

        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="w-14 h-5 rounded-full" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
  );
}

// Compact Card Skeleton
export function CompactCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-maia-navy-850/50 border border-white/5">
      <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}

// Full Page Loading
export function AskMaiaPageLoading() {
  return (
    <div className="min-h-screen bg-maia-navy-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>

          {/* Search */}
          <Skeleton className="w-full h-12 rounded-xl" />

          {/* Filters */}
          <div className="flex gap-2">
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-16 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-18 h-8 rounded-full" />
          </div>
        </div>

        {/* Daily Transmission */}
        <DailyTransmissionSkeleton />

        {/* Featured Section */}
        <div className="space-y-4">
          <Skeleton className="w-24 h-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeaturedCardSkeleton />
            <FeaturedCardSkeleton />
            <FeaturedCardSkeleton />
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          <Skeleton className="w-28 h-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Card Detail Loading
export function CardDetailLoading() {
  return (
    <div className="min-h-screen bg-maia-navy-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back button */}
        <Skeleton className="w-20 h-8 rounded-lg" />

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-1/2 h-5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-14 h-6 rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-1/2 h-4" />
        </div>

        {/* Related */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <Skeleton className="w-32 h-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompactCardSkeleton />
            <CompactCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskMaiaPageLoading;

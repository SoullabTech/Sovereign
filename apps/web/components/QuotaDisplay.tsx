"use client";

import { RateLimitHint } from "@/hooks/useRateLimitHint";

interface QuotaDisplayProps {
  hint: RateLimitHint;
  formatReset: () => string;
  getQuotaColor: () => string;
  compact?: boolean;
}

export function QuotaDisplay({ 
  hint, 
  formatReset, 
  getQuotaColor,
  compact = false 
}: QuotaDisplayProps) {
  // Don&apos;t show if no quota info
  if (hint.limit === undefined || hint.remaining === undefined) {
    return null;
  }
  
  const percentage = Math.round((hint.remaining / hint.limit) * 100);
  const isLow = percentage < 20;
  
  if (compact) {
    return (
      <div className={`text-xs ${getQuotaColor()} transition-colors`}>
        {hint.remaining}/{hint.limit}
        {isLow && " ⚠️"}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Quota:</span>
        <span className={`font-medium ${getQuotaColor()} transition-colors`}>
          {hint.remaining}/{hint.limit}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            percentage > 50 ? 'bg-green-500' : 
            percentage > 20 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Reset time */}
      {hint.reset && (
        <span className="text-muted-foreground">
          {formatReset()}
        </span>
      )}
      
      {/* Low quota warning */}
      {isLow && (
        <span className="text-amber-500 animate-pulse">
          Low quota
        </span>
      )}
    </div>
  );
}
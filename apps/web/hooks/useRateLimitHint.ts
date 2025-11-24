import { useState } from "react";

export interface RateLimitHint {
  limit?: number;
  remaining?: number;
  reset?: number;
}

export function useRateLimitHint() {
  const [hint, setHint] = useState<RateLimitHint>({});

  async function postWithQuota(url: string, init: RequestInit): Promise<Response> {
    const res = await fetch(url, init);
    
    // Extract rate limit headers
    const limit = Number(res.headers.get("X-RateLimit-Limit") || "");
    const remaining = Number(res.headers.get("X-RateLimit-Remaining") || "");
    const reset = Number(res.headers.get("X-RateLimit-Reset") || "");
    
    // Update hint if headers are present
    if (!Number.isNaN(limit)) {
      setHint({ limit, remaining, reset });
    }
    
    return res;
  }
  
  // Helper to format reset time
  const formatReset = () => {
    if (!hint.reset) return "";
    const resetDate = new Date(hint.reset * 1000);
    const now = new Date();
    
    // If reset is within the next hour, show relative time
    const diffMs = resetDate.getTime() - now.getTime();
    if (diffMs > 0 && diffMs < 3600000) {
      const minutes = Math.ceil(diffMs / 60000);
      return `resets in ${minutes}m`;
    }
    
    return `resets ${resetDate.toLocaleTimeString()}`;
  };
  
  // Helper to determine quota status color
  const getQuotaColor = () => {
    if (!hint.limit || hint.remaining === undefined) return "text-muted-foreground";
    const percentage = (hint.remaining / hint.limit) * 100;
    
    if (percentage > 50) return "text-green-600 dark:text-green-400";
    if (percentage > 20) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return { 
    hint, 
    postWithQuota,
    formatReset,
    getQuotaColor
  };
}
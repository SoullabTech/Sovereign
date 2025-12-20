"use client";

import React from "react";
import {
  useTrustReceiptsEnabled,
  setTrustReceiptsEnabled,
} from "@/lib/ui/trustReceipts";

export function TrustTransparencyToggle() {
  const { enabled } = useTrustReceiptsEnabled();

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">Trust & Transparency</div>
          <div className="text-sm text-gray-600 mt-1">
            Quiet by default. Available when you want it.
          </div>
          <div className="text-sm text-gray-600 mt-2">
            When enabled, you'll see a subtle ⓘ icon next to MAIA's messages.
            Tap it to view context/memory metadata.
          </div>
        </div>

        <label className="inline-flex items-center gap-2 select-none">
          <span className="text-sm text-gray-600">Off</span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={enabled}
            onChange={(e) => setTrustReceiptsEnabled(e.target.checked)}
            aria-label="Enable Trust & Transparency"
          />
          <span className="text-sm text-gray-600">On</span>
        </label>
      </div>
    </div>
  );
}

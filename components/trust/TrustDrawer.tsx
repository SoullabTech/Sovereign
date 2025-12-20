"use client";

import React from "react";
import { X } from "lucide-react";

type MemoryMeta = {
  exchangesAvailable?: number;
  exchangesInjected?: number;
  charsInjected?: number;
  truncated?: boolean;
  provider?: string;
};

type MaiaMetadata = {
  engineUsed?: string;
  providerUsed?: string;
  memory?: MemoryMeta;
};

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="text-xs">
      <span className="text-gray-500">{k}:</span>
      <span className="ml-1 font-medium text-gray-700">{v}</span>
    </div>
  );
}

export function TrustDrawer({
  open,
  onClose,
  metadata,
  certificationHref = "/trust/memory-certification",
}: {
  open: boolean;
  onClose: () => void;
  metadata?: MaiaMetadata;
  certificationHref?: string;
}) {
  if (!open) return null;

  const m = metadata?.memory ?? {};
  const injected = m.exchangesInjected ?? 0;
  const injectedChars = m.charsInjected ?? 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Trust &amp; Transparency
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Quiet by default. Available when you want it.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              These details show what context was available and what was actually injected,
              without interrupting the relational flow.
            </p>
          </div>
          <button
            className="text-sm px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm">
          {/* Trust Details */}
          <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
            <div className="font-medium text-gray-900 mb-2">Trust details</div>
            <div className="space-y-1.5">
              <Row
                k="Memory used"
                v={`${injected} exchanges (${injectedChars} chars)`}
              />
              <Row
                k="Memory available"
                v={`${m.exchangesAvailable ?? 0} exchanges`}
              />
              <Row
                k="Truncation"
                v={(m.truncated ?? false) ? "Yes" : "No"}
              />
              <Row
                k="Memory source"
                v={m.provider ?? "unknown"}
              />
            </div>
          </div>

          {/* Metadata */}
          {(metadata?.engineUsed || metadata?.providerUsed) && (
            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
              <div className="font-medium text-gray-900 mb-2">Metadata</div>
              <div className="space-y-1.5">
                {metadata?.engineUsed && (
                  <Row k="Engine" v={metadata.engineUsed} />
                )}
                {metadata?.providerUsed && (
                  <Row k="Provider" v={metadata.providerUsed} />
                )}
              </div>
            </div>
          )}

          {/* Certification Link */}
          <a
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 underline"
            href={certificationHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            View latest certification →
          </a>

          {/* Explainer */}
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Note: when memory is absent (injected = 0), MAIA is constrained from
            inventing personal details.
          </p>
        </div>
      </div>
    </div>
  );
}

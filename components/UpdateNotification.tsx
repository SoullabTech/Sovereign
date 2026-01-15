"use client";

import { useState, useEffect } from "react";
import type { UpdateCheckResult } from "@/lib/services/appUpdateService";

interface UpdateNotificationProps {
  updateInfo: UpdateCheckResult;
  onDismiss: () => void;
  onUpdate: () => void;
}

export function UpdateNotification({
  updateInfo,
  onDismiss,
  onUpdate,
}: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Major version - full screen modal, cannot dismiss
  if (updateInfo.forcedUpdate) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className={`bg-stone-900 p-6 rounded-xl border border-amber-500/40 max-w-md w-full shadow-2xl transition-all duration-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-100">
              Major Update Required
            </h3>
          </div>

          <p className="text-stone-300 text-sm mb-6">
            A new version of MAIA ({updateInfo.serverVersion}) is available with
            important updates. Please refresh to continue.
          </p>

          <button
            onClick={onUpdate}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>
    );
  }

  // Minor/patch update - subtle toast at bottom
  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-sm z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-stone-800/95 backdrop-blur-md p-4 rounded-xl border border-stone-700/60 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-200 font-medium">Update Available</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Version {updateInfo.serverVersion} is ready
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="text-stone-500 hover:text-stone-400 p-1 -mr-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mt-3 ml-11">
          <button
            onClick={onUpdate}
            className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Update Now
          </button>
          <span className="text-stone-600">•</span>
          <button
            onClick={onDismiss}
            className="text-sm text-stone-500 hover:text-stone-400 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

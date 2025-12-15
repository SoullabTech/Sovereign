'use client';

import React from 'react';
import { useOfflineMutationQueue } from '../lib/offline/mutation-queue';

export function OfflineQueueStatus() {
  const { metrics, queue } = useOfflineMutationQueue();
  const [isOnline, setIsOnline] = React.useState(true);
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOffline);
      window.removeEventListener('offline', handleOnline);
    };
  }, []);

  if (metrics.pending === 0 && metrics.failed === 0) {
    return null; // Nothing to show
  }

  const statusColor = isOnline
    ? metrics.failed > 0
      ? 'bg-amber-500'
      : 'bg-blue-500'
    : 'bg-gray-500';

  const statusText = isOnline
    ? metrics.pending > 0
      ? `Syncing ${metrics.pending} change${metrics.pending > 1 ? 's' : ''}...`
      : metrics.failed > 0
      ? `${metrics.failed} change${metrics.failed > 1 ? 's' : ''} failed`
      : 'All synced'
    : `${metrics.pending} change${metrics.pending > 1 ? 's' : ''} pending`;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`${statusColor} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
      >
        {!isOnline && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        )}
        {isOnline && metrics.pending > 0 && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span className="text-sm font-medium">{statusText}</span>
      </button>

      {showDetails && (
        <div className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Offline Queue
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total queued:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{metrics.totalQueued}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{metrics.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Synced:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{metrics.synced}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Failed:</span>
              <span className="font-medium text-red-600 dark:text-red-400">{metrics.failed}</span>
            </div>
          </div>

          {metrics.failed > 0 && (
            <button
              onClick={async () => {
                const mutations = queue.getAllMutations();
                const failedMutations = mutations.filter(m => m.status === 'failed');
                for (const mutation of failedMutations) {
                  await queue.retryMutation(mutation.id);
                }
              }}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              Retry Failed Changes
            </button>
          )}

          {metrics.synced > 0 && (
            <button
              onClick={() => queue.clearSynced()}
              className="mt-2 w-full bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              Clear Synced Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

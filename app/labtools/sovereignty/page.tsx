'use client';

/**
 * 🗑️ USER DATA SOVEREIGNTY CONTROL CENTER
 *
 * Complete user control over consciousness data retention and deletion
 * Implements "Delete My Memory" functionality with full transparency
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DataSummary {
  user_id: string;
  data_exists: boolean;
  data_summary: {
    consciousness_patterns: {
      elemental_evolution_sessions: number;
      description: string;
    };
    wisdom_learning: {
      wisdom_moments_recorded: number;
      description: string;
    };
    complete_snapshots: {
      memory_snapshots_stored: number;
      description: string;
    };
    personality_profile: {
      profile_exists: boolean;
      description: string;
    };
    maia_adaptations: {
      adaptations_exist: boolean;
      description: string;
    };
  };
  data_timeline: {
    earliest_data: string;
    latest_data: string;
    total_days_of_data: number;
  };
  privacy_notes: string[];
  deletion_info: {
    deletion_available: boolean;
    deletion_permanent: boolean;
    deletion_immediate: boolean;
    required_confirmation: string;
  };
}

const DataSovereigntyCenter: React.FC = () => {
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteInterface, setShowDeleteInterface] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);

  // Mock user ID - in production this would come from authentication
  const userId = 'demo_user_001';

  // Fetch user data summary
  const fetchDataSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/sovereignty/my-data-summary/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const summary = await response.json();
      setDataSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data summary');
      console.error('Data summary error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSummary();
  }, []);

  const handleDeleteMemory = async () => {
    if (confirmationPhrase !== 'DELETE ALL MY CONSCIOUSNESS DATA') {
      alert('Please type the exact confirmation phrase to proceed with deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/sovereignty/delete-my-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          confirmationPhrase,
          deleteReason
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeleteComplete(true);
        setShowDeleteInterface(false);
        // Refresh data summary to show empty state
        await fetchDataSummary();
      } else {
        throw new Error(result.error || 'Deletion failed');
      }

    } catch (err) {
      alert(`Deletion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const DataTypeCard: React.FC<{
    title: string;
    count: number | boolean;
    description: string;
    type: 'count' | 'boolean'
  }> = ({ title, count, description, type }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="text-2xl font-bold text-blue-600">
          {type === 'count' ? count : (count ? '✓' : '✗')}
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-red-700">Loading your data summary...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">⚠️ Error loading data summary</div>
            <div className="text-gray-600 mb-6">{error}</div>
            <button
              onClick={fetchDataSummary}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-2">
            🗑️ Data Sovereignty Center
          </h1>
          <p className="text-red-600 mb-4">
            Complete control over your consciousness data
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div>User ID: {userId}</div>
            <button
              onClick={fetchDataSummary}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              🔄 Refresh Data
            </button>
            <Link href="/labtools" className="text-red-600 hover:text-red-800 font-medium">
              ← Back to LabTools
            </Link>
          </div>
        </div>

        {deleteComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Memory Deletion Complete</h3>
              <p className="text-green-700">
                All your consciousness data has been permanently and completely deleted.
                You can continue using the system, and new data will only be collected with your consent.
              </p>
            </div>
          </div>
        )}

        {dataSummary && (
          <>
            {/* Data Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Consciousness Data Summary</h2>

              {dataSummary.data_exists ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <DataTypeCard
                      title="Consciousness Sessions"
                      count={dataSummary.data_summary.consciousness_patterns.elemental_evolution_sessions}
                      description={dataSummary.data_summary.consciousness_patterns.description}
                      type="count"
                    />
                    <DataTypeCard
                      title="Wisdom Moments"
                      count={dataSummary.data_summary.wisdom_learning.wisdom_moments_recorded}
                      description={dataSummary.data_summary.wisdom_learning.description}
                      type="count"
                    />
                    <DataTypeCard
                      title="Memory Snapshots"
                      count={dataSummary.data_summary.complete_snapshots.memory_snapshots_stored}
                      description={dataSummary.data_summary.complete_snapshots.description}
                      type="count"
                    />
                    <DataTypeCard
                      title="Personality Profile"
                      count={dataSummary.data_summary.personality_profile.profile_exists}
                      description={dataSummary.data_summary.personality_profile.description}
                      type="boolean"
                    />
                  </div>

                  {dataSummary.data_timeline.earliest_data && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Data Timeline</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">First Data</div>
                          <div className="text-gray-600">
                            {new Date(dataSummary.data_timeline.earliest_data).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Latest Data</div>
                          <div className="text-gray-600">
                            {new Date(dataSummary.data_timeline.latest_data).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Total Days</div>
                          <div className="text-gray-600">
                            {dataSummary.data_timeline.total_days_of_data} days
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Found</h3>
                  <p className="text-gray-600">
                    No consciousness data is currently stored for your account.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy Protection</h2>
              <div className="space-y-3">
                {dataSummary.privacy_notes.map((note, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-green-500 mt-1">🔒</div>
                    <div className="text-gray-700">{note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deletion Controls */}
            {dataSummary.data_exists && dataSummary.deletion_info.deletion_available && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-red-800 mb-6">Delete My Memory</h2>

                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="font-semibold">Immediate</div>
                      <div className="text-sm text-gray-600">Deletion happens instantly</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl mb-2">🔄</div>
                      <div className="font-semibold">Permanent</div>
                      <div className="text-sm text-gray-600">Cannot be undone or recovered</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl mb-2">🛡️</div>
                      <div className="font-semibold">Complete</div>
                      <div className="text-sm text-gray-600">All data deleted across all systems</div>
                    </div>
                  </div>
                </div>

                {!showDeleteInterface ? (
                  <div className="text-center">
                    <button
                      onClick={() => setShowDeleteInterface(true)}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
                    >
                      Delete All My Consciousness Data
                    </button>
                    <p className="text-sm text-gray-600 mt-3">
                      This action cannot be undone. All your consciousness data will be permanently deleted.
                    </p>
                  </div>
                ) : (
                  <div className="border border-red-300 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-800 mb-4">Confirm Data Deletion</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type the following phrase to confirm: <span className="font-bold text-red-600">
                            {dataSummary.deletion_info.required_confirmation}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={confirmationPhrase}
                          onChange={(e) => setConfirmationPhrase(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Type confirmation phrase here"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for deletion (optional)
                        </label>
                        <textarea
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Help us understand why you're deleting your data (optional)"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={handleDeleteMemory}
                          disabled={
                            confirmationPhrase !== dataSummary.deletion_info.required_confirmation ||
                            isDeleting
                          }
                          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? 'Deleting...' : 'Permanently Delete All Data'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteInterface(false);
                            setConfirmationPhrase('');
                            setDeleteReason('');
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          Data sovereignty is a fundamental right. You have complete control over your consciousness data.
        </div>
      </div>
    </div>
  );
};

export default DataSovereigntyCenter;
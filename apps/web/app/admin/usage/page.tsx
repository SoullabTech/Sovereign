'use client';

/**
 * Admin Usage Dashboard
 *
 * View usage statistics and manage user quotas
 */

import { useState, useEffect } from 'react';

interface UserStats {
  userId: string;
  userName: string;
  tier: string;
  isBlocked: boolean;
  dailyMessages: {
    current: number;
    limit: number;
    percentage: string;
  };
  dailyTokens: {
    current: number;
    limit: number;
    percentage: string;
  };
  dailyCost: {
    current: string;
    limit: string;
    percentage: string;
  };
  totalRequests: number;
  totalCostUSD: string;
  lastActive: string;
}

interface SystemSummary {
  period: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: string;
  uniqueUsers: number;
  totalTokens: number;
  totalCostUSD: string;
  avgResponseTimeMs: number;
  requestsPerDay: string;
  costPerDay: string;
}

export default function AdminUsagePage() {
  const [systemSummary, setSystemSummary] = useState<SystemSummary | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  // Fetch system summary
  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/admin/usage/summary?days=${days}`);
        if (response.ok) {
          const data = await response.json();
          setSystemSummary(data);
        }
      } catch (error) {
        console.error('Error fetching system summary:', error);
      }
    }
    fetchSummary();
  }, [days]);

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/usage/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch user details
  useEffect(() => {
    if (!selectedUserId) {
      setUserDetails(null);
      return;
    }

    async function fetchUserDetails() {
      try {
        const response = await fetch(`/api/admin/usage/${selectedUserId}?days=${days}`);
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
    fetchUserDetails();
  }, [selectedUserId, days]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          MAIA Usage Dashboard
        </h1>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setDays(1)}
            className={`px-4 py-2 rounded ${days === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setDays(7)}
            className={`px-4 py-2 rounded ${days === 7 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-4 py-2 rounded ${days === 30 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            30 Days
          </button>
        </div>

        {/* System Summary */}
        {systemSummary && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">System Overview ({systemSummary.period})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl font-bold text-gray-900">{systemSummary.totalRequests.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">{systemSummary.successRate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-2xl font-bold text-blue-600">${systemSummary.totalCostUSD}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Unique Users</div>
                <div className="text-2xl font-bold text-purple-600">{systemSummary.uniqueUsers}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-2xl font-bold text-orange-600">{systemSummary.avgResponseTimeMs}ms</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Requests/Day</div>
                <div className="text-2xl font-bold text-indigo-600">{systemSummary.requestsPerDay}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cost/Day</div>
                <div className="text-2xl font-bold text-pink-600">${systemSummary.costPerDay}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Tokens</div>
                <div className="text-2xl font-bold text-teal-600">{systemSummary.totalTokens.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
          {loading ? (
            <div className="text-gray-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-600">No users found. Run the database migration first.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">User</th>
                    <th className="text-left py-2 px-3">Tier</th>
                    <th className="text-left py-2 px-3">Messages</th>
                    <th className="text-left py-2 px-3">Tokens</th>
                    <th className="text-left py-2 px-3">Daily Cost</th>
                    <th className="text-left py-2 px-3">Total Cost</th>
                    <th className="text-left py-2 px-3">Requests</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="font-medium">{user.userId}</div>
                        <div className="text-xs text-gray-500">{user.userName}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-sm">{user.dailyMessages.current}/{user.dailyMessages.limit}</div>
                        <div className="text-xs text-gray-500">{user.dailyMessages.percentage}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-sm">{user.dailyTokens.current.toLocaleString()}/{user.dailyTokens.limit.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{user.dailyTokens.percentage}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-sm">${user.dailyCost.current}/${user.dailyCost.limit}</div>
                        <div className="text-xs text-gray-500">{user.dailyCost.percentage}</div>
                      </td>
                      <td className="py-2 px-3 font-medium">${user.totalCostUSD}</td>
                      <td className="py-2 px-3">{user.totalRequests}</td>
                      <td className="py-2 px-3">
                        {user.isBlocked ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Blocked</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => setSelectedUserId(user.userId)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {userDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{userDetails.userId}</h2>
                  <p className="text-gray-600">{userDetails.period}</p>
                </div>
                <button
                  onClick={() => setSelectedUserId('')}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Requests</div>
                  <div className="text-xl font-bold">{userDetails.totalRequests}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-xl font-bold text-green-600">{userDetails.successRate}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Cost</div>
                  <div className="text-xl font-bold text-blue-600">${userDetails.totalCostUSD}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Tokens</div>
                  <div className="text-xl font-bold">{userDetails.totalTokens.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <div className="text-xl font-bold">{userDetails.avgResponseTimeMs}ms</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Failed Requests</div>
                  <div className="text-xl font-bold text-red-600">{userDetails.failedRequests}</div>
                </div>
              </div>

              {userDetails.quota && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                  <h3 className="font-semibold mb-2">Current Quota Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Daily Messages: {userDetails.quota.current_daily_messages}/{userDetails.quota.daily_message_limit}</div>
                    <div>Daily Tokens: {userDetails.quota.current_daily_tokens.toLocaleString()}/{userDetails.quota.daily_token_limit.toLocaleString()}</div>
                    <div>Tier: {userDetails.quota.user_tier}</div>
                    <div>Status: {userDetails.quotaStatus}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Recent Requests</h3>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Tokens</th>
                        <th className="text-left p-2">Cost</th>
                        <th className="text-left p-2">Response Time</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.logs?.slice(0, 20).map((log: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="p-2">{log.request_type}</td>
                          <td className="p-2">{log.total_tokens}</td>
                          <td className="p-2">${((log.input_cost + log.output_cost) / 100).toFixed(4)}</td>
                          <td className="p-2">{log.response_time_ms}ms</td>
                          <td className="p-2">
                            {log.success ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600" title={log.error_message}>✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

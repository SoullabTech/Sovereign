'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Inbox,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  Target,
  Flame,
  Package,
  Loader2,
} from 'lucide-react';
import {
  useTriageItems,
  useAgentTasks,
  useDailyLog,
} from '@/hooks/useStudioData';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} days ago`;
}

export default function StudioCommandCenter() {
  const [isTracking, setIsTracking] = useState(true);
  const [delegateText, setDelegateText] = useState('');
  const [delegateAgent, setDelegateAgent] = useState('maia-dev');

  const { items: triageItems, loading: triageLoading } = useTriageItems();
  const { tasks: agentTasks, loading: tasksLoading, createTask } = useAgentTasks();
  const { todayLog, loading: logLoading, incrementCounter } = useDailyLog();

  const loading = triageLoading || tasksLoading || logLoading;

  // Compute stats from real data
  const triageStats = {
    urgent: triageItems.filter(i => i.priority === 'urgent').length,
    today: triageItems.filter(i => i.priority === 'today').length,
    unset: triageItems.filter(i => i.priority === 'unset').length,
    total: triageItems.filter(i => i.status === 'pending').length,
  };

  const agentStats = {
    running: agentTasks.filter(t => t.status === 'running').length,
    completed: agentTasks.filter(t => t.status === 'completed').length,
    pendingReview: agentTasks.filter(t => t.review_status === 'pending_review').length,
  };

  const todayStats = {
    hoursLogged: todayLog?.hours_at_computer || 0,
    firesFought: todayLog?.fires_fought || 0,
    delegated: todayLog?.tasks_delegated || 0,
    shipped: todayLog?.shipments || 0,
  };

  // Build recent activity from real data
  const recentActivity: Array<{
    id: string;
    type: 'delegated' | 'review_ready' | 'shipped' | 'triage';
    title: string;
    agent?: string;
    priority?: string;
    time: string;
  }> = [];

  // Add recent triage items
  triageItems.slice(0, 3).forEach(item => {
    recentActivity.push({
      id: `triage-${item.id}`,
      type: 'triage',
      title: item.title,
      priority: item.priority,
      time: formatRelativeTime(item.created_at),
    });
  });

  // Add recent agent tasks
  agentTasks.slice(0, 3).forEach(task => {
    recentActivity.push({
      id: `task-${task.id}`,
      type: task.review_status === 'pending_review' ? 'review_ready' : 'delegated',
      title: task.title,
      agent: task.agent_type,
      time: formatRelativeTime(task.created_at),
    });
  });

  // Sort by time (most recent first) and limit
  recentActivity.sort((a, b) => a.time.localeCompare(b.time));
  const displayActivity = recentActivity.slice(0, 5);

  // Quick delegate handler
  const handleQuickDelegate = async () => {
    if (!delegateText.trim()) return;
    await createTask({
      title: delegateText.split('\n')[0].slice(0, 100),
      prompt: delegateText,
      agent_type: delegateAgent,
    });
    setDelegateText('');
    await incrementCounter('delegated');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-slate-500 mt-0.5">Operator Dashboard</p>
          <p className="text-slate-600 text-sm mt-1">Review work, monitor delegation, and keep momentum moving.</p>
        </div>

        {/* Time Tracking Toggle */}
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${isTracking
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'}
          `}
        >
          {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isTracking ? 'Tracking' : 'Paused'}</span>
          <span className="font-mono">{todayStats.hoursLogged}h</span>
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Triage Queue */}
        <Link href="/studio/triage">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <Inbox className="w-5 h-5 text-amber-400" />
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {triageStats.total}
            </div>
            <div className="text-sm text-slate-400">In Triage</div>
            {triageStats.urgent > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                <AlertTriangle className="w-3 h-3" />
                {triageStats.urgent} urgent
              </div>
            )}
            {triageStats.unset > 0 && triageStats.urgent === 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                <Inbox className="w-3 h-3" />
                {triageStats.unset} untriaged
              </div>
            )}
          </motion.div>
        </Link>

        {/* Agent Work */}
        <Link href="/studio/code">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {agentStats.running}
            </div>
            <div className="text-sm text-slate-400">Agents Running</div>
            <div className="mt-2 text-xs text-slate-500">
              {agentStats.completed} completed
            </div>
          </motion.div>
        </Link>

        {/* Pending Review */}
        <Link href="/studio/code">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {agentStats.pendingReview}
            </div>
            <div className="text-sm text-slate-400">Ready for Review</div>
            {agentStats.pendingReview > 0 && (
              <div className="mt-2 text-xs text-amber-400">
                Your decision needed
              </div>
            )}
          </motion.div>
        </Link>

        {/* Today's Progress */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-slate-500">Target: &lt;8h</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {todayStats.hoursLogged}h
          </div>
          <div className="text-sm text-slate-400">Today</div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayStats.hoursLogged / 8) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Today's Flow - Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Operator Gates Summary */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Decisions Needed
            </h2>

            {(agentStats.pendingReview > 0 || triageStats.unset > 0) ? (
              <div className="space-y-3">
                {/* Pending reviews from agent tasks */}
                {agentTasks
                  .filter(t => t.review_status === 'pending_review')
                  .slice(0, 3)
                  .map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div>
                          <div className="text-sm text-white font-medium">{task.title}</div>
                          <div className="text-xs text-slate-400">{task.agent_type} completed • Taste + Risk gate</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/studio/code" className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}

                {/* Untriaged items */}
                {triageItems
                  .filter(i => i.priority === 'unset')
                  .slice(0, 2)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <div>
                          <div className="text-sm text-white font-medium">{item.title}</div>
                          <div className="text-xs text-slate-400">Untriaged • Priority gate</div>
                        </div>
                      </div>
                      <Link href="/studio/triage" className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                        Triage
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-slate-400">Your desk is clear.</div>
                <div className="text-sm mt-1">New requests and delegated work will appear here.</div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            {displayActivity.length > 0 ? (
              <div className="space-y-3">
                {displayActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
                  >
                    {activity.type === 'delegated' && (
                      <GitBranch className="w-4 h-4 text-blue-400" />
                    )}
                    {activity.type === 'review_ready' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                    {activity.type === 'shipped' && (
                      <Package className="w-4 h-4 text-emerald-400" />
                    )}
                    {activity.type === 'triage' && (
                      <Inbox className="w-4 h-4 text-amber-400" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-white">{activity.title}</div>
                      <div className="text-xs text-slate-500">
                        {activity.agent && <span className="text-slate-400">{activity.agent} • </span>}
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-slate-400">Quiet for now.</div>
                <div className="text-sm mt-1">Today's work will accumulate here as it unfolds.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Metrics & Quick Actions */}
        <div className="space-y-6">
          {/* Today's Proof Signals */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Today's Signals
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Fires fought</span>
                </div>
                <span className="text-white font-medium">{todayStats.firesFought}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-sm">Delegated</span>
                </div>
                <span className="text-white font-medium">{todayStats.delegated}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Shipped</span>
                </div>
                <span className="text-white font-medium">{todayStats.shipped}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Hours</span>
                </div>
                <span className={`font-medium ${todayStats.hoursLogged < 8 ? 'text-amber-400' : 'text-red-400'}`}>
                  {todayStats.hoursLogged}h / 8h
                </span>
              </div>
            </div>
          </div>

          {/* Quick Delegate */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Delegate</h2>
            <textarea
              value={delegateText}
              onChange={(e) => setDelegateText(e.target.value)}
              placeholder="Describe the task to delegate..."
              className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50"
            />
            <div className="mt-3 flex items-center gap-2">
              <select
                value={delegateAgent}
                onChange={(e) => setDelegateAgent(e.target.value)}
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="maia-dev">maia-dev</option>
                <option value="explore">explore</option>
                <option value="maia-ops">maia-ops</option>
                <option value="ain-architect">ain-architect</option>
              </select>
              <button
                onClick={handleQuickDelegate}
                disabled={!delegateText.trim()}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delegate
              </button>
            </div>
          </div>

          {/* MAIA Quick Consult */}
          <Link href="/studio/maia">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-5 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Consult MAIA</h2>
              </div>
              <p className="text-sm text-slate-300">
                Strategic decisions, Clarity Gate, or just thinking out loud.
              </p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}

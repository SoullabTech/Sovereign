'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  AlertTriangle,
  Clock,
  Calendar,
  Archive,
  XCircle,
  GitBranch,
  Plus,
  Filter,
  Loader2,
} from 'lucide-react';
import { useTriageItems, TriageItem } from '@/hooks/useStudioData';

const priorityConfig = {
  unset: { label: 'Untriaged', color: 'slate', icon: Inbox },
  urgent: { label: 'Urgent', color: 'red', icon: AlertTriangle },
  today: { label: 'Today', color: 'amber', icon: Clock },
  this_week: { label: 'This Week', color: 'blue', icon: Calendar },
  backlog: { label: 'Backlog', color: 'slate', icon: Archive },
  wont_fix: { label: "Won't Fix", color: 'slate', icon: XCircle },
};

export default function TriagePage() {
  const { items, loading, createItem, updateItem } = useTriageItems();
  const [filter, setFilter] = useState<string>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.priority === filter);

  const handlePriorityChange = async (itemId: string, newPriority: TriageItem['priority']) => {
    await updateItem(itemId, { priority: newPriority });
  };

  const handleDelegate = async (item: TriageItem) => {
    // For now, just show that it's being delegated
    // In a full implementation, this would create an agent task
    alert(`Delegating "${item.title}" to maia-dev agent`);
  };

  const handleCreateItem = async () => {
    if (!newTitle.trim()) return;
    await createItem({
      title: newTitle,
      description: newDescription || undefined,
      source: 'manual',
    });
    setNewTitle('');
    setNewDescription('');
    setShowNewForm(false);
  };

  const untriagedCount = items.filter(i => i.priority === 'unset').length;
  const urgentCount = items.filter(i => i.priority === 'urgent').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
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
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            Triage Queue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operator Gate 1: Decide what matters
          </p>
        </div>

        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* New Item Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs attention?"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Details (optional)"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 h-20 resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateItem}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm"
                >
                  Add to Queue
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 mb-6">
        {untriagedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm">
            <Inbox className="w-4 h-4" />
            {untriagedCount} untriaged
          </div>
        )}
        {urgentCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4" />
            {urgentCount} urgent
          </div>
        )}

        {/* Filter */}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
          >
            <option value="all">All Items</option>
            <option value="unset">Untriaged</option>
            <option value="urgent">Urgent</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="backlog">Backlog</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredItems.map((item) => {
            const config = priorityConfig[item.priority];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${item.priority === 'urgent' ? 'bg-red-500/20' : ''}
                    ${item.priority === 'today' ? 'bg-amber-500/20' : ''}
                    ${item.priority === 'this_week' ? 'bg-blue-500/20' : ''}
                    ${item.priority === 'unset' ? 'bg-slate-800' : ''}
                    ${item.priority === 'backlog' ? 'bg-slate-800' : ''}
                  `}>
                    <config.icon className={`w-5 h-5
                      ${item.priority === 'urgent' ? 'text-red-400' : ''}
                      ${item.priority === 'today' ? 'text-amber-400' : ''}
                      ${item.priority === 'this_week' ? 'text-blue-400' : ''}
                      ${item.priority === 'unset' ? 'text-slate-400' : ''}
                      ${item.priority === 'backlog' ? 'text-slate-500' : ''}
                    `} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${item.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : ''}
                        ${item.priority === 'today' ? 'bg-amber-500/20 text-amber-400' : ''}
                        ${item.priority === 'this_week' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${item.priority === 'unset' ? 'bg-slate-700 text-slate-400' : ''}
                        ${item.priority === 'backlog' ? 'bg-slate-700 text-slate-500' : ''}
                      `}>
                        {config.label}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{item.source.replace('_', ' ')}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {/* Priority Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePriorityChange(item.id, 'urgent')}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          item.priority === 'urgent'
                            ? 'bg-red-500/30 text-red-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                        title="Urgent"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePriorityChange(item.id, 'today')}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          item.priority === 'today'
                            ? 'bg-amber-500/30 text-amber-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400'
                        }`}
                        title="Today"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePriorityChange(item.id, 'this_week')}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          item.priority === 'this_week'
                            ? 'bg-blue-500/30 text-blue-400'
                            : 'bg-slate-800 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400'
                        }`}
                        title="This Week"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePriorityChange(item.id, 'backlog')}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          item.priority === 'backlog'
                            ? 'bg-slate-600 text-slate-300'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        title="Backlog"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delegate Button */}
                    {item.priority !== 'unset' && item.priority !== 'backlog' && item.priority !== 'wont_fix' && (
                      <button
                        onClick={() => handleDelegate(item)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-xs"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Delegate
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">Queue is clear</div>
          <div className="text-sm mt-1">No items match this filter</div>
        </div>
      )}
    </div>
  );
}

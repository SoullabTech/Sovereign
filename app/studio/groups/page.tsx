'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  MoreHorizontal,
  Loader2,
  FolderOpen,
  UserPlus,
  ChevronRight,
  Video,
  MapPin,
  Phone,
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  color: string;
  groupType: 'cohort' | 'ongoing' | 'program' | 'category';
  status: 'active' | 'archived' | 'completed';
  meetingDay?: number;
  meetingTime?: string;
  meetingLocationType?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  maxMembers?: number;
  memberCount: number;
  createdAt: string;
}

const groupTypeConfig = {
  cohort: { label: 'Cohort', color: 'purple', description: 'Time-bound group' },
  ongoing: { label: 'Ongoing', color: 'teal', description: 'Recurring meetings' },
  program: { label: 'Program', color: 'amber', description: 'Multi-session' },
  category: { label: 'Category', color: 'slate', description: 'Business segment' },
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'all') params.set('type', typeFilter);

        const res = await fetch(`/api/studio/groups?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [typeFilter]);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);

  const formatTime = (time?: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const LocationIcon = ({ type }: { type?: string }) => {
    if (type === 'video') return <Video className="w-3.5 h-3.5" />;
    if (type === 'phone') return <Phone className="w-3.5 h-3.5" />;
    if (type === 'in_person') return <MapPin className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-indigo-400" />
            Client Groups
          </h1>
          <p className="text-slate-400 mt-1">
            {groups.length} groups · {totalMembers} total members
          </p>
        </div>

        <Link
          href="/studio/groups/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Group
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'cohort', 'ongoing', 'program', 'category'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                typeFilter === type
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {type === 'all' ? 'All' : groupTypeConfig[type as keyof typeof groupTypeConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Group Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredGroups.map((group) => {
                const typeConfig = groupTypeConfig[group.groupType];

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link
                      href={`/studio/groups/${group.id}`}
                      className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${group.color}20` }}
                          >
                            <Users className="w-6 h-6" style={{ color: group.color }} />
                          </div>
                          <div>
                            <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                              {group.name}
                            </h3>
                            <span className={`
                              px-2 py-0.5 text-xs rounded-full
                              ${typeConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : ''}
                              ${typeConfig.color === 'teal' ? 'bg-teal-500/20 text-teal-400' : ''}
                              ${typeConfig.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                              ${typeConfig.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
                            `}>
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>

                      {/* Description */}
                      {group.description && (
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {group.memberCount}
                            {group.maxMembers ? ` / ${group.maxMembers}` : ''} members
                          </span>
                        </div>
                        {group.totalSessions && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{group.totalSessions} sessions</span>
                          </div>
                        )}
                      </div>

                      {/* Schedule Info for ongoing groups */}
                      {group.groupType === 'ongoing' && group.meetingDay !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {dayNames[group.meetingDay]}s at {formatTime(group.meetingTime)}
                          </span>
                          {group.meetingLocationType && (
                            <LocationIcon type={group.meetingLocationType} />
                          )}
                        </div>
                      )}

                      {/* Date Range for cohorts/programs */}
                      {(group.groupType === 'cohort' || group.groupType === 'program') && group.startDate && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(group.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {group.endDate && (
                              <> - {new Date(group.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Capacity Bar */}
                      {group.maxMembers && (
                        <div className="mt-4">
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min((group.memberCount / group.maxMembers) * 100, 100)}%`,
                                backgroundColor: group.color,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredGroups.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg">No groups found</div>
              <div className="text-sm mt-1">Create a group to organize your clients</div>
              <Link
                href="/studio/groups/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Group
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

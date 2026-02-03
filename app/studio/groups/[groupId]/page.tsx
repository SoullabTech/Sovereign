'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Edit3,
  UserPlus,
  X,
  Search,
  Mail,
  Check,
  AlertCircle,
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
  meetingDurationMinutes?: number;
  meetingLocationType?: string;
  meetingLink?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  maxMembers?: number;
  memberCount: number;
  notes?: string;
  members?: GroupMember[];
}

interface GroupMember {
  membershipId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  membershipStatus: string;
  role: string;
  joinedAt: string;
  sessionsAttended: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const groupTypeLabels = {
  cohort: 'Cohort',
  ongoing: 'Ongoing Group',
  program: 'Program',
  category: 'Category',
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add member state
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch group with members
  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      try {
        const res = await fetch(`/api/studio/groups?includeMembers=true`);
        if (res.ok) {
          const data = await res.json();
          const foundGroup = data.groups?.find((g: Group) => g.id === groupId);
          if (foundGroup) {
            setGroup(foundGroup);
          }
        }
      } catch (err) {
        console.error('Failed to fetch group:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [groupId]);

  // Fetch clients for adding members
  useEffect(() => {
    if (showAddMember && clients.length === 0) {
      setLoadingClients(true);
      fetch('/api/studio/clients')
        .then(res => res.json())
        .then(data => setClients(data.clients || []))
        .catch(console.error)
        .finally(() => setLoadingClients(false));
    }
  }, [showAddMember, clients.length]);

  const existingMemberIds = group?.members?.map(m => m.clientId) || [];
  const availableClients = clients.filter(c =>
    !existingMemberIds.includes(c.id) &&
    (c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
     c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  const handleAddMember = async (clientId: string) => {
    setAddingMember(true);
    setError(null);

    try {
      const res = await fetch('/api/studio/groups/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, clientId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Refresh group data
      const groupRes = await fetch(`/api/studio/groups?includeMembers=true`);
      const groupData = await groupRes.json();
      const updatedGroup = groupData.groups?.find((g: Group) => g.id === groupId);
      if (updatedGroup) setGroup(updatedGroup);

      setClientSearch('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm('Remove this member from the group?')) return;

    try {
      const res = await fetch(`/api/studio/groups/members?membershipId=${membershipId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Update local state
      if (group) {
        setGroup({
          ...group,
          members: group.members?.filter(m => m.membershipId !== membershipId),
          memberCount: group.memberCount - 1,
        });
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleArchiveGroup = async () => {
    if (!confirm('Archive this group? Members will remain but the group will be hidden.')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/studio/groups?id=${groupId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        router.push('/studio/groups');
      }
    } catch (err) {
      console.error('Failed to archive group:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="text-center py-12 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">Group not found</div>
          <Link href="/studio/groups" className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/studio/groups"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <Users className="w-6 h-6" style={{ color: group.color }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{group.name}</h1>
              <p className="text-sm text-slate-500">
                {groupTypeLabels[group.groupType]} · {group.memberCount} members
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>

          <div className="relative">
            <button
              onClick={() => setShowEditMenu(!showEditMenu)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showEditMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEditMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => {
                      setShowEditMenu(false);
                      // TODO: Edit group
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2 rounded-t-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Group
                  </button>
                  <button
                    onClick={() => {
                      setShowEditMenu(false);
                      handleArchiveGroup();
                    }}
                    disabled={deleting}
                    className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2 rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Archive Group
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Members List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-medium text-white">Members ({group.members?.length || 0})</h2>
            </div>

            {group.members && group.members.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {group.members.map((member) => (
                  <div
                    key={member.membershipId}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                        {member.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{member.clientName}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          {member.clientEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-500">
                        {member.sessionsAttended > 0 && `${member.sessionsAttended} sessions`}
                      </div>
                      {member.role !== 'member' && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded">
                          {member.role}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.membershipId)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No members yet</p>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-2 text-indigo-400 hover:text-indigo-300"
                >
                  Add first member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Group Details */}
        <div className="space-y-4">
          {/* Description */}
          {group.description && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
              <p className="text-slate-300 text-sm">{group.description}</p>
            </div>
          )}

          {/* Schedule (for ongoing groups) */}
          {group.groupType === 'ongoing' && group.meetingDay !== undefined && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{dayNames[group.meetingDay]}s</span>
                </div>
                {group.meetingTime && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{formatTime(group.meetingTime)}</span>
                    {group.meetingDurationMinutes && (
                      <span className="text-slate-500">({group.meetingDurationMinutes} min)</span>
                    )}
                  </div>
                )}
                {group.meetingLocationType && (
                  <div className="flex items-center gap-2 text-slate-300">
                    {group.meetingLocationType === 'video' && <Video className="w-4 h-4 text-slate-500" />}
                    {group.meetingLocationType === 'phone' && <Phone className="w-4 h-4 text-slate-500" />}
                    {group.meetingLocationType === 'in_person' && <MapPin className="w-4 h-4 text-slate-500" />}
                    <span className="capitalize">{group.meetingLocationType.replace('_', ' ')}</span>
                  </div>
                )}
                {group.meetingLink && (
                  <a
                    href={group.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 truncate block"
                  >
                    {group.meetingLink}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Program Dates */}
          {(group.groupType === 'cohort' || group.groupType === 'program') && group.startDate && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Program Dates</h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>
                    {new Date(group.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {group.endDate && (
                      <> - {new Date(group.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </span>
                </div>
                {group.totalSessions && (
                  <div className="text-sm text-slate-400">
                    {group.totalSessions} total sessions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Capacity */}
          {group.maxMembers && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Capacity</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">{group.memberCount} / {group.maxMembers}</span>
                <span className="text-sm text-slate-500">
                  {group.maxMembers - group.memberCount} spots left
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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

          {/* Notes */}
          {group.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Notes</h3>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{group.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMember(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  Add Member
                </h2>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search clients..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {loadingClients ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                    </div>
                  ) : availableClients.length > 0 ? (
                    <div className="space-y-1">
                      {availableClients.slice(0, 20).map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleAddMember(client.id)}
                          disabled={addingMember}
                          className="w-full p-3 text-left hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{client.name}</div>
                              <div className="text-xs text-slate-400">{client.email}</div>
                            </div>
                          </div>
                          {addingMember ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : clientSearch ? (
                    <div className="py-8 text-center text-slate-500">
                      No clients found matching "{clientSearch}"
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      {clients.length === 0 ? 'No clients available' : 'All clients are already members'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

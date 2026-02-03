'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Settings,
  UserPlus,
  Trash2,
  X,
  Check,
  MoreVertical,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { Team } from '@/hooks/useStudioData';

interface TeamMember {
  id: string;
  member_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  name: string;
  email: string;
  username: string;
  joined_at: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const roleColors = {
  owner: 'text-amber-400',
  admin: 'text-blue-400',
  member: 'text-green-400',
  viewer: 'text-slate-400',
};

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canManageMembers = team?.role === 'owner' || team?.role === 'admin';
  const canManageSettings = team?.role === 'owner';

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, membersRes] = await Promise.all([
        apiFetch(`/api/studio/teams/${teamId}`),
        apiFetch(`/api/studio/teams/${teamId}/members`),
      ]);

      const teamData = await teamRes.json();
      const membersData = await membersRes.json();

      setTeam(teamData.team);
      setMembers(membersData.members || []);
      setEditName(teamData.team?.name || '');
      setEditDescription(teamData.team?.description || '');
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const res = await apiFetch(`/api/studio/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('member');
        fetchTeam();
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await apiFetch(`/api/studio/teams/${teamId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      fetchTeam();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await apiFetch(`/api/studio/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });
      fetchTeam();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/studio/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      if (res.ok) {
        setShowSettingsModal(false);
        fetchTeam();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/studio/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/studio/teams');
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl text-white mb-2">Team not found</h1>
        <a href="/studio/teams" className="text-amber-400 hover:underline">
          Back to teams
        </a>
      </div>
    );
  }

  const RoleIcon = roleIcons[team.role!];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <a
        href="/studio/teams"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to teams
      </a>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">{team.name}</h1>
            {team.description && (
              <p className="text-slate-400 mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded text-xs">
                <RoleIcon className={`w-3 h-3 ${roleColors[team.role!]}`} />
                <span className="text-slate-300">{roleLabels[team.role!]}</span>
              </span>
              <span className="text-sm text-slate-500">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canManageSettings && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Team settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          {canManageMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-[#1e1e38] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="font-medium text-white">Members</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {members.map((member) => {
            const MemberRoleIcon = roleIcons[member.role];
            const isCurrentUser = false; // TODO: Compare with current member ID
            const canEdit = canManageMembers && member.role !== 'owner';

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {member.name || member.username}
                  </div>
                  <div className="text-sm text-slate-400 truncate">{member.email}</div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded text-xs ${roleColors[member.role]}`}>
                  <MemberRoleIcon className="w-3 h-3" />
                  <span>{roleLabels[member.role]}</span>
                </div>
                {canEdit && (
                  <div className="relative group">
                    <button className="p-1 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-[#1e1e38] border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                      {['admin', 'member', 'viewer'].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleUpdateRole(member.member_id, role)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-800/50 ${
                            member.role === role ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          Make {roleLabels[role as keyof typeof roleLabels]}
                        </button>
                      ))}
                      <div className="border-t border-slate-700" />
                      <button
                        onClick={() => handleRemoveMember(member.member_id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-800/50"
                      >
                        Remove from team
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1e1e38] rounded-xl border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-lg font-medium text-white">Invite Member</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="viewer">Viewer - Can view only</option>
                    <option value="member">Member - Can create and edit own items</option>
                    <option value="admin">Admin - Can manage all items and members</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1e1e38] rounded-xl border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-lg font-medium text-white">Team Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete team
                  </button>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={!editName.trim() || saving}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#1e1e38] rounded-xl border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <h2 className="text-lg font-medium text-white mb-2">Delete Team?</h2>
                <p className="text-slate-400 text-sm">
                  This will permanently delete the team and all shared items. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Team'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Gift, Copy, Check, X, Clock, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

interface Invite {
  id: string;
  passkey: string;
  intended_name: string | null;
  intended_email: string | null;
  status: 'pending' | 'redeemed' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  redeemed_at: string | null;
  redeemed_by_username: string | null;
  redeemed_by_name: string | null;
  personal_note: string | null;
}

interface InviteTreeMember {
  id: string;
  username: string;
  name: string;
  created_at: string;
  depth: number;
}

interface InviteStats {
  total: number;
  pending: number;
  redeemed: number;
  expired: number;
  revoked: number;
}

interface InviteManagerProps {
  memberId: string;
}

export function InviteManager({ memberId }: InviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteTree, setInviteTree] = useState<InviteTreeMember[]>([]);
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [memberInfo, setMemberInfo] = useState<{
    invitesRemaining: number;
    canInvite: boolean;
    canInviteIn: number;
    tier: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTree, setShowTree] = useState(false);

  const [newInviteName, setNewInviteName] = useState('');
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteNote, setNewInviteNote] = useState('');

  const [copiedPasskey, setCopiedPasskey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchInvites = useCallback(async () => {
    try {
      /* The server derives WHOSE invites these are from the session. Sending
         a member id here would be transmitting an authorization input the
         server must not trust — and must not appear to accept. */
      const response = await fetch('/api/invites/list');
      const data = await response.json();

      if (response.ok) {
        setInvites(data.invites);
        setInviteTree(data.inviteTree);
        setStats(data.stats);
        setMemberInfo(data.member);
      }
    } catch (err) {
      console.error('Failed to fetch invites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/invites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intendedName: newInviteName.trim() || undefined,
          intendedEmail: newInviteEmail.trim() || undefined,
          personalNote: newInviteNote.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewInviteName('');
        setNewInviteEmail('');
        setNewInviteNote('');
        setShowCreateForm(false);
        fetchInvites();
      } else {
        setError(data.error || 'Failed to create invite');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch('/api/invites/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });

      if (response.ok) {
        fetchInvites();
      }
    } catch (err) {
      console.error('Failed to revoke invite:', err);
    }
  };

  const copyPasskey = async (passkey: string) => {
    await navigator.clipboard.writeText(passkey);
    setCopiedPasskey(passkey);
    setTimeout(() => setCopiedPasskey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'redeemed': return 'text-emerald-600 bg-emerald-50';
      case 'expired': return 'text-gray-500 bg-gray-100';
      case 'revoked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-teal-600/60">
        Loading invites...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Gift className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-teal-900">Your Invites</h2>
            <p className="text-sm text-teal-600/70">
              {memberInfo?.invitesRemaining} invite{memberInfo?.invitesRemaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>

        {memberInfo?.canInvite ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/80 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Create Invite
          </button>
        ) : memberInfo?.canInviteIn ? (
          <div className="text-sm text-teal-600/70 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Can invite in {memberInfo.canInviteIn} day{memberInfo.canInviteIn !== 1 ? 's' : ''}
          </div>
        ) : null}
      </div>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-amber-50/50">
            <div className="text-xl font-semibold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-teal-600/60">Pending</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50/50">
            <div className="text-xl font-semibold text-emerald-600">{stats.redeemed}</div>
            <div className="text-xs text-teal-600/60">Joined</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50/50">
            <div className="text-xl font-semibold text-gray-500">{stats.expired}</div>
            <div className="text-xs text-teal-600/60">Expired</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50/50">
            <div className="text-xl font-semibold text-red-500">{stats.revoked}</div>
            <div className="text-xs text-teal-600/60">Revoked</div>
          </div>
        </div>
      )}

      {/* Create invite form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateInvite} className="p-4 rounded-xl bg-white/60 border border-teal-200/30 space-y-4">
              <div>
                <label className="block text-sm font-light text-teal-800 mb-1.5">
                  Who is this for? <span className="text-teal-600/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newInviteName}
                  onChange={(e) => setNewInviteName(e.target.value)}
                  placeholder="Friend's name"
                  className="w-full px-3 py-2 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-teal-800 mb-1.5">
                  Their email <span className="text-teal-600/50">(optional, for your reference)</span>
                </label>
                <input
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-teal-800 mb-1.5">
                  Personal note <span className="text-teal-600/50">(optional)</span>
                </label>
                <textarea
                  value={newInviteNote}
                  onChange={(e) => setNewInviteNote(e.target.value)}
                  placeholder="A note to remind yourself why you invited them..."
                  className="w-full px-3 py-2 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm resize-none"
                  rows={2}
                  disabled={isCreating}
                />
              </div>

              {error && (
                <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-2.5 border border-red-200/40">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 text-teal-700/60 text-sm hover:text-teal-700 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-medium bg-amber-500/80 hover:bg-amber-500 text-white transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Generate Passkey'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite list */}
      <div className="space-y-3">
        {invites.length === 0 ? (
          <div className="text-center py-8 text-teal-600/60">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No invites yet</p>
            <p className="text-sm mt-1">Create an invite to share MAIA with someone special</p>
          </div>
        ) : (
          invites.map((invite) => (
            <div
              key={invite.id}
              className="p-4 rounded-xl bg-white/40 border border-teal-200/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-teal-900 bg-teal-50/50 px-2 py-0.5 rounded">
                      {invite.passkey}
                    </code>
                    {invite.status === 'pending' && (
                      <button
                        onClick={() => copyPasskey(invite.passkey)}
                        className="p-1 text-teal-600/60 hover:text-teal-600 transition-colors"
                        title="Copy passkey"
                      >
                        {copiedPasskey === invite.passkey ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {invite.intended_name && (
                    <p className="text-sm text-teal-700">
                      For: {invite.intended_name}
                    </p>
                  )}

                  {invite.status === 'redeemed' && invite.redeemed_by_name && (
                    <p className="text-sm text-emerald-700">
                      Joined as: {invite.redeemed_by_name} (@{invite.redeemed_by_username})
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-teal-600/60">
                    <span>Created {formatDate(invite.created_at)}</span>
                    {invite.status === 'pending' && (
                      <span>Expires {formatDate(invite.expires_at)}</span>
                    )}
                    {invite.status === 'redeemed' && invite.redeemed_at && (
                      <span>Joined {formatDate(invite.redeemed_at)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                    {invite.status}
                  </span>

                  {invite.status === 'pending' && (
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-1.5 text-red-500/60 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Revoke invite"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite tree */}
      {inviteTree.length > 0 && (
        <div className="border-t border-teal-200/30 pt-4">
          <button
            onClick={() => setShowTree(!showTree)}
            className="flex items-center gap-2 text-sm text-teal-700/70 hover:text-teal-700 transition-colors"
          >
            {showTree ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Your invite tree ({inviteTree.length} member{inviteTree.length !== 1 ? 's' : ''})
          </button>

          <AnimatePresence>
            {showTree && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {inviteTree.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 text-sm"
                    style={{ paddingLeft: `${(member.depth - 1) * 20}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-400/60" />
                    <span className="text-teal-900">{member.name || member.username}</span>
                    <span className="text-teal-600/50">@{member.username}</span>
                    <span className="text-teal-600/40 text-xs">
                      {formatDate(member.created_at)}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

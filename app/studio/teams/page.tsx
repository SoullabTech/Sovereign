'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Crown, Shield, User, Eye, X } from 'lucide-react';
import { useTeams, Team } from '@/hooks/useStudioData';

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

function TeamsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { teams, loading, createTeam, refetch } = useTeams();
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setCreating(true);
    try {
      const team = await createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });
      if (team) {
        setShowCreateModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
        router.push(`/studio/teams/${team.id}`);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Co-lab</h1>
          <p className="text-slate-400 mt-1">Collaborate with others in a shared field</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Co-lab
        </button>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 bg-[#1e1e38] rounded-xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Co-labs yet</h3>
          <p className="text-slate-400 mb-6">
            Create a Co-lab to collaborate with others in a shared field
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first Co-lab
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => {
            const RoleIcon = roleIcons[team.role];
            return (
              <motion.a
                key={team.id}
                href={`/studio/teams/${team.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="block p-5 bg-[#1e1e38] rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded text-xs">
                    <RoleIcon className="w-3 h-3 text-amber-400" />
                    <span className="text-slate-300">{roleLabels[team.role]}</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{team.name}</h3>
                {team.description && (
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{team.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{team.member_count} member{team.member_count !== 1 ? 's' : ''}</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1e1e38] rounded-xl border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-lg font-medium text-white">Create Co-lab</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Co-lab Name</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Design Co-lab"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description (optional)</label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="What is this Co-lab for?"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || creating}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Co-lab'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <TeamsPageContent />
    </Suspense>
  );
}

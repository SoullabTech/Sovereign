'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, EyeOff, UserCheck, UserX, Clock, Download,
  AlertCircle, Check, X, Mail, Calendar, FileText, Settings,
  Lock, Unlock, Users, Bell, Archive, ExternalLink
} from 'lucide-react';
import {
  usePrivacyPermissions,
  PrivacySettings,
  ProfessionalAccess,
  CognitivePermissions,
  getDefaultPermissionsForRole,
  ProfessionalRole
} from '@/lib/maia/privacyPermissions';

interface PrivacySettingsPanelProps {
  onClose: () => void;
}

export default function PrivacySettingsPanel({ onClose }: PrivacySettingsPanelProps) {
  const privacyManager = usePrivacyPermissions();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'professional' | 'privacy' | 'audit'>('permissions');
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<ProfessionalAccess[]>([]);
  const [activeProfessionals, setActiveProfessionals] = useState<ProfessionalAccess[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await privacyManager.getSettings();
      const pending = await privacyManager.getPendingAccessRequests();
      const active = await privacyManager.getActiveProfessionalAccesses();

      setSettings(currentSettings);
      setPendingRequests(pending);
      setActiveProfessionals(active);

      // Cleanup expired accesses
      await privacyManager.cleanupExpiredAccesses();
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelfPermissions = async (permission: keyof CognitivePermissions, value: boolean) => {
    try {
      await privacyManager.updateSelfPermissions({ [permission]: value });
      await loadSettings();
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleProfessionalApproval = async (professionalId: string, approved: boolean) => {
    try {
      if (approved) {
        await privacyManager.approveProfessionalAccess(professionalId);
      } else {
        await privacyManager.revokeProfessionalAccess(professionalId);
      }
      await loadSettings();
    } catch (error) {
      console.error('Error handling professional access:', error);
    }
  };

  const revokeProfessionalAccess = async (professionalId: string) => {
    try {
      await privacyManager.revokeProfessionalAccess(professionalId);
      await loadSettings();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const exportPrivacyData = async () => {
    try {
      const exportData = await privacyManager.exportPermissionsData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maia-privacy-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting privacy data:', error);
    }
  };

  if (loading || !settings) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="glass rounded-2xl p-8">
          <div className="animate-pulse text-white">Loading privacy settings...</div>
        </div>
      </motion.div>
    );
  }

  const permissionGroups = [
    {
      title: 'Voice Analysis',
      icon: '🗣️',
      permissions: [
        { key: 'voiceMetricsAccess' as keyof CognitivePermissions, label: 'Voice Patterns', desc: 'Speech rate, pauses, breath patterns' },
        { key: 'elementalAnalysisAccess' as keyof CognitivePermissions, label: 'Elemental Resonance', desc: 'Fire, Water, Earth, Air, Aether energies' }
      ]
    },
    {
      title: 'Consciousness Architecture',
      icon: '🧠',
      permissions: [
        { key: 'lidaInsightsAccess' as keyof CognitivePermissions, label: 'LIDA Insights', desc: 'Attention and consciousness patterns' },
        { key: 'soarWisdomAccess' as keyof CognitivePermissions, label: 'SOAR Wisdom', desc: 'Planning and wisdom emergence' },
        { key: 'actrMemoryAccess' as keyof CognitivePermissions, label: 'ACT-R Memory', desc: 'Learning and memory patterns' },
        { key: 'microPsiAnalysisAccess' as keyof CognitivePermissions, label: 'MicroPsi Analysis', desc: 'Emotional and motivational insights' }
      ]
    },
    {
      title: 'Clinical Insights',
      icon: '🔬',
      permissions: [
        { key: 'clinicalInsightsAccess' as keyof CognitivePermissions, label: 'Clinical Observations', desc: 'Professional-level clinical insights' },
        { key: 'developmentalStageAccess' as keyof CognitivePermissions, label: 'Developmental Stage', desc: 'Growth and development patterns' },
        { key: 'integrationReadinessAccess' as keyof CognitivePermissions, label: 'Integration Readiness', desc: 'Therapeutic readiness assessment' }
      ]
    },
    {
      title: 'Patterns & Evolution',
      icon: '📈',
      permissions: [
        { key: 'historicalTrendsAccess' as keyof CognitivePermissions, label: 'Historical Trends', desc: 'Long-term pattern analysis' },
        { key: 'coherenceEvolutionAccess' as keyof CognitivePermissions, label: 'Coherence Evolution', desc: 'Voice coherence development' },
        { key: 'wisdomEmergenceAccess' as keyof CognitivePermissions, label: 'Wisdom Emergence', desc: 'Emerging wisdom patterns' }
      ]
    },
    {
      title: 'Data Management',
      icon: '🔒',
      permissions: [
        { key: 'dataExportAccess' as keyof CognitivePermissions, label: 'Data Export', desc: 'Export cognitive analysis data' },
        { key: 'therapeuticSharingAccess' as keyof CognitivePermissions, label: 'Therapeutic Sharing', desc: 'Share with professionals' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-aether" />
              <h2 className="text-2xl font-bold text-white">Privacy & Permissions</h2>
              <span className="px-2 py-1 bg-aether/20 text-aether text-xs rounded-full">
                Cognitive Analysis
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white/5 p-1 rounded-2xl">
            {[
              { id: 'permissions', label: 'What You See', icon: Eye },
              { id: 'professional', label: 'Professional Access', icon: UserCheck },
              { id: 'privacy', label: 'Privacy Settings', icon: Lock },
              { id: 'audit', label: 'Audit Log', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-aether text-dark'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'permissions' && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Control What You See</h3>
                  <p className="text-sm text-white/70">
                    Choose which cognitive insights are visible in your dashboard and analytics.
                    Clinical insights are hidden by default to maintain a soulful, non-pathologizing experience.
                  </p>
                </div>

                {permissionGroups.map(group => (
                  <div key={group.title} className="glass-heavy rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{group.icon}</span>
                      <h4 className="text-lg font-semibold text-white">{group.title}</h4>
                    </div>

                    <div className="space-y-3">
                      {group.permissions.map(permission => (
                        <div key={permission.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <div className="font-medium text-white">{permission.label}</div>
                            <div className="text-xs text-white/60 mt-1">{permission.desc}</div>
                          </div>
                          <button
                            onClick={() => updateSelfPermissions(permission.key, !settings.selfPermissions[permission.key])}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                              settings.selfPermissions[permission.key]
                                ? 'bg-aether'
                                : 'bg-white/20'
                            }`}
                          >
                            <div
                              className={`absolute w-5 h-5 bg-white rounded-full transition-all duration-300 top-0.5 ${
                                settings.selfPermissions[permission.key]
                                  ? 'translate-x-6'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'professional' && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Professional Access</h3>
                  <p className="text-sm text-white/70">
                    Manage which therapists, coaches, and clinicians can access your cognitive insights.
                    You have complete control over who sees what.
                  </p>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="glass-heavy rounded-2xl p-4 border border-amber-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Bell className="w-5 h-5 text-amber-400" />
                      <h4 className="text-lg font-semibold text-white">Pending Access Requests</h4>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        {pendingRequests.length}
                      </span>
                    </div>

                    {pendingRequests.map(request => (
                      <div key={request.professionalId} className="p-4 bg-amber-500/10 rounded-xl mb-3 last:mb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-white">{request.name}</h5>
                            <p className="text-sm text-amber-300 capitalize">{request.role}</p>
                            <p className="text-xs text-white/60 mt-1">{request.email}</p>
                          </div>
                          <div className="text-xs text-white/50 text-right">
                            Requested {new Date(request.grantedAt).toLocaleDateString()}
                            {request.expiresAt && (
                              <div>Expires {new Date(request.expiresAt).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>

                        {request.requestMessage && (
                          <div className="p-3 bg-white/5 rounded-lg mb-3">
                            <p className="text-sm text-white/80">&ldquo;{request.requestMessage}&rdquo;</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleProfessionalApproval(request.professionalId, true)}
                            className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleProfessionalApproval(request.professionalId, false)}
                            className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Professional Access */}
                {activeProfessionals.length > 0 && (
                  <div className="glass-heavy rounded-2xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-green-400" />
                      <h4 className="text-lg font-semibold text-white">Active Professional Access</h4>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {activeProfessionals.length}
                      </span>
                    </div>

                    {activeProfessionals.map(access => (
                      <div key={access.professionalId} className="p-4 bg-green-500/10 rounded-xl mb-3 last:mb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-white">{access.name}</h5>
                            <p className="text-sm text-green-300 capitalize">{access.role}</p>
                            <p className="text-xs text-white/60 mt-1">{access.email}</p>
                          </div>
                          <div className="text-xs text-white/50 text-right">
                            Active since {access.approvedAt ? new Date(access.approvedAt).toLocaleDateString() : 'N/A'}
                            {access.expiresAt && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(access.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-white/60 mb-3">
                          Access to: {Object.entries(access.permissions)
                            .filter(([_, granted]) => granted)
                            .map(([permission, _]) => permission.replace('Access', ''))
                            .join(', ')}
                        </div>

                        <button
                          onClick={() => revokeProfessionalAccess(access.professionalId)}
                          className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <UserX className="w-4 h-4" />
                          Revoke Access
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingRequests.length === 0 && activeProfessionals.length === 0 && (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60">No professional access requests at this time.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Privacy Settings</h3>
                  <p className="text-sm text-white/70">
                    Configure how your data is managed, retained, and shared.
                  </p>
                </div>

                {/* Privacy Controls */}
                <div className="grid gap-4">
                  <div className="glass-heavy rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Access Controls
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Allow Professional Requests</div>
                          <div className="text-xs text-white/60">Therapists can request access to your data</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.allowProfessionalRequests ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.allowProfessionalRequests ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Require Explicit Consent</div>
                          <div className="text-xs text-white/60">Each data type requires separate approval</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.requireExplicitConsent ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.requireExplicitConsent ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Auto-Expire Professional Access</div>
                          <div className="text-xs text-white/60">Access expires after {settings.defaultAccessDuration} days</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.autoExpireAccess ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.autoExpireAccess ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-heavy rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Archive className="w-5 h-5" />
                      Data Retention
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Retain Cognitive Data</div>
                          <div className="text-xs text-white/60">Keep cognitive analysis for insights over time</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.retainCognitiveData ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.retainCognitiveData ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded-xl">
                        <div className="font-medium text-white mb-2">Data Retention Period</div>
                        <div className="text-sm text-white/70">{settings.dataRetentionDays} days</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-heavy rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Access Requests</div>
                          <div className="text-xs text-white/60">Email when professionals request access</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.notifyOnAccessRequest ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.notifyOnAccessRequest ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Data Access</div>
                          <div className="text-xs text-white/60">Email when your data is viewed</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.notifyOnDataAccess ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.notifyOnDataAccess ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <div className="font-medium text-white">Data Exports</div>
                          <div className="text-xs text-white/60">Email when your data is exported</div>
                        </div>
                        <div className={`w-12 h-6 rounded-full ${settings.notifyOnExport ? 'bg-aether' : 'bg-white/20'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 top-0.5 relative ${
                            settings.notifyOnExport ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Privacy Audit Log</h3>
                  <p className="text-sm text-white/70">
                    Track who accessed your data and when. Complete transparency.
                  </p>
                </div>

                <div className="glass-heavy rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Audit Trail
                    </h4>
                    <button
                      onClick={exportPrivacyData}
                      className="px-3 py-1.5 bg-aether/20 text-aether rounded-lg text-sm font-medium hover:bg-aether/30 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Privacy settings initialized</span>
                        <span className="text-xs text-white/50">{new Date(settings.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {activeProfessionals.map(access => (
                      <div key={`audit-${access.professionalId}`} className="p-3 bg-green-500/10 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">Professional access granted to {access.name}</span>
                          <span className="text-xs text-white/50">
                            {access.approvedAt ? new Date(access.approvedAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {settings.enableAuditLog && (
                      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-300">Audit logging enabled</span>
                        </div>
                        <p className="text-xs text-blue-400 mt-1">
                          All data access events are being logged for your security.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-violet-400 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-violet-300">Your Data, Your Control</h5>
                      <p className="text-xs text-violet-400 mt-1">
                        You have complete control over your cognitive insights. You can revoke professional
                        access at any time, export your data, or delete your cognitive analysis history.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex justify-between items-center">
          <p className="text-xs text-white/50">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
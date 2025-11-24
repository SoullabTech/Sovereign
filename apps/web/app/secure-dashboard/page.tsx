"use client";

import { useState } from 'react';
import { useAuth } from '@/components/SecureAuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { User, Shield, Key, LogOut, Lock, Unlock, Database } from 'lucide-react';

function DashboardContent() {
  const { user, encryptionContext, signOut } = useAuth();
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-spiralogic px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-8 border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-aether to-recognition rounded-full flex items-center justify-center shadow-sacred">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="consciousness-header text-2xl">
                  Welcome to your Sacred Sanctuary
                </h1>
                <p className="sacred-subtitle">{user?.email}</p>
                <p className="text-xs text-aether/70 mt-1">
                  {user?.profile?.name && `Sacred Name: ${user.profile.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm glass border border-glass-border rounded-lg hover:border-fire/30 transition-all text-fire hover:text-fire"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Security Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Encryption Status */}
          <div className="glass rounded-2xl p-6 border border-glass-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-recognition/20 to-recognition/40 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-recognition" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Encryption Status</h3>
                <p className="text-sm text-recognition">Active • AES-256-CBC</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Encryption Context:</span>
                <span className="text-recognition">✓ Initialized</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Master Key:</span>
                <span className="text-recognition">✓ Derived</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">User Salt:</span>
                <span className="text-recognition">✓ {user?.encryptionSalt?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Database Security */}
          <div className="glass rounded-2xl p-6 border border-glass-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-aether/20 to-aether/40 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-aether" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Database Security</h3>
                <p className="text-sm text-aether">Encrypted • Row Level Security</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Data Isolation:</span>
                <span className="text-aether">✓ User Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Server Access:</span>
                <span className="text-aether">✓ Zero Plaintext</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Audit Logging:</span>
                <span className="text-aether">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Encryption Details */}
        <div className="glass rounded-2xl p-6 border border-glass-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-water/20 to-water/40 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-water" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Encryption Details</h3>
                <p className="text-sm text-water/70">Technical information about your security</p>
              </div>
            </div>
            <button
              onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
              className="flex items-center gap-2 px-3 py-1 text-sm glass border border-glass-border rounded-lg hover:border-water/30 transition-all"
            >
              {showEncryptionDetails ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {showEncryptionDetails ? 'Hide' : 'Show'}
            </button>
          </div>

          {showEncryptionDetails && encryptionContext && (
            <div className="space-y-4 pt-4 border-t border-glass-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide">User ID</label>
                  <p className="font-mono text-water text-xs mt-1 break-all">
                    {encryptionContext.userId}
                  </p>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide">Encryption Algorithm</label>
                  <p className="text-water text-xs mt-1">AES-256-CBC</p>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide">Key Derivation</label>
                  <p className="text-water text-xs mt-1">PBKDF2 (100,000 iterations)</p>
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wide">Salt (First 16 chars)</label>
                  <p className="font-mono text-water text-xs mt-1">
                    {encryptionContext.encryptionSalt.slice(0, 16)}...
                  </p>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 mt-4">
                <p className="text-xs text-white/60">
                  🔒 <strong>Privacy Notice:</strong> Your encryption keys are generated client-side from your password and never leave your device.
                  The server only sees encrypted data and cannot decrypt your journal entries or personal information.
                  This is a zero-trust architecture where you maintain complete control over your data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 border border-glass-border">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 glass border border-glass-border rounded-lg hover:border-aether/30 transition-all text-left">
              <User className="w-5 h-5 text-aether" />
              <div>
                <p className="font-medium text-white">Profile Settings</p>
                <p className="text-xs text-white/60">Update encrypted profile</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 glass border border-glass-border rounded-lg hover:border-recognition/30 transition-all text-left">
              <Shield className="w-5 h-5 text-recognition" />
              <div>
                <p className="font-medium text-white">Privacy Controls</p>
                <p className="text-xs text-white/60">Manage data access</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 glass border border-glass-border rounded-lg hover:border-water/30 transition-all text-left">
              <Key className="w-5 h-5 text-water" />
              <div>
                <p className="font-medium text-white">Change Password</p>
                <p className="text-xs text-white/60">Re-encrypt with new key</p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-8 text-center text-xs text-white/40">
          <p>Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
          <p>Last active: {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Now'}</p>
        </div>
      </div>
    </div>
  );
}

export default function SecureDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
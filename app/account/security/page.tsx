'use client';

/**
 * Account Security Settings
 *
 * Hub for all security-related settings:
 * - Sign-in methods (passkeys, OAuth, password)
 * - Trusted devices
 * - Active sessions
 * - Recovery options
 * - FAQ / How it works
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types
interface Passkey {
  id: string;
  credentialId: string;
  deviceName: string | null;
  deviceType: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface TrustedDevice {
  id: string;
  deviceName: string | null;
  deviceType: string;
  lastSeenAt: string;
  trustLevel: string;
}

interface ActiveSession {
  id: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface MemberAuth {
  hasWebauthn: boolean;
  hasOauth: boolean;
  oauthProvider: string | null;
  preferredAuthMethod: string;
  emailVerified: boolean;
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberAuth, setMemberAuth] = useState<MemberAuth | null>(null);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [activeSection, setActiveSection] = useState<string>('signin-methods');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    hasPasskey: boolean;
    emailVerified: boolean | null;
    sessionsCount: number;
    devicesCount: number;
    preferredAuthMethod?: string | null;
  } | null>(null);

  // Load security data
  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData() {
    try {
      setLoading(true);

      // Load all data in parallel
      let loadedPasskeys: Passkey[] = [];
      let loadedDevices: TrustedDevice[] = [];
      let loadedSessions: ActiveSession[] = [];
      let loadedMemberAuth: MemberAuth | null = null;

      // Load passkeys
      const passkeysRes = await fetch('/api/auth/passkeys', {
        credentials: 'include',
      });
      if (passkeysRes.ok) {
        const data = await passkeysRes.json();
        loadedPasskeys = data.passkeys || [];
        setPasskeys(loadedPasskeys);
      }

      // Load devices
      const devicesRes = await fetch('/api/auth/device/list', {
        credentials: 'include',
      });
      if (devicesRes.ok) {
        const data = await devicesRes.json();
        loadedDevices = data.devices || [];
        setDevices(loadedDevices);
      }

      // Load sessions
      const sessionsRes = await fetch('/api/auth/session/list', {
        credentials: 'include',
      });
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        loadedSessions = data.sessions || [];
        setSessions(loadedSessions);
      }

      // Load member auth info
      const memberRes = await fetch('/api/members/me', {
        credentials: 'include',
      });
      if (memberRes.ok) {
        const data = await memberRes.json();
        loadedMemberAuth = {
          hasWebauthn: data.member?.hasWebauthn || false,
          hasOauth: data.member?.hasOauth || false,
          oauthProvider: data.member?.oauthProvider || null,
          preferredAuthMethod: data.member?.preferredAuthMethod || 'password',
          emailVerified: data.member?.emailVerified || false,
        };
        setMemberAuth(loadedMemberAuth);
      }

      // Set security status summary using loaded data
      setStatus({
        hasPasskey: loadedPasskeys.length > 0,
        emailVerified: loadedMemberAuth?.emailVerified ?? null,
        sessionsCount: loadedSessions.length,
        devicesCount: loadedDevices.length,
        preferredAuthMethod: loadedMemberAuth?.preferredAuthMethod ?? null,
      });

    } catch (err) {
      console.error('Failed to load security data:', err);
      setError('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  }

  // Add passkey handler
  async function handleAddPasskey() {
    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        credentials: 'include',
      });
      if (!optionsRes.ok) throw new Error('Failed to get registration options');
      const options = await optionsRes.json();

      // Import WebAuthn browser helpers
      const { startRegistration } = await import('@simplewebauthn/browser');

      // Start registration
      const credential = await startRegistration({ optionsJSON: options });

      // Verify with server
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: credential,
          deviceName: getDeviceName(),
        }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || 'Registration failed');
      }

      // Reload passkeys
      loadSecurityData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add passkey';
      setError(message);
    }
  }

  // Revoke passkey handler
  async function handleRevokePasskey(credentialId: string) {
    if (!confirm('Remove this passkey? You won\'t be able to sign in with it anymore.')) {
      return;
    }

    // Step-up auth required for sensitive action
    const ok = await enforceStepUp();
    if (!ok) {
      setError('Please confirm with your passkey to continue.');
      return;
    }

    try {
      const res = await fetch('/api/auth/passkeys/revoke', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      });

      if (!res.ok) throw new Error('Failed to revoke passkey');

      // Reload
      loadSecurityData();
    } catch (err) {
      setError('Failed to remove passkey');
    }
  }

  // Revoke session handler
  async function handleRevokeSession(sessionId: string) {
    // Step-up auth required for sensitive action
    const ok = await enforceStepUp();
    if (!ok) {
      setError('Please confirm with your passkey to continue.');
      return;
    }

    try {
      const res = await fetch('/api/auth/session/revoke', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) throw new Error('Failed to revoke session');

      loadSecurityData();
    } catch (err) {
      setError('Failed to sign out device');
    }
  }

  // Revoke trusted device handler
  async function handleRevokeDevice(deviceId: string) {
    if (!confirm('Remove this device from trusted list?')) {
      return;
    }

    // Step-up auth required for sensitive action
    const ok = await enforceStepUp();
    if (!ok) {
      setError('Please confirm with your passkey to continue.');
      return;
    }

    try {
      const res = await fetch('/api/auth/device/revoke', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!res.ok) throw new Error('Failed to revoke device trust');

      loadSecurityData();
    } catch (err) {
      setError('Failed to remove trusted device');
    }
  }

  // Sign out all other sessions handler
  async function handleSignOutOtherSessions() {
    if (!confirm('Sign out of all other sessions?')) return;

    // Step-up auth required for bulk session revoke
    const ok = await enforceStepUp();
    if (!ok) {
      setError('Please confirm with your passkey to continue.');
      return;
    }

    try {
      const res = await fetch('/api/auth/session/revoke-others', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to revoke other sessions');

      loadSecurityData();
    } catch (e) {
      setError('Failed to sign out other sessions');
    }
  }

  // Step-up authentication enforcer
  async function enforceStepUp(): Promise<boolean> {
    try {
      // Check if recently authenticated
      const statusRes = await fetch('/api/auth/session/step-up/status', {
        credentials: 'include',
      });

      if (statusRes.ok) {
        const s = await statusRes.json();
        if (s.recent) return true;
      }

      // If not recent, attempt passkey re-auth
      const optionsRes = await fetch('/api/auth/webauthn/authenticate/options', {
        method: 'POST',
        credentials: 'include',
      });
      if (!optionsRes.ok) return false;

      const options = await optionsRes.json();

      // Import WebAuthn browser helpers
      const { startAuthentication } = await import('@simplewebauthn/browser');

      // Perform authentication
      const assertion = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch('/api/auth/webauthn/authenticate/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: assertion }),
      });

      if (!verifyRes.ok) return false;

      // Mark step-up time on session
      await fetch('/api/auth/session/step-up/mark', {
        method: 'POST',
        credentials: 'include',
      });

      return true;
    } catch (e) {
      console.error('Step-up auth failed:', e);
      return false;
    }
  }

  // Get device name for passkey
  function getDeviceName(): string {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    return 'Device';
  }

  // Format date
  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;

    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-maia-navy-900 flex items-center justify-center">
        <div className="text-maia-cream-100/60">Loading security settings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-maia-navy-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-maia-navy-700/10 via-transparent to-maia-navy-700/10 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/settings"
            className="text-maia-cream-100/60 hover:text-maia-cream-100 text-sm mb-4 inline-block"
          >
            ← Account Settings
          </Link>
          <h1 className="text-2xl font-medium text-maia-cream-100">Security</h1>
          <p className="text-maia-cream-100/60 mt-1">
            Manage how you sign in and keep your account secure
          </p>
        </div>

        {/* Security Status Banner */}
        {status && (
          <div className="mb-6 rounded-2xl border border-maia-navy-700/50 bg-maia-navy-800/50 p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-maia-cream-100/70">Security status</div>
                <div className="mt-1 text-lg font-semibold text-maia-cream-100">
                  {status.hasPasskey ? '✓ Passkey enabled' : '○ Passkey not set'} ·{' '}
                  {status.emailVerified === null
                    ? 'Email status unknown'
                    : status.emailVerified
                      ? '✓ Email verified'
                      : '○ Email unverified'}
                </div>
                <div className="mt-1 text-sm text-maia-cream-100/60">
                  {status.sessionsCount} active session{status.sessionsCount === 1 ? '' : 's'} ·{' '}
                  {status.devicesCount} trusted device{status.devicesCount === 1 ? '' : 's'}
                </div>
              </div>

              {!status.hasPasskey && (
                <button
                  onClick={handleAddPasskey}
                  className="rounded-xl bg-maia-spice-500 px-4 py-2 text-sm font-semibold text-white hover:bg-maia-spice-600 transition-colors"
                >
                  Add a passkey
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex gap-2 mb-8 flex-wrap">
          {['signin-methods', 'devices', 'sessions', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeSection === section
                  ? 'bg-maia-spice-500 text-white'
                  : 'bg-maia-navy-700/50 text-maia-cream-100/60 hover:text-maia-cream-100'
              }`}
            >
              {section === 'signin-methods' && 'Sign-in methods'}
              {section === 'devices' && 'Trusted devices'}
              {section === 'sessions' && 'Active sessions'}
              {section === 'faq' && 'How it works'}
            </button>
          ))}
        </nav>

        {/* Sign-in Methods Section */}
        {activeSection === 'signin-methods' && (
          <div className="space-y-6">
            {/* Passkeys */}
            <section className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-maia-cream-100">Passkeys</h2>
                  <p className="text-sm text-maia-cream-100/60">
                    Sign in with Face ID, Touch ID, or Windows Hello
                  </p>
                </div>
                <button
                  onClick={handleAddPasskey}
                  className="px-4 py-2 bg-maia-spice-500 text-white rounded-lg hover:bg-maia-spice-600 transition-colors text-sm"
                >
                  Add passkey
                </button>
              </div>

              {passkeys.length === 0 ? (
                <p className="text-maia-cream-100/40 text-sm py-4">
                  No passkeys registered. Add one for faster, more secure sign-in.
                </p>
              ) : (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-4 bg-maia-navy-700/30 rounded-lg"
                    >
                      <div>
                        <div className="text-maia-cream-100 font-medium">
                          {passkey.deviceName || 'Unnamed passkey'}
                        </div>
                        <div className="text-sm text-maia-cream-100/60">
                          {passkey.deviceType === 'platform' ? 'Built-in' : 'Security key'} •
                          Last used {formatDate(passkey.lastUsedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokePasskey(passkey.credentialId)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* OAuth */}
            <section className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h2 className="text-lg font-medium text-maia-cream-100 mb-4">Connected accounts</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-maia-navy-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-lg">G</span>
                    </div>
                    <span className="text-maia-cream-100">Google</span>
                  </div>
                  <span className={`text-sm ${memberAuth?.oauthProvider === 'google' ? 'text-green-400' : 'text-maia-cream-100/40'}`}>
                    {memberAuth?.oauthProvider === 'google' ? '✓ Connected' : 'Not connected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-maia-navy-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-lg"></span>
                    </div>
                    <span className="text-maia-cream-100">Apple</span>
                  </div>
                  <span className={`text-sm ${memberAuth?.oauthProvider === 'apple' ? 'text-green-400' : 'text-maia-cream-100/40'}`}>
                    {memberAuth?.oauthProvider === 'apple' ? '✓ Connected' : 'Not connected'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-maia-cream-100/40 mt-4">
                Social sign-in can be added during your next sign-in if you choose Google or Apple.
              </p>
            </section>

            {/* Password */}
            <section className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h2 className="text-lg font-medium text-maia-cream-100 mb-4">Password</h2>
              <p className="text-sm text-maia-cream-100/60 mb-4">
                Password is a fallback sign-in method. Passkeys are more secure.
              </p>
              <button className="text-maia-spice-400 hover:text-maia-spice-300 text-sm">
                Change password
              </button>
            </section>
          </div>
        )}

        {/* Trusted Devices Section */}
        {activeSection === 'devices' && (
          <section className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
            <h2 className="text-lg font-medium text-maia-cream-100 mb-4">Trusted devices</h2>
            <p className="text-sm text-maia-cream-100/60 mb-4">
              Devices you've marked as trusted won't require additional verification.
            </p>

            {devices.length === 0 ? (
              <p className="text-maia-cream-100/40 text-sm py-4">
                No trusted devices yet.
              </p>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 bg-maia-navy-700/30 rounded-lg"
                  >
                    <div>
                      <div className="text-maia-cream-100 font-medium">
                        {device.deviceName || device.deviceType || 'Unknown device'}
                      </div>
                      <div className="text-sm text-maia-cream-100/60">
                        Last seen {formatDate(device.lastSeenAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Active Sessions Section */}
        {activeSection === 'sessions' && (
          <section className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-maia-cream-100">Active sessions</h2>
              {sessions.filter(s => !s.isCurrent).length > 0 && (
                <button
                  onClick={handleSignOutOtherSessions}
                  className="rounded-xl border border-maia-navy-600/50 bg-maia-navy-700/30 px-3 py-2 text-sm text-maia-cream-100 hover:bg-maia-navy-700/50 transition-colors"
                >
                  Sign out other sessions
                </button>
              )}
            </div>
            <p className="text-sm text-maia-cream-100/60 mb-4">
              Devices where you're currently signed in. Sign out of any you don't recognize.
            </p>

            {sessions.length === 0 ? (
              <p className="text-maia-cream-100/40 text-sm py-4">
                No active sessions.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-maia-navy-700/30 rounded-lg"
                  >
                    <div>
                      <div className="text-maia-cream-100 font-medium flex items-center gap-2">
                        {session.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                        {session.isCurrent && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-maia-cream-100/60">
                        {session.ipAddress || 'Unknown IP'} •
                        Active {formatDate(session.lastActiveAt)}
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <section className="space-y-4">
            <div className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h3 className="text-maia-cream-100 font-medium mb-2">What is a passkey?</h3>
              <p className="text-sm text-maia-cream-100/60">
                A passkey is a modern replacement for passwords. It uses your device's built-in
                security (Face ID, Touch ID, or Windows Hello) to verify it's really you.
                Passkeys are phishing-resistant and can't be stolen in a data breach.
              </p>
            </div>

            <div className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h3 className="text-maia-cream-100 font-medium mb-2">Does MAIA store my Face ID?</h3>
              <p className="text-sm text-maia-cream-100/60">
                No. Your biometric data never leaves your device. MAIA only stores a public key
                that can verify your identity - it can't be used to recreate your Face ID or
                fingerprint.
              </p>
            </div>

            <div className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h3 className="text-maia-cream-100 font-medium mb-2">What if I lose my phone?</h3>
              <p className="text-sm text-maia-cream-100/60">
                You can always sign in with your password, magic link, or another connected
                account (Google/Apple). Then remove the lost device's passkey from this page.
              </p>
            </div>

            <div className="bg-maia-navy-800/50 rounded-xl p-6 border border-maia-navy-700/50">
              <h3 className="text-maia-cream-100 font-medium mb-2">How do I revoke access?</h3>
              <p className="text-sm text-maia-cream-100/60">
                Go to "Active sessions" to sign out of any device. Go to "Sign-in methods" to
                remove passkeys or disconnect OAuth accounts.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

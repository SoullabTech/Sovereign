'use client';

import { useEffect, useState } from 'react';
import {
  NOTIFICATION_EVENT_TYPES,
  EVENT_LABELS,
  type NotificationEventType,
  type NotificationChannel,
  type ResolvedPreference,
} from '@/lib/team/notificationTypes';

interface SmsStatus {
  available: boolean;
  phoneVerified: boolean;
  phoneMasked: string | null;
}

// Co-lab Notifications panel. The EMAIL channel is the live, opt-out-able
// delivery; the in-app badge is always on. The SMS column + phone-verification
// flow appear ONLY when SMS is configured (server flag + Twilio creds) — until
// then this renders exactly as the email-only panel.
export function NotificationSettings() {
  const [emailEnabled, setEmailEnabled] = useState<Record<string, boolean>>({});
  const [smsEnabled, setSmsEnabled] = useState<Record<string, boolean>>({});
  const [sms, setSms] = useState<SmsStatus>({ available: false, phoneVerified: false, phoneMasked: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // `${event}:${channel}`
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/team/notifications/preferences')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((d: { preferences: ResolvedPreference[]; sms?: SmsStatus }) => {
        if (!alive) return;
        const email: Record<string, boolean> = {};
        const text: Record<string, boolean> = {};
        for (const p of d.preferences) {
          if (p.channel === 'email') email[p.event_type] = p.enabled;
          if (p.channel === 'sms') text[p.event_type] = p.enabled;
        }
        setEmailEnabled(email);
        setSmsEnabled(text);
        if (d.sms) setSms(d.sms);
      })
      .catch(() => { if (alive) setError('Could not load your notification settings.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const setChannelState = (channel: NotificationChannel, event: string, value: boolean) => {
    const setter = channel === 'sms' ? setSmsEnabled : setEmailEnabled;
    setter(prev => ({ ...prev, [event]: value }));
  };

  const toggle = async (event: NotificationEventType, channel: NotificationChannel) => {
    const current = channel === 'sms' ? smsEnabled : emailEnabled;
    const next = !current[event];
    const key = `${event}:${channel}`;
    setChannelState(channel, event, next); // optimistic
    setSaving(key);
    setError('');
    try {
      const res = await fetch('/api/team/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: event, channel, enabled: next }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      setChannelState(channel, event, !next); // rollback
      setError('Could not save that change. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-lg font-semibold text-white/90">Notifications</h1>
          <p className="mt-1 text-sm text-white/45">
            Choose how Soullab reaches you. The in-app badge always stays on, so you
            never miss anything inside Co-lab.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#16162a] divide-y divide-white/5">
            {NOTIFICATION_EVENT_TYPES.map(event => {
              const label = EVENT_LABELS[event];
              const emailOn = emailEnabled[event] ?? false;
              const smsOn = smsEnabled[event] ?? false;
              return (
                <div key={event} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white/85">{label.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{label.detail}</p>
                  </div>
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <ToggleGroup
                      channelLabel="Email"
                      on={emailOn}
                      disabled={saving === `${event}:email`}
                      onClick={() => toggle(event, 'email')}
                    />
                    {sms.available && (
                      <ToggleGroup
                        channelLabel="SMS"
                        on={smsOn}
                        // Can't enable SMS without a verified number to send to.
                        disabled={!sms.phoneVerified || saving === `${event}:sms`}
                        onClick={() => toggle(event, 'sms')}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        {sms.available ? (
          <PhoneSetup
            status={sms}
            onChange={next => setSms(next)}
            onRemoved={() => setSmsEnabled({})}
          />
        ) : (
          <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
            In-app badge is always on. Text / SMS notifications are coming later.
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleGroup({
  channelLabel,
  on,
  onClick,
  disabled,
}: {
  channelLabel: string;
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-white/30">{channelLabel}</span>
      <Switch on={on} disabled={disabled} onClick={onClick} />
    </div>
  );
}

// Phone capture + Twilio Verify OTP flow. Only mounted when SMS is configured.
function PhoneSetup({
  status,
  onChange,
  onRemoved,
}: {
  status: SmsStatus;
  onChange: (next: SmsStatus) => void;
  onRemoved: () => void;
}) {
  const [step, setStep] = useState<'enter' | 'code'>('enter');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (status.phoneVerified) {
    const remove = async () => {
      setBusy(true);
      setErr('');
      try {
        const res = await fetch('/api/members/phone', { method: 'DELETE' });
        if (!res.ok) throw new Error();
        onRemoved();
        onChange({ ...status, phoneVerified: false, phoneMasked: null });
        setStep('enter');
        setPhone('');
      } catch {
        setErr('Could not remove your number. Please try again.');
      } finally {
        setBusy(false);
      }
    };
    return (
      <div className="mt-6 flex items-center justify-between gap-3 text-xs text-white/40">
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
          Texts go to {status.phoneMasked ?? 'your verified number'}.
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="text-white/40 underline hover:text-white/70 disabled:opacity-50"
        >
          Remove
        </button>
        {err && <span className="text-red-400">{err}</span>}
      </div>
    );
  }

  const sendCode = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/members/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', phone }),
      });
      if (!res.ok) throw new Error();
      setStep('code');
    } catch {
      setErr('Could not send a code to that number. Check it and try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/members/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.verified) throw new Error();
      onChange({ ...status, phoneVerified: true, phoneMasked: data.masked ?? null });
    } catch {
      setErr('That code was not valid. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-white/8 bg-[#16162a] px-5 py-4">
      <p className="text-sm text-white/80">Get a text for these</p>
      <p className="text-xs text-white/40 mt-0.5">
        Add a phone number to turn on SMS alerts. Texts are alerts only — the message stays inside
        Co-lab. Standard rates may apply; reply STOP to opt out.
      </p>

      {step === 'enter' ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 (617) 555-0123"
            className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-amber-500/60"
          />
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || phone.trim().length < 7}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Send code
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="6-digit code"
            className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-amber-500/60"
          />
          <button
            type="button"
            onClick={verify}
            disabled={busy || code.trim().length < 4}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={() => { setStep('enter'); setCode(''); setErr(''); }}
            disabled={busy}
            className="text-xs text-white/40 underline hover:text-white/70 disabled:opacity-50"
          >
            Change
          </button>
        </div>
      )}

      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
    </div>
  );
}

function Switch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        on ? 'bg-amber-500' : 'bg-white/15'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

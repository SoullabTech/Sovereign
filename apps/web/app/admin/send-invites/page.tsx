'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';

interface SendResult {
  success: boolean;
  name: string;
  email: string;
  messageId?: string;
  error?: string;
}

export default function SendInvites() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [csvText, setCsvText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [batchResults, setBatchResults] = useState<SendResult[]>([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  const sendSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          name,
          email,
          messageId: data.messageId,
        });
        setName('');
        setEmail('');
      } else {
        setResult({
          success: false,
          name,
          email,
          error: data.error || 'Failed to send',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        name,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSending(false);
    }
  };

  const sendBatchInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setBatchResults([]);

    const lines = csvText.trim().split('\n').filter(line => line.trim());
    const results: SendResult[] = [];

    for (const line of lines) {
      const [batchName, batchEmail] = line.split(',').map(s => s.trim());

      if (!batchName || !batchEmail) continue;

      try {
        const response = await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: batchName, email: batchEmail }),
        });

        const data = await response.json();

        results.push({
          success: response.ok,
          name: batchName,
          email: batchEmail,
          messageId: data.messageId,
          error: response.ok ? undefined : data.error,
        });

        setBatchResults([...results]);

        // Wait 2 seconds between sends for deliverability
        if (lines.indexOf(line) < lines.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        results.push({
          success: false,
          name: batchName,
          email: batchEmail,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        setBatchResults([...results]);
      }
    }

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[#FFD700] mb-2 flex items-center gap-3">
          <Mail className="w-8 h-8" />
          Send Beta Invitations
        </h1>
        <p className="text-gray-400">
          Send beautiful Sacred Mirror beta invitations via Resend
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="inline-flex rounded-lg bg-gray-800 p-1">
          <button
            onClick={() => setMode('single')}
            className={`px-6 py-2 rounded-md transition-colors ${
              mode === 'single'
                ? 'bg-[#FFD700] text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Single Invite
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-6 py-2 rounded-md transition-colors ${
              mode === 'batch'
                ? 'bg-[#FFD700] text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Batch Send (CSV)
          </button>
        </div>
      </div>

      {/* Single Invite Form */}
      {mode === 'single' && (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendSingleInvite} className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kelly"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-[#FFD700] text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kelly@example.com"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-[#FFD700] text-white"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#FFD700] text-black font-semibold py-3 rounded-lg hover:bg-[#e5c100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invitation
                </>
              )}
            </button>
          </form>

          {/* Single Result */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-red-900/30 border-red-700 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {result.success
                    ? `✅ Invitation sent to ${result.name} at ${result.email}`
                    : `❌ Failed to send to ${result.email}`}
                </span>
              </div>
              {result.error && (
                <p className="mt-2 text-sm ml-7">{result.error}</p>
              )}
              {result.messageId && (
                <p className="mt-2 text-sm ml-7 text-gray-400">
                  Message ID: {result.messageId}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Batch Invite Form */}
      {mode === 'batch' && (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendBatchInvites} className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                CSV Format (Name, Email)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Kelly, kelly@example.com&#10;Sarah, sarah@example.com&#10;Michael, michael@example.com"
                rows={10}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-[#FFD700] text-white font-mono text-sm"
              />
              <p className="mt-2 text-xs text-gray-400">
                One per line. Format: Name, Email
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#FFD700] text-black font-semibold py-3 rounded-lg hover:bg-[#e5c100] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending {batchResults.length}/{csvText.trim().split('\n').filter(l => l.trim()).length}...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Send All Invitations
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-400 text-center">
              Sends 1 every 2 seconds for better deliverability
            </p>
          </form>

          {/* Batch Results */}
          {batchResults.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-[#FFD700]">
                Results ({batchResults.length})
              </h2>
              <div className="space-y-2">
                {batchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-900/20 border-green-700/50'
                        : 'bg-red-900/20 border-red-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm">
                        {result.name} — {result.email}
                      </span>
                    </div>
                    {result.error && (
                      <p className="mt-1 text-xs text-red-300 ml-6">
                        {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="max-w-4xl mx-auto mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="font-semibold text-[#FFD700] mb-3">📧 Email Details</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>From:</strong> Kelly @ Soullab &lt;kelly@soullab.life&gt;</p>
          <p><strong>Subject:</strong> ✨ Your MAIA Beta Invitation</p>
          <p><strong>Template:</strong> Beautiful dark-amber HTML with Spiralogic Diamond</p>
          <p><strong>CTA:</strong> Links to https://soullab.life/beta-entry</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            💡 <strong>Tip:</strong> Send to yourself first to test before batch sending
          </p>
        </div>
      </div>
    </div>
  );
}
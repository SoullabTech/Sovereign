'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Test Interface for Ganesha Autonomous Email System
 * ADD-friendly email management testing
 */

export default function TestGaneshaEmail() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailContent, setEmailContent] = useState<string>('');

  const testEmailSend = async () => {
    setLoading(true);
    setLastAction('Sending consciousness revolution email...');

    try {
      const response = await fetch('/api/ganesha/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: 'consciousness-revolution',
          recipients: ['soullab1@gmail.com']
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const previewEmail = async () => {
    setLoading(true);
    setLastAction('Previewing consciousness revolution email...');

    try {
      const response = await fetch('/api/ganesha/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: 'consciousness-revolution',
          recipients: 'beta-testers',
          action: 'preview'
        })
      });

      const data = await response.json();
      setResult(data);

      // If successful and we have template content, show the popup
      if (data.success && data.template?.htmlContent) {
        setEmailContent(data.template.htmlContent);
        setShowEmailPopup(true);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceInfo = async () => {
    setLoading(true);
    setLastAction('Getting Ganesha email service info...');

    try {
      const response = await fetch('/api/ganesha/send-email');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🧠 GAIA Email Test Center
          </h1>
          <p className="text-emerald-600 text-lg mb-2 font-medium">
            Ganesha Attention Intelligence Assistant
          </p>
          <p className="text-slate-600 text-sm">
            Test consciousness revolution announcement with your 47 pioneers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getServiceInfo}
            disabled={loading}
            className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">
              Service Info
            </h3>
            <p className="text-xs text-slate-600">
              Check 47 pioneers
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={previewEmail}
            disabled={loading}
            className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">👁️</div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">
              Preview Email
            </h3>
            <p className="text-xs text-slate-600">
              View template
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testEmailSend}
            disabled={loading}
            className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">
              Send Test
            </h3>
            <p className="text-xs text-slate-600">
              Live email test
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('/api/ganesha/template-link', '_blank')}
            disabled={loading}
            className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">
              Full Template
            </h3>
            <p className="text-xs text-slate-600">
              View complete
            </p>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
              <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="text-emerald-700 dark:text-emerald-300">{lastAction}</span>
            </div>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Ganesha Response:
            </h3>
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {result.success && result.message && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                  {result.message}
                </p>
              </div>
            )}

            {!result.success && result.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  Error: {result.error}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/20">
          <h3 className="text-xl font-semibold text-emerald-100 mb-4">
            📈 GAIA Contact Stats
          </h3>
          <p className="text-emerald-300 text-sm mb-4">
            Ganesha Attention Intelligence Assistant
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-emerald-950/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-300">47</div>
              <div className="text-emerald-400 text-sm">Total Pioneers</div>
            </div>
            <div className="bg-emerald-950/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-300">100%</div>
              <div className="text-emerald-400 text-sm">Active Status</div>
            </div>
            <div className="bg-emerald-950/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-300">47</div>
              <div className="text-emerald-400 text-sm">Newsletter Subs</div>
            </div>
            <div className="bg-emerald-950/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-300">✨</div>
              <div className="text-emerald-400 text-sm">GAIA Ready</div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/20">
          <h3 className="text-lg font-semibold mb-3 text-emerald-100">
            🎯 Future GAIA Commands (ADD-Friendly)
          </h3>
          <p className="text-emerald-400 text-xs mb-3">
            Ganesha Attention Intelligence Assistant Voice Commands
          </p>
          <div className="space-y-2 text-emerald-300">
            <p>• "GAIA, send the consciousness revolution email to all pioneers"</p>
            <p>• "GAIA, preview the consciousness revolution email"</p>
            <p>• "GAIA, show me available email templates"</p>
            <p>• "GAIA, send this email tomorrow morning"</p>
          </div>
        </div>
      </div>

      {/* Email Preview Popup */}
      {showEmailPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEmailPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  🧠 Consciousness Revolution Email Preview
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Preview of email being sent to 47 consciousness pioneers
                </p>
              </div>
              <button
                onClick={() => setShowEmailPopup(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Email Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: emailContent }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                This is a preview - no emails have been sent
              </div>
              <button
                onClick={() => setShowEmailPopup(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
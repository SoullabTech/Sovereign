'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Smartphone,
  ArrowLeft,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import { Capacitor } from '@capacitor/core';

interface ImportContact {
  id?: string;
  resourceName?: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  photoUrl?: string | null;
  organization?: string | null;
  alreadyExists?: boolean;
  selected?: boolean;
}

type ImportSource = 'gmail' | 'phone' | null;
type ImportState = 'idle' | 'loading' | 'preview' | 'importing' | 'done' | 'error';

export default function ClientImportPage() {
  const [source, setSource] = useState<ImportSource>(null);
  const [state, setState] = useState<ImportState>('idle');
  const [contacts, setContacts] = useState<ImportContact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Fetch Gmail contacts
  const fetchGmailContacts = useCallback(async () => {
    const memberId = getLocalMemberId();
    // Allow proceeding without memberId - server will look it up from practitioner

    setState('loading');
    setError(null);

    try {
      const url = memberId
        ? `/api/studio/clients/import/gmail?userId=${memberId}`
        : `/api/studio/clients/import/gmail`;
      const response = await apiFetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (data.needsAuth) {
          setError('Please connect your Google account in Settings first');
        } else {
          setError(data.error || 'Failed to fetch contacts');
        }
        setState('error');
        return;
      }

      setContacts(
        data.contacts.map((c: ImportContact) => ({
          ...c,
          selected: !c.alreadyExists,
        }))
      );
      setState('preview');
    } catch (err) {
      console.error('Gmail fetch error:', err);
      setError('Failed to fetch Gmail contacts');
      setState('error');
    }
  }, []);

  // Fetch phone contacts (native only)
  const fetchPhoneContacts = useCallback(async () => {
    if (!isNative) {
      setError('Phone contacts are only available in the mobile app');
      setState('error');
      return;
    }

    setState('loading');
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { DeviceContactsService } = await import('@/lib/contacts/DeviceContactsService');

      const available = await DeviceContactsService.isAvailable();
      if (!available) {
        setError('Contacts access not available on this device');
        setState('error');
        return;
      }

      const deviceContacts = await DeviceContactsService.fetchContacts();
      setContacts(
        deviceContacts.map((c) => ({
          ...c,
          selected: true,
        }))
      );
      setState('preview');
    } catch (err) {
      console.error('Phone contacts error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to access phone contacts'
      );
      setState('error');
    }
  }, [isNative]);

  // Handle source selection
  const handleSourceSelect = useCallback(
    (selectedSource: ImportSource) => {
      setSource(selectedSource);
      if (selectedSource === 'gmail') {
        fetchGmailContacts();
      } else if (selectedSource === 'phone') {
        fetchPhoneContacts();
      }
    },
    [fetchGmailContacts, fetchPhoneContacts]
  );

  // Toggle contact selection
  const toggleContact = (index: number) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  // Select/deselect all
  const toggleAll = () => {
    const allSelected = contacts.every((c) => c.selected || c.alreadyExists);
    setContacts((prev) =>
      prev.map((c) => (c.alreadyExists ? c : { ...c, selected: !allSelected }))
    );
  };

  // Import selected contacts
  const handleImport = async () => {
    const selectedContacts = contacts.filter((c) => c.selected && !c.alreadyExists);
    if (selectedContacts.length === 0) {
      setError('No contacts selected');
      return;
    }

    setState('importing');
    setError(null);

    try {
      const endpoint =
        source === 'gmail'
          ? '/api/studio/clients/import/gmail'
          : '/api/studio/clients/import/phone';

      const memberId = getLocalMemberId();

      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: selectedContacts,
          userId: memberId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult({
        imported: data.imported,
        skipped: data.skipped,
      });
      setState('done');
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
      setState('error');
    }
  };

  // Reset and go back
  const handleReset = () => {
    setSource(null);
    setState('idle');
    setContacts([]);
    setError(null);
    setImportResult(null);
  };

  const selectedCount = contacts.filter((c) => c.selected && !c.alreadyExists).length;
  const existingCount = contacts.filter((c) => c.alreadyExists).length;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/studio/clients"
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Import Clients
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {state === 'idle' && 'Choose a source to import contacts'}
            {state === 'loading' && 'Fetching contacts...'}
            {state === 'preview' && `${contacts.length} contacts found`}
            {state === 'importing' && 'Importing...'}
            {state === 'done' && 'Import complete'}
            {state === 'error' && 'Something went wrong'}
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && state !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400">{error}</span>
          <button
            onClick={handleReset}
            className="ml-auto text-sm text-red-400 hover:text-red-300"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* Source Selection */}
      {state === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <button
            onClick={() => handleSourceSelect('gmail')}
            className="p-6 bg-[#1e1e38] border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Gmail Contacts</h3>
            </div>
            <p className="text-sm text-slate-400">
              Import contacts from your connected Google account
            </p>
          </button>

          <button
            onClick={() => handleSourceSelect('phone')}
            disabled={!isNative}
            className={`p-6 bg-[#1e1e38] border border-slate-800/50 rounded-xl transition-all text-left group ${
              isNative
                ? 'hover:border-slate-700/50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-teal-500/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Phone Contacts</h3>
            </div>
            <p className="text-sm text-slate-400">
              {isNative
                ? 'Import contacts from your device'
                : 'Only available in the mobile app'}
            </p>
          </button>
        </div>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
          <p className="text-slate-400">Fetching contacts...</p>
        </div>
      )}

      {/* Contact Preview */}
      {state === 'preview' && (
        <div>
          {/* Selection header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAll}
                className="text-sm text-amber-400 hover:text-amber-300"
              >
                {contacts.every((c) => c.selected || c.alreadyExists)
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
              {existingCount > 0 && (
                <span className="text-sm text-slate-500">
                  {existingCount} already in your clients
                </span>
              )}
            </div>
            <span className="text-sm text-slate-400">
              {selectedCount} selected
            </span>
          </div>

          {/* Contact list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-6">
            <AnimatePresence>
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.resourceName || contact.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 bg-[#1e1e38] border rounded-lg flex items-center gap-4 ${
                    contact.alreadyExists
                      ? 'border-slate-800/30 opacity-50'
                      : contact.selected
                      ? 'border-amber-500/50'
                      : 'border-slate-800/50'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => !contact.alreadyExists && toggleContact(index)}
                    disabled={contact.alreadyExists}
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                      contact.alreadyExists
                        ? 'bg-slate-700 cursor-not-allowed'
                        : contact.selected
                        ? 'bg-amber-500'
                        : 'border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {(contact.selected || contact.alreadyExists) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {/* Contact info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {contact.name || 'Unknown'}
                      </span>
                      {contact.alreadyExists && (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          Already exists
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                      {contact.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Import button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedCount > 0
                  ? 'bg-amber-500 text-white hover:bg-amber-400'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Users className="w-4 h-4" />
              Import {selectedCount} Contact{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Importing State */}
      {state === 'importing' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
          <p className="text-slate-400">Importing contacts...</p>
        </div>
      )}

      {/* Done State */}
      {state === 'done' && importResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center py-12"
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Import Complete
          </h2>
          <p className="text-slate-400 mb-6">
            Successfully imported {importResult.imported} client
            {importResult.imported !== 1 ? 's' : ''}.
            {importResult.skipped > 0 && (
              <span className="block text-sm mt-1">
                {importResult.skipped} skipped (duplicates or missing info)
              </span>
            )}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Import More
            </button>
            <Link
              href="/studio/clients"
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors"
            >
              View Clients
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

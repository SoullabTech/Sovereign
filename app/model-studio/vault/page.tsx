'use client';

/**
 * MODEL STUDIO - Vault Page
 *
 * Demo secure document storage
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Search,
  Upload,
  FolderOpen,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Plus,
  Clock,
  Shield,
  Filter,
} from 'lucide-react';

const demoFolders = [
  { id: '1', name: 'Client Intake Forms', count: 12, icon: FileText, color: 'amber' },
  { id: '2', name: 'Treatment Plans', count: 8, icon: FileText, color: 'blue' },
  { id: '3', name: 'Session Notes', count: 45, icon: FileText, color: 'emerald' },
  { id: '4', name: 'Assessment Results', count: 6, icon: FileText, color: 'violet' },
  { id: '5', name: 'Insurance Documents', count: 15, icon: File, color: 'pink' },
  { id: '6', name: 'Certificates & Licenses', count: 4, icon: Shield, color: 'slate' },
];

const demoFiles = [
  {
    id: '1',
    name: 'Sarah_Mitchell_Intake.pdf',
    folder: 'Client Intake Forms',
    size: '245 KB',
    modified: '2 days ago',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'James_Roberts_Treatment_Plan.docx',
    folder: 'Treatment Plans',
    size: '128 KB',
    modified: '1 week ago',
    type: 'doc',
  },
  {
    id: '3',
    name: 'Emily_Chen_Session_Notes_Feb.pdf',
    folder: 'Session Notes',
    size: '89 KB',
    modified: '3 days ago',
    type: 'pdf',
  },
  {
    id: '4',
    name: 'PHQ9_Results_Batch.xlsx',
    folder: 'Assessment Results',
    size: '56 KB',
    modified: '1 week ago',
    type: 'excel',
  },
  {
    id: '5',
    name: 'Insurance_EOB_January.pdf',
    folder: 'Insurance Documents',
    size: '312 KB',
    modified: '2 weeks ago',
    type: 'pdf',
  },
  {
    id: '6',
    name: 'LCSW_License_2024.pdf',
    folder: 'Certificates & Licenses',
    size: '1.2 MB',
    modified: '1 month ago',
    type: 'pdf',
  },
];

const colorClasses = {
  amber: 'bg-amber-500/20 text-amber-400',
  blue: 'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  violet: 'bg-violet-500/20 text-violet-400',
  pink: 'bg-pink-500/20 text-pink-400',
  slate: 'bg-slate-500/20 text-slate-400',
};

const typeIcons = {
  pdf: FileText,
  doc: FileText,
  excel: File,
  image: Image,
};

export default function ModelVaultPage() {
  const [view, setView] = useState<'folders' | 'files'>('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const filteredFiles = demoFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || file.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const totalFiles = demoFiles.length;
  const totalSize = '2.1 GB';

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Vault</h1>
            <p className="text-slate-500 mt-1">Secure document storage · {totalFiles} files · {totalSize}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div>
          <span className="text-sm text-emerald-400 font-medium">End-to-End Encrypted</span>
          <span className="text-sm text-emerald-400/70 ml-2">All documents are encrypted at rest and in transit</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e38] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex bg-[#1e1e38] border border-slate-700 rounded-lg p-1">
          <button
            onClick={() => { setView('folders'); setSelectedFolder(null); }}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              view === 'folders' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'
            }`}
          >
            Folders
          </button>
          <button
            onClick={() => setView('files')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              view === 'files' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'
            }`}
          >
            All Files
          </button>
        </div>
      </div>

      {/* Folders View */}
      {view === 'folders' && !selectedFolder && (
        <div className="grid grid-cols-3 gap-4">
          {demoFolders.map((folder) => {
            const Icon = folder.icon;
            return (
              <motion.button
                key={folder.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setSelectedFolder(folder.name); setView('files'); }}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-xl ${colorClasses[folder.color as keyof typeof colorClasses]}`}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{folder.name}</h3>
                    <p className="text-sm text-slate-500">{folder.count} files</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Files View */}
      {(view === 'files' || selectedFolder) && (
        <>
          {selectedFolder && (
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => { setSelectedFolder(null); setView('folders'); }}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                ← Back to Folders
              </button>
              <span className="text-slate-500">/</span>
              <span className="text-white">{selectedFolder}</span>
            </div>
          )}

          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-800/50 text-sm text-slate-500">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Folder</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Modified</div>
            </div>

            {/* Files */}
            {filteredFiles.map((file) => {
              const TypeIcon = typeIcons[file.type as keyof typeof typeIcons] || File;
              return (
                <motion.div
                  key={file.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-800/30 items-center group"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <TypeIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-white truncate">{file.name}</span>
                  </div>
                  <div className="col-span-3 text-slate-400 text-sm">{file.folder}</div>
                  <div className="col-span-2 text-slate-400 text-sm">{file.size}</div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{file.modified}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button className="p-1 text-slate-400 hover:text-white rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-white rounded transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

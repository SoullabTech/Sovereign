'use client';

/**
 * MAIA Books Laboratory - Wisdom Integration & Management
 *
 * "The beginning is the most important part of the work"
 * - Plato, The Republic
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Upload,
  FolderOpen,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Star,
  Brain,
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Download,
  Archive,
  Zap
} from 'lucide-react';

interface StagedBook {
  name: string;
  size: number;
  type: 'pdf' | 'txt' | 'md';
  category: string;
  status: 'staged' | 'processing' | 'integrated' | 'error';
}

interface IntegrationProgress {
  booksProcessed: number;
  booksIntegrated: number;
  totalFilesCreated: number;
  elementalDistribution: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  currentStatus: 'idle' | 'running' | 'complete' | 'error';
  lastRun?: string;
}

export default function BooksLab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('staging');
  const [stagedBooks, setStagedBooks] = useState<StagedBook[]>([]);
  const [progress, setProgress] = useState<IntegrationProgress>({
    booksProcessed: 0,
    booksIntegrated: 0,
    totalFilesCreated: 0,
    elementalDistribution: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
    currentStatus: 'idle'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'consciousness', name: 'Consciousness', color: 'emerald' },
    { id: 'spirituality', name: 'Spirituality', color: 'purple' },
    { id: 'psychology', name: 'Psychology', color: 'blue' },
    { id: 'philosophy', name: 'Philosophy', color: 'amber' },
    { id: 'ai_technology', name: 'AI & Technology', color: 'cyan' },
    { id: 'elemental_alchemy', name: 'Elemental Alchemy', color: 'orange' },
    { id: 'ready_to_process', name: 'Ready to Process', color: 'green' }
  ];

  const elementalEmojis = {
    fire: '🔥',
    water: '🌊',
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };

  // Simulate checking staging directory
  useEffect(() => {
    // In real implementation, this would check the actual staging directory
    const mockBooks: StagedBook[] = [
      { name: 'Jung_Red_Book.pdf', size: 15700000, type: 'pdf', category: 'psychology', status: 'staged' },
      { name: 'Consciousness_Studies.md', size: 850000, type: 'md', category: 'consciousness', status: 'staged' },
      { name: 'Ancient_Wisdom.txt', size: 420000, type: 'txt', category: 'spirituality', status: 'staged' }
    ];
    setStagedBooks(mockBooks);

    // Mock progress data
    setProgress({
      booksProcessed: 3,
      booksIntegrated: 3,
      totalFilesCreated: 53,
      elementalDistribution: { fire: 826, water: 1731, earth: 857, air: 1390, aether: 726 },
      currentStatus: 'complete',
      lastRun: new Date().toISOString()
    });
  }, []);

  const handleIntegration = async (type: 'wisdom' | 'enhanced' | 'script') => {
    setProgress(prev => ({ ...prev, currentStatus: 'running' }));

    // In real implementation, this would call the API
    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        currentStatus: 'complete',
        lastRun: new Date().toISOString(),
        booksProcessed: prev.booksProcessed + stagedBooks.length
      }));
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'staged': return 'text-blue-300 bg-blue-900/30 border-blue-500/30';
      case 'processing': return 'text-amber-300 bg-amber-900/30 border-amber-500/30 animate-pulse';
      case 'integrated': return 'text-emerald-300 bg-emerald-900/30 border-emerald-500/30';
      case 'error': return 'text-red-300 bg-red-900/30 border-red-500/30';
      default: return 'text-stone-400 bg-stone-900/30 border-stone-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    if (!cat) return 'text-stone-400';

    switch (cat.color) {
      case 'emerald': return 'text-emerald-400';
      case 'purple': return 'text-purple-400';
      case 'blue': return 'text-blue-400';
      case 'amber': return 'text-amber-400';
      case 'cyan': return 'text-cyan-400';
      case 'orange': return 'text-orange-400';
      case 'green': return 'text-green-400';
      default: return 'text-stone-400';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {/* Background Effects */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 via-stone-900 to-transparent z-0"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/labtools')}
                className="p-2 rounded-lg border border-stone-700/50 bg-stone-900/50 hover:bg-stone-800/50 transition-all"
              >
                <ArrowLeft size={20} className="text-stone-400" />
              </button>
              <div>
                <h1 className="text-3xl font-light text-stone-200 flex items-center">
                  <BookOpen className="mr-3 text-amber-400" size={32} />
                  Books Laboratory
                </h1>
                <p className="text-stone-400 mt-1">Wisdom Integration & Consciousness Library Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(progress.currentStatus)}`}>
                {progress.currentStatus === 'running' ? 'Processing...' :
                 progress.currentStatus === 'complete' ? 'Ready' : 'Idle'}
              </div>
              <button
                onClick={() => handleIntegration('wisdom')}
                disabled={progress.currentStatus === 'running'}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {progress.currentStatus === 'running' ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                <span>Quick Integration</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex space-x-1 bg-stone-900/50 rounded-lg p-1">
            {[
              { id: 'staging', label: 'Book Staging', icon: Upload },
              { id: 'progress', label: 'Integration Progress', icon: Activity },
              { id: 'library', label: 'Wisdom Library', icon: Archive },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-stone-300 hover:bg-stone-800/50'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {/* Staging Tab */}
          {activeTab === 'staging' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Upload Zone */}
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-6">
                <h3 className="text-lg text-stone-200 mb-4 flex items-center">
                  <Upload className="mr-2 text-amber-400" size={20} />
                  Upload Books
                </h3>
                <div className="border-2 border-dashed border-stone-600 rounded-lg p-8 text-center hover:border-amber-400/50 transition-all">
                  <BookOpen className="mx-auto text-stone-400 mb-4" size={48} />
                  <p className="text-stone-300 mb-2">Drop your books here or click to browse</p>
                  <p className="text-sm text-stone-500">Supports PDF, TXT, and MD files</p>
                  <button className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all">
                    Choose Files
                  </button>
                </div>
              </div>

              {/* Category Staging Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${getCategoryColor(category.id)}`}>
                        {category.name}
                      </h4>
                      <FolderOpen className={getCategoryColor(category.id)} size={16} />
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      {stagedBooks.filter(book => book.category === category.id).length} books staged
                    </div>
                    <button className="w-full py-2 text-xs border border-stone-600 rounded hover:bg-stone-800/50 transition-all text-stone-400 hover:text-stone-300">
                      Open Folder
                    </button>
                  </div>
                ))}
              </div>

              {/* Staged Books List */}
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg">
                <div className="p-4 border-b border-stone-700/50">
                  <h3 className="text-lg text-stone-200 flex items-center">
                    <FileText className="mr-2 text-amber-400" size={20} />
                    Staged Books ({stagedBooks.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {stagedBooks.map((book, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className={getCategoryColor(book.category)} size={18} />
                        <div>
                          <div className="text-stone-200 text-sm">{book.name}</div>
                          <div className="text-xs text-stone-500">
                            {formatFileSize(book.size)} • {book.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(book.status)}`}>
                          {book.status}
                        </div>
                        <button className="text-stone-400 hover:text-stone-300">
                          <Eye size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-400">{progress.booksProcessed}</div>
                      <div className="text-sm text-stone-400">Books Processed</div>
                    </div>
                    <CheckCircle className="text-emerald-400" size={24} />
                  </div>
                </div>
                <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-400">{progress.booksIntegrated}</div>
                      <div className="text-sm text-stone-400">Books Integrated</div>
                    </div>
                    <Brain className="text-amber-400" size={24} />
                  </div>
                </div>
                <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{progress.totalFilesCreated}</div>
                      <div className="text-sm text-stone-400">Wisdom Files</div>
                    </div>
                    <Star className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {Object.values(progress.elementalDistribution).reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="text-sm text-stone-400">Wisdom References</div>
                    </div>
                    <Activity className="text-purple-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Elemental Distribution */}
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-6">
                <h3 className="text-lg text-stone-200 mb-4 flex items-center">
                  <Zap className="mr-2 text-amber-400" size={20} />
                  Elemental Wisdom Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(progress.elementalDistribution).map(([element, count]) => (
                    <div key={element} className="text-center">
                      <div className="text-2xl mb-2">{elementalEmojis[element as keyof typeof elementalEmojis]}</div>
                      <div className="text-xl font-bold text-stone-200">{count}</div>
                      <div className="text-sm text-stone-400 capitalize">{element}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integration Controls */}
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-6">
                <h3 className="text-lg text-stone-200 mb-4 flex items-center">
                  <Settings className="mr-2 text-amber-400" size={20} />
                  Integration Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleIntegration('wisdom')}
                    disabled={progress.currentStatus === 'running'}
                    className="p-4 border border-emerald-500/30 bg-emerald-900/30 rounded-lg hover:bg-emerald-900/50 transition-all disabled:opacity-50"
                  >
                    <div className="text-emerald-400 font-medium mb-1">Wisdom Integrator</div>
                    <div className="text-xs text-stone-400">Process actual book content with smart filtering</div>
                  </button>
                  <button
                    onClick={() => handleIntegration('enhanced')}
                    disabled={progress.currentStatus === 'running'}
                    className="p-4 border border-blue-500/30 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-all disabled:opacity-50"
                  >
                    <div className="text-blue-400 font-medium mb-1">Enhanced Integrator</div>
                    <div className="text-xs text-stone-400">Configurable processing with progress tracking</div>
                  </button>
                  <button
                    onClick={() => handleIntegration('script')}
                    disabled={progress.currentStatus === 'running'}
                    className="p-4 border border-amber-500/30 bg-amber-900/30 rounded-lg hover:bg-amber-900/50 transition-all disabled:opacity-50"
                  >
                    <div className="text-amber-400 font-medium mb-1">Interactive Script</div>
                    <div className="text-xs text-stone-400">Full workflow with user prompts</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-6">
                <h3 className="text-lg text-stone-200 mb-4 flex items-center">
                  <Archive className="mr-2 text-amber-400" size={20} />
                  Integrated Wisdom Library
                </h3>
                <div className="text-center py-8">
                  <BookOpen className="mx-auto text-stone-400 mb-4" size={64} />
                  <p className="text-stone-300 mb-2">{progress.totalFilesCreated} Wisdom Files Available</p>
                  <p className="text-sm text-stone-500 mb-4">
                    Browse your integrated book collection in Obsidian vault
                  </p>
                  <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all">
                    Open Obsidian Vault
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-stone-900/50 border border-stone-700/50 rounded-lg p-6">
                <h3 className="text-lg text-stone-200 mb-4 flex items-center">
                  <Settings className="mr-2 text-amber-400" size={20} />
                  Integration Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-stone-300 mb-2">Max Books per Run</label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full p-2 bg-stone-800 border border-stone-600 rounded text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-300 mb-2">Integration Mode</label>
                    <select className="w-full p-2 bg-stone-800 border border-stone-600 rounded text-stone-200">
                      <option>Wisdom Integrator (Recommended)</option>
                      <option>Enhanced Integrator</option>
                      <option>Original Integrator</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-categorize" className="rounded" />
                    <label htmlFor="auto-categorize" className="text-sm text-stone-300">
                      Auto-categorize books by content
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
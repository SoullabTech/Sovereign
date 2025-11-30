'use client';

/**
 * MAIA LabTools Downloads - Member Access to Desktop Applications
 * Provides secure downloads for authenticated members
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Monitor,
  Apple,
  Shield,
  Check,
  ExternalLink,
  Heart,
  Brain,
  Zap,
  Globe
} from 'lucide-react';
import Image from 'next/image';

interface DownloadOption {
  id: string;
  name: string;
  description: string;
  version: string;
  size: string;
  platform: 'mac-intel' | 'mac-arm' | 'windows' | 'linux';
  icon: any;
  downloadUrl: string;
  requirements: string[];
  features: string[];
}

const downloadOptions: DownloadOption[] = [
  {
    id: 'companion-mac-arm',
    name: 'MAIA Compact Companion',
    description: 'Tolan-inspired consciousness companion for your desktop',
    version: '1.0.0',
    size: '45 MB',
    platform: 'mac-arm',
    icon: Apple,
    downloadUrl: '/api/downloads/companion/mac-arm',
    requirements: ['macOS 12.0+', 'Apple Silicon (M1/M2)'],
    features: ['Always-accessible interface', 'Voice interaction', 'Consciousness monitoring', 'Global shortcuts']
  },
  {
    id: 'companion-mac-intel',
    name: 'MAIA Compact Companion',
    description: 'Tolan-inspired consciousness companion for your desktop',
    version: '1.0.0',
    size: '48 MB',
    platform: 'mac-intel',
    icon: Monitor,
    downloadUrl: '/api/downloads/companion/mac-intel',
    requirements: ['macOS 11.0+', 'Intel processor'],
    features: ['Always-accessible interface', 'Voice interaction', 'Consciousness monitoring', 'Global shortcuts']
  },
  {
    id: 'labtools-mac-arm',
    name: 'MAIA LabTools + IPP',
    description: 'Complete consciousness monitoring and clinical assessment suite',
    version: '0.1.0',
    size: '120 MB',
    platform: 'mac-arm',
    icon: Brain,
    downloadUrl: '/api/downloads/labtools/mac-arm',
    requirements: ['macOS 12.0+', 'Apple Silicon (M1/M2)', '8GB RAM'],
    features: ['Biometric monitoring', 'EEG visualization', 'IPP clinical tools', 'Guardian protocols']
  },
  {
    id: 'labtools-mac-intel',
    name: 'MAIA LabTools + IPP',
    description: 'Complete consciousness monitoring and clinical assessment suite',
    version: '0.1.0',
    size: '125 MB',
    platform: 'mac-intel',
    icon: Zap,
    downloadUrl: '/api/downloads/labtools/mac-intel',
    requirements: ['macOS 11.0+', 'Intel processor', '8GB RAM'],
    features: ['Biometric monitoring', 'EEG visualization', 'IPP clinical tools', 'Guardian protocols']
  }
];

export default function DownloadsPage() {
  const [selectedDownload, setSelectedDownload] = useState<DownloadOption | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState<string[]>([]);
  const [userPlatform, setUserPlatform] = useState<string>('unknown');

  useEffect(() => {
    // Detect user platform
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('mac')) {
      // Check if Apple Silicon
      const isAppleSilicon = /\b(arm|m1|m2)\b/i.test(userAgent) ||
                           /mac.*arm64/i.test(userAgent);
      setUserPlatform(isAppleSilicon ? 'mac-arm' : 'mac-intel');
    } else if (platform.includes('win')) {
      setUserPlatform('windows');
    } else if (platform.includes('linux')) {
      setUserPlatform('linux');
    }
  }, []);

  const handleDownload = async (option: DownloadOption) => {
    setIsDownloading(option.id);

    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would trigger the actual download
      // window.open(option.downloadUrl, '_blank');

      setDownloadComplete(prev => [...prev, option.id]);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mac-arm':
      case 'mac-intel':
        return Apple;
      case 'windows':
        return Monitor;
      case 'linux':
        return Globe;
      default:
        return Monitor;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'mac-arm':
        return 'macOS (Apple Silicon)';
      case 'mac-intel':
        return 'macOS (Intel)';
      case 'windows':
        return 'Windows';
      case 'linux':
        return 'Linux';
      default:
        return 'Unknown Platform';
    }
  };

  const isRecommended = (option: DownloadOption) => {
    return option.platform === userPlatform;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* MAIA Holoflower */}
            <motion.div
              className="flex justify-center mb-8"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/holoflower-amber.png"
                alt="MAIA"
                width={100}
                height={100}
                className="drop-shadow-lg"
              />
            </motion.div>

            <h1 className="text-5xl font-bold text-white mb-4">
              MAIA Desktop Applications
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Download our consciousness technology directly to your desktop.
              Experience the full power of MAIA with native applications designed
              for deep transformation and clinical practice.
            </p>

            <motion.div
              className="flex items-center justify-center gap-6 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Secure Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span>Member Exclusive</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Consciousness Technology</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Downloads Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {downloadOptions.map((option, index) => {
            const PlatformIcon = getPlatformIcon(option.platform);
            const OptionIcon = option.icon;
            const isDownloadingThis = isDownloading === option.id;
            const isCompleted = downloadComplete.includes(option.id);
            const recommended = isRecommended(option);

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all hover:bg-gray-700/50 ${
                  recommended
                    ? 'border-blue-500/50 ring-1 ring-blue-500/20'
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {recommended && (
                  <div className="absolute -top-3 left-6">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Recommended for your system
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <OptionIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{option.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <PlatformIcon className="w-4 h-4" />
                        <span>{getPlatformName(option.platform)}</span>
                        <span>•</span>
                        <span>v{option.version}</span>
                        <span>•</span>
                        <span>{option.size}</span>
                      </div>
                    </div>
                  </div>

                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-2 bg-green-500/20 rounded-full"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4">{option.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {option.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Download Button */}
                <motion.button
                  onClick={() => handleDownload(option)}
                  disabled={isDownloadingThis || isCompleted}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : recommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  whileHover={!isCompleted ? { scale: 1.02 } : {}}
                  whileTap={!isCompleted ? { scale: 0.98 } : {}}
                >
                  {isDownloadingThis ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Downloading...</span>
                    </>
                  ) : isCompleted ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Installation & Security
          </h3>

          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Installation Instructions:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Download the appropriate version for your platform</li>
                <li>• On macOS: Open the .dmg file and drag to Applications</li>
                <li>• On Windows: Run the installer and follow the setup wizard</li>
                <li>• Launch the app and sign in with your member credentials</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-2">Security & Privacy:</h4>
              <ul className="space-y-2 text-sm">
                <li>• All downloads are digitally signed and secure</li>
                <li>• Apps connect only to official Soullab servers</li>
                <li>• Your data is encrypted and never shared</li>
                <li>• Automatic updates ensure latest security patches</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              Need help? Visit our{' '}
              <a href="/support" className="text-blue-400 hover:text-blue-300 underline">
                support documentation
              </a>{' '}
              or contact our team.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
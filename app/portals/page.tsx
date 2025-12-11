'use client';

import { motion } from 'framer-motion';
import { Building2, Sparkles, ArrowRight, Globe, Shield, Users, BookOpen, Heart, Zap } from 'lucide-react';

export default function PortalsPage() {
  const portals = [
    {
      id: 'research',
      name: 'Research Portal',
      description: 'Academic institutions exploring consciousness through rigorous scientific inquiry',
      location: 'Global Academic',
      icon: BookOpen,
      color: 'from-blue-600 to-blue-800',
      href: '/partner/research',
      features: ['Research Ethics Compliance', 'Data Anonymization', 'Citation Tracking', '7-Year Data Retention']
    },
    {
      id: 'collaborate',
      name: 'Collaboration Hub',
      description: 'Connect with consciousness explorers and build collective wisdom',
      location: 'Global Community',
      icon: Heart,
      color: 'from-emerald-500 to-green-600',
      href: '/partner/collaborate',
      features: ['Community Projects', 'Shared Workspaces', 'Peer Matching', 'Collective Insights']
    },
    {
      id: 'partners',
      name: 'Partnership Portal',
      description: 'Explore consciousness computing integration for your organization',
      location: 'Enterprise',
      icon: Zap,
      color: 'from-purple-500 to-indigo-600',
      href: '/partner/partners',
      features: ['White-labeling', 'Enterprise Integration', 'Custom Deployment', 'Business Analytics']
    },
    {
      id: 'tsai-city',
      name: 'TSAI City Hub',
      description: 'Singapore\'s premier consciousness technology innovation center',
      location: 'Singapore',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      href: '/partner/tsai-city',
      features: ['Singapore Compliance', 'Multilingual Support', 'Enterprise SSO', 'Data Localization']
    }
  ];

  const coreFeatures = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance for sensitive consciousness data'
    },
    {
      icon: Globe,
      title: 'Global Deployment',
      description: 'Multi-region support with local data residency options'
    },
    {
      icon: Users,
      title: 'Community Integration',
      description: 'Connect users to global consciousness computing network'
    },
    {
      icon: Sparkles,
      title: 'Consciousness Computing',
      description: 'Advanced AI collaboration for consciousness exploration'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-amber-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Consciousness Computing Portals
              </h1>
            </div>

            <p className="text-xl text-blue-200 mb-8 max-w-4xl mx-auto">
              Multiple access points for research, collaboration, and partnership in consciousness technology
            </p>

            <p className="text-gray-300 max-w-3xl mx-auto">
              Choose your path into MAIA's consciousness computing platform. Each portal is designed for
              specific communities with tailored onboarding, features, and support.
            </p>
          </motion.div>

          {/* Portal Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16"
          >
            {portals.map((portal, index) => (
              <motion.a
                key={portal.id}
                href={portal.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${portal.color}
                          text-white overflow-hidden group cursor-pointer shadow-2xl`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <portal.icon className="w-8 h-8 mr-3" />
                      <h3 className="text-2xl font-bold">{portal.name}</h3>
                    </div>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                  </div>

                  <p className="text-blue-100 mb-4">{portal.description}</p>

                  <div className="flex items-center text-sm text-blue-200 mb-6">
                    <Globe className="w-4 h-4 mr-2" />
                    {portal.location}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {portal.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-blue-100">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                    {portal.features.length > 2 && (
                      <div className="text-xs text-blue-200 opacity-70">
                        +{portal.features.length - 2} more features
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Enter Portal
                    </span>
                    <span className="text-xs text-blue-200">
                      Begin your consciousness computing journey
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Core Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Core Platform Features
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {coreFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-black/20 backdrop-blur-sm border border-blue-500/20 rounded-xl"
                >
                  <feature.icon className="w-8 h-8 text-amber-400 mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Access Methods */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-black/30 rounded-2xl border border-blue-500/20 p-8 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Multiple Access Methods
            </h3>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Direct Portal Access</h4>
                <p className="text-gray-400 text-sm">
                  Visit partner-specific URLs or use portal links
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Institutional Integration</h4>
                <p className="text-gray-400 text-sm">
                  SSO and custom domain integration
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Community Invitation</h4>
                <p className="text-gray-400 text-sm">
                  Join through existing community members
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center p-8 bg-black/30 rounded-2xl border border-blue-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Ready to explore consciousness computing?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Each portal offers a unique pathway into consciousness technology.
              Choose the one that aligns with your goals and community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/partner/research"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700
                         text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800
                         transition-all transform hover:scale-105"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Research Portal
              </a>
              <a
                href="/partner/collaborate"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600
                         text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700
                         transition-all transform hover:scale-105"
              >
                <Heart className="w-5 h-5 mr-2" />
                Collaboration Hub
              </a>
              <a
                href="/partner/partners"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600
                         text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700
                         transition-all transform hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Partnership Portal
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
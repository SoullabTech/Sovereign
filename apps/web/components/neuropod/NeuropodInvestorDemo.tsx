"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

// Market Opportunity Visualization
function MarketOpportunityDemo() {
  const [selectedMarket, setSelectedMarket] = useState('healthcare');

  const markets = {
    healthcare: { size: '$12B', growth: '15.2%', color: 'bg-red-500' },
    research: { size: '$8B', growth: '12.8%', color: 'bg-blue-500' },
    corporate: { size: '$15B', growth: '18.5%', color: 'bg-green-500' },
    wellness: { size: '$10B', growth: '22.1%', color: 'bg-purple-500' },
    training: { size: '$5B', growth: '14.7%', color: 'bg-amber-500' }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">$50B+ Market Opportunity</h3>
        <p className="text-white/70">Multiple high-growth sectors converging on consciousness technology</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Object.entries(markets).map(([key, market]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedMarket(key)}
            className={`p-3 rounded-lg text-white text-center transition-all ${
              selectedMarket === key ? market.color : 'bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-lg font-bold">{market.size}</div>
            <div className="text-xs">{key}</div>
            <div className="text-xs opacity-80">+{market.growth}</div>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={selectedMarket}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 rounded-xl p-6"
      >
        <h4 className="text-xl font-semibold text-white capitalize mb-3">{selectedMarket} Market</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/60">Market Size</div>
            <div className="text-2xl font-bold text-white">{markets[selectedMarket as keyof typeof markets].size}</div>
          </div>
          <div>
            <div className="text-white/60">Annual Growth</div>
            <div className="text-2xl font-bold text-green-400">+{markets[selectedMarket as keyof typeof markets].growth}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-white/80 text-sm">
            {selectedMarket === 'healthcare' && 'PTSD treatment, anxiety/depression therapy, addiction recovery, clinical meditation training'}
            {selectedMarket === 'research' && 'Neuroscience labs, psychology studies, medical schools, pharmaceutical research'}
            {selectedMarket === 'corporate' && 'Executive training, stress management, leadership development, team consciousness'}
            {selectedMarket === 'wellness' && 'Premium spas, private clients, retreat centers, wellness tourism destinations'}
            {selectedMarket === 'training' && 'Meditation teacher certification, therapy training, coaching programs, spiritual direction'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Technology Architecture Demo
function TechnologyDemo() {
  const [activeSystem, setActiveSystem] = useState('biometric');
  const [isRunning, setIsRunning] = useState(false);

  const systems = {
    biometric: {
      name: 'Biometric Monitoring',
      sensors: ['EEG (16-channel)', 'HRV (1000Hz)', 'GSR', 'Eye Tracking', 'Motion Capture'],
      color: 'text-cyan-400'
    },
    audio: {
      name: 'Spatial Audio System',
      sensors: ['64 Channel Array', 'Delta→Gamma Mapping', 'Binaural Beats', '3D Positioning'],
      color: 'text-purple-400'
    },
    haptic: {
      name: 'Haptic Feedback',
      sensors: ['50+ Transducers', 'Thermal Control', 'Pressure Systems', 'Vibrotactile'],
      color: 'text-green-400'
    },
    visual: {
      name: 'Visual Interface',
      sensors: ['VR/AR Headset', '1000+ LEDs', 'Eye Tracking', 'Consciousness Viz'],
      color: 'text-amber-400'
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Multi-Modal Technology Stack</h3>
        <p className="text-white/70">15+ integrated sensor systems with real-time consciousness feedback</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(systems).map(([key, system]) => (
          <motion.button
            key={key}
            onClick={() => setActiveSystem(key)}
            className={`p-4 rounded-xl bg-white/5 border transition-all ${
              activeSystem === key ? 'border-white/30 bg-white/10' : 'border-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`font-semibold ${system.color} mb-2`}>{system.name}</div>
            <div className="text-xs text-white/60">{system.sensors.length} components</div>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={activeSystem}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-6"
      >
        <h4 className={`text-lg font-semibold mb-4 ${systems[activeSystem as keyof typeof systems].color}`}>
          {systems[activeSystem as keyof typeof systems].name}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {systems[activeSystem as keyof typeof systems].sensors.map((sensor, index) => (
            <motion.div
              key={sensor}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-3 text-sm text-white/80"
            >
              {sensor}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="text-center">
        <motion.button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? 'System Active' : 'Start Demo'}
        </motion.button>
      </div>

      {isRunning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20"
        >
          <div className="text-center text-green-400 font-medium mb-3">🧠 Live System Simulation</div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-white/60">EEG Alpha</div>
              <div className="text-green-400 font-mono">8.2 Hz</div>
            </div>
            <div>
              <div className="text-white/60">Heart Rate</div>
              <div className="text-blue-400 font-mono">72 BPM</div>
            </div>
            <div>
              <div className="text-white/60">Coherence</div>
              <div className="text-purple-400 font-mono">87%</div>
            </div>
            <div>
              <div className="text-white/60">Audio Sync</div>
              <div className="text-amber-400 font-mono">Active</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Financial Projections Demo
function FinancialDemo() {
  const [selectedYear, setSelectedYear] = useState(1);

  const projections = [
    { year: 1, revenue: 2.5, units: 10, services: 0.7 },
    { year: 2, revenue: 8.5, units: 35, services: 2.5 },
    { year: 3, revenue: 22, units: 85, services: 7 },
    { year: 4, revenue: 45, units: 165, services: 15 },
    { year: 5, revenue: 85, units: 280, services: 28 }
  ];

  const currentYear = projections[selectedYear - 1];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">5-Year Revenue Projection</h3>
        <p className="text-white/70">Scaling from $2.5M to $85M+ with premium unit economics</p>
      </div>

      <div className="flex justify-center gap-2">
        {projections.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedYear(index + 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedYear === index + 1
                ? 'bg-green-500/30 text-green-400'
                : 'bg-white/10 text-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            Year {index + 1}
          </motion.button>
        ))}
      </div>

      <motion.div
        key={selectedYear}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl p-6"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">${currentYear.revenue}M</div>
            <div className="text-white/60 text-sm">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{currentYear.units}</div>
            <div className="text-white/60 text-sm">Units Sold</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">${currentYear.services}M</div>
            <div className="text-white/60 text-sm">Service Revenue</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/60 mb-1">Revenue Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white/80">Hardware</span>
                <span className="text-green-400">${(currentYear.revenue - currentYear.services).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Services</span>
                <span className="text-blue-400">${currentYear.services}M</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-white/60 mb-1">Key Metrics</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white/80">Avg Unit Price</span>
                <span className="text-amber-400">${Math.round((currentYear.revenue - currentYear.services) * 1000 / currentYear.units)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Growth Rate</span>
                <span className="text-purple-400">{selectedYear > 1 ? `${Math.round((currentYear.revenue / projections[selectedYear - 2].revenue - 1) * 100)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-center text-white font-medium mb-3">Investment Highlights</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-amber-400 font-medium">65-70% Gross Margins</div>
            <div className="text-white/60">Premium technology positioning</div>
          </div>
          <div>
            <div className="text-green-400 font-medium">$400K-800K LTV</div>
            <div className="text-white/60">Including recurring services</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Competitive Advantage Demo
function CompetitiveDemo() {
  const [selectedAdvantage, setSelectedAdvantage] = useState('audio');

  const advantages = {
    audio: {
      title: 'Revolutionary Audio Architecture',
      description: 'Frequency-body mapping with 64+ channels',
      competitors: 'Muse: 2 channels, HeartMath: No audio',
      advantage: '32x more audio precision'
    },
    sensors: {
      title: 'Comprehensive Sensor Integration',
      description: '15+ sensor types with medical-grade accuracy',
      competitors: 'Most devices: 1-3 sensors',
      advantage: '5x more consciousness data'
    },
    mathematics: {
      title: 'Consciousness Mathematics',
      description: 'QRI-inspired oscillator algorithms',
      competitors: 'No competitor has this capability',
      advantage: 'Unique predictive modeling'
    },
    design: {
      title: 'Sacred Design Philosophy',
      description: 'Biomimetic endoskeleton architecture',
      competitors: 'Consumer devices with plastic shells',
      advantage: 'Transformational environment'
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Competitive Moats</h3>
        <p className="text-white/70">Multiple defensible advantages creating market barriers</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(advantages).map(([key, advantage]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedAdvantage(key)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedAdvantage === key
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                : 'bg-white/5 border border-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="font-semibold text-white mb-1">{advantage.title}</div>
            <div className="text-xs text-white/60">{advantage.description}</div>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={selectedAdvantage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20"
      >
        <h4 className="text-xl font-semibold text-white mb-4">
          {advantages[selectedAdvantage as keyof typeof advantages].title}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-green-400 font-medium mb-2">Our Capability</div>
            <div className="text-white/80 text-sm">
              {advantages[selectedAdvantage as keyof typeof advantages].description}
            </div>
          </div>
          <div>
            <div className="text-red-400 font-medium mb-2">Competitors</div>
            <div className="text-white/80 text-sm">
              {advantages[selectedAdvantage as keyof typeof advantages].competitors}
            </div>
          </div>
          <div>
            <div className="text-amber-400 font-medium mb-2">Advantage</div>
            <div className="text-white/80 text-sm">
              {advantages[selectedAdvantage as keyof typeof advantages].advantage}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function NeuropodInvestorDemo() {
  const [activeSection, setActiveSection] = useState('market');

  const sections: DemoSection[] = [
    {
      id: 'market',
      title: 'Market Opportunity',
      description: '$50B+ addressable market across multiple sectors',
      component: MarketOpportunityDemo
    },
    {
      id: 'technology',
      title: 'Technology Stack',
      description: 'Multi-modal consciousness interface systems',
      component: TechnologyDemo
    },
    {
      id: 'financial',
      title: 'Financial Projections',
      description: '5-year scaling from $2.5M to $85M+ revenue',
      component: FinancialDemo
    },
    {
      id: 'competitive',
      title: 'Competitive Moats',
      description: 'Multiple defensible advantages and IP protection',
      component: CompetitiveDemo
    }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || MarketOpportunityDemo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🌌 Neuropod Consciousness Interface
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/70"
          >
            Revolutionary Technology Investment Opportunity
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-green-400 font-semibold"
          >
            $15M Series A • $50B+ Market • Transformational Technology
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="font-semibold">{section.title}</div>
              <div className="text-xs opacity-80">{section.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10"
        >
          <ActiveComponent />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-green-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Consciousness Technology?</h3>
            <p className="text-white/80 mb-6">
              Join us in creating the most advanced consciousness-technology interface ever conceived
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Technology Demo
              </motion.button>
              <motion.button
                className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                Access Data Room
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
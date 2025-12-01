"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LaunchGate {
  name: string;
  current: number;
  target: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

interface BetaMetrics {
  launchReadiness: number;
  voiceHealth: {
    overall: number;
    recognitionAccuracy: number;
    ttsSuccessRate: number;
  };
  memoryPerformance: {
    overall: number;
    integrationSuccess: number;
  };
  userSatisfaction: {
    averageRating: number;
    feelsAlive: number;
  };
  systemStability: {
    uptime: number;
  };
}

interface LaunchReadinessCardProps {
  metrics?: BetaMetrics;
}

export default function LaunchReadinessCard({ metrics }: LaunchReadinessCardProps) {
  if (!metrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-48 h-48 bg-gray-700/20 rounded-full mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700/20 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-700/20 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const readinessScore = Math.round(metrics.launchReadiness || 0);
  const readinessColor = readinessScore >= 85 ? '#FFD700' : 
                        readinessScore >= 60 ? '#FFA500' : '#FF6B6B';
  
  const launchGates: LaunchGate[] = [
    {
      name: 'Voice Pipeline',
      current: metrics.voiceHealth.overall,
      target: 95,
      status: metrics.voiceHealth.overall >= 95 ? 'pass' : 
              metrics.voiceHealth.overall >= 85 ? 'warning' : 'fail',
      description: 'Speech recognition and TTS performance'
    },
    {
      name: 'Memory System',
      current: metrics.memoryPerformance.overall,
      target: 90,
      status: metrics.memoryPerformance.overall >= 90 ? 'pass' : 
              metrics.memoryPerformance.overall >= 80 ? 'warning' : 'fail',
      description: 'Context integration and memory persistence'
    },
    {
      name: 'User Experience',
      current: metrics.userSatisfaction.averageRating * 20, // Convert to percentage
      target: 84, // 4.2/5 * 20
      status: metrics.userSatisfaction.averageRating >= 4.2 ? 'pass' : 
              metrics.userSatisfaction.averageRating >= 3.8 ? 'warning' : 'fail',
      description: 'User satisfaction and engagement'
    },
    {
      name: 'System Stability',
      current: metrics.systemStability.uptime,
      target: 99.5,
      status: metrics.systemStability.uptime >= 99.5 ? 'pass' : 
              metrics.systemStability.uptime >= 99 ? 'warning' : 'fail',
      description: 'Uptime and technical reliability'
    }
  ];

  const passedGates = launchGates.filter(gate => gate.status === 'pass').length;
  const totalGates = launchGates.length;
  
  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  const isLaunchReady = readinessScore >= 85;
  const isNearReady = readinessScore >= 60;

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-sacred-gold/20 relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Launch Readiness
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sacred Geometry Progress Circle */}
        <div className="relative w-48 h-48 mx-auto">
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90 absolute inset-0">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="rgba(255, 215, 0, 0.1)"
              strokeWidth="8"
              fill="transparent"
            />
          </svg>
          
          {/* Progress Circle with Animation */}
          <motion.svg 
            className="w-full h-full -rotate-90 absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              stroke={readinessColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 8px ${readinessColor}40)`,
              }}
            />
          </motion.svg>
          
          {/* Inner Glow Effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle at center, ${readinessColor}20 0%, transparent 70%)`
            }}
          />
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center"
            >
              <span 
                className="text-4xl font-bold"
                style={{ color: readinessColor }}
              >
                {readinessScore}%
              </span>
              <div className="text-sm text-gray-400 mt-1">
                {isLaunchReady ? 'Ready to Launch' : 
                 isNearReady ? 'Near Ready' : 'Needs Work'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {passedGates}/{totalGates} gates passed
              </div>
            </motion.div>
          </div>
        </div>

        {/* Launch Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`p-3 rounded-lg border text-center ${
            isLaunchReady 
              ? 'bg-sacred-gold/10 border-sacred-gold/30 text-sacred-gold'
              : isNearReady
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isLaunchReady ? (
              <CheckCircle className="w-5 h-5" />
            ) : isNearReady ? (
              <Clock className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isLaunchReady 
                ? 'Maya is ready for public launch!'
                : isNearReady
                ? 'Maya is nearly ready - final preparations needed'
                : 'Maya needs more work before launch'
              }
            </span>
          </div>
        </motion.div>
        
        {/* Launch Gates */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Launch Gates</h4>
          <div className="space-y-2">
            {launchGates.map((gate, index) => (
              <motion.div
                key={gate.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <LaunchGateItem gate={gate} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="pt-4 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Next Steps</h4>
          <div className="text-xs text-gray-400 space-y-1">
            {!isLaunchReady && (
              <>
                {metrics.voiceHealth.overall < 95 && (
                  <div>• Improve voice recognition accuracy to 95%+</div>
                )}
                {metrics.memoryPerformance.overall < 90 && (
                  <div>• Optimize memory integration performance</div>
                )}
                {metrics.userSatisfaction.averageRating < 4.2 && (
                  <div>• Enhance user experience to 4.2/5+ rating</div>
                )}
                {metrics.systemStability.uptime < 99.5 && (
                  <div>• Achieve 99.5%+ system uptime</div>
                )}
              </>
            )}
            {isLaunchReady && (
              <div className="text-sacred-gold">✓ All launch criteria met - ready to scale!</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Launch Gate Item Component
function LaunchGateItem({ gate }: { gate: LaunchGate }) {
  const statusIcon = {
    pass: <CheckCircle className="w-4 h-4 text-green-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    fail: <AlertCircle className="w-4 h-4 text-red-400" />
  };

  const statusColor = {
    pass: 'text-green-400',
    warning: 'text-amber-400',
    fail: 'text-red-400'
  };

  const progressColor = {
    pass: 'bg-green-400',
    warning: 'bg-amber-400',
    fail: 'bg-red-400'
  };

  const progressPercentage = Math.min((gate.current / gate.target) * 100, 100);

  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {statusIcon[gate.status]}
          <span className="text-sm font-medium text-gray-300">
            {gate.name}
          </span>
        </div>
        <span className={`text-sm font-medium ${statusColor[gate.status]}`}>
          {gate.current.toFixed(1)}{gate.name === 'User Experience' ? '/5' : '%'}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Target: {gate.target}{gate.name === 'User Experience' ? '/5' : '%'}</span>
          <span>{progressPercentage.toFixed(0)}% of target</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${progressColor[gate.status]}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-500">{gate.description}</p>
    </div>
  );
}
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { BetaMetrics } from '../hooks/useBetaMetrics';

interface LaunchReadinessAlertsProps {
  metrics?: BetaMetrics;
}

interface LaunchAlert {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: string;
  metric?: string;
  priority: number;
}

export default function LaunchReadinessAlerts({ metrics }: LaunchReadinessAlertsProps) {
  if (!metrics) return null;

  const generateAlerts = (): LaunchAlert[] => {
    const alerts: LaunchAlert[] = [];

    // Critical Blockers (Must fix before launch)
    if (metrics.voiceHealth.overall < 95) {
      alerts.push({
        id: 'voice-critical',
        type: 'critical',
        title: 'Voice Pipeline Below Launch Threshold',
        message: 'Voice recognition accuracy must reach 95% for public launch',
        action: 'Optimize STT models and audio processing',
        metric: `${metrics.voiceHealth.overall.toFixed(1)}%`,
        priority: 1
      });
    }

    if (metrics.memoryPerformance.overall < 90) {
      alerts.push({
        id: 'memory-critical',
        type: 'critical',
        title: 'Memory System Not Launch Ready',
        message: 'Memory integration must achieve 90% success rate',
        action: 'Debug memory orchestration and layer performance',
        metric: `${metrics.memoryPerformance.overall.toFixed(1)}%`,
        priority: 1
      });
    }

    if (metrics.systemStability.uptime < 99.5) {
      alerts.push({
        id: 'uptime-critical',
        type: 'critical',
        title: 'System Uptime Below Production Standard',
        message: 'Production systems require 99.5% uptime minimum',
        action: 'Address infrastructure reliability issues',
        metric: `${metrics.systemStability.uptime.toFixed(2)}%`,
        priority: 1
      });
    }

    // Warnings (Should address before launch)
    if (metrics.userSatisfaction.averageRating < 4.2) {
      alerts.push({
        id: 'satisfaction-warning',
        type: 'warning',
        title: 'User Satisfaction Below Target',
        message: 'Target 4.2/5 rating for strong product-market fit',
        action: 'Analyze feedback and improve user experience',
        metric: `${metrics.userSatisfaction.averageRating.toFixed(1)}/5`,
        priority: 2
      });
    }

    if (metrics.voiceHealth.errorRate > 3) {
      alerts.push({
        id: 'voice-errors',
        type: 'warning',
        title: 'Voice Error Rate Elevated',
        message: 'Error rates above 3% impact user experience',
        action: 'Investigate and resolve voice pipeline errors',
        metric: `${metrics.voiceHealth.errorRate.toFixed(1)}%`,
        priority: 2
      });
    }

    if (metrics.betaTesters.retentionRate < 60) {
      alerts.push({
        id: 'retention-warning',
        type: 'warning',
        title: 'Beta Tester Retention Below Target',
        message: 'Low retention may indicate product issues',
        action: 'Survey churned testers and improve onboarding',
        metric: `${metrics.betaTesters.retentionRate.toFixed(1)}%`,
        priority: 2
      });
    }

    // Success Indicators
    if (metrics.launchReadiness >= 85) {
      alerts.push({
        id: 'launch-ready',
        type: 'success',
        title: 'Launch Readiness Achieved!',
        message: 'All critical metrics meet launch criteria',
        action: 'Prepare for public launch announcement',
        metric: `${metrics.launchReadiness.toFixed(1)}%`,
        priority: 0
      });
    }

    if (metrics.betaTesters.completionRate >= 80) {
      alerts.push({
        id: 'beta-success',
        type: 'success',
        title: 'Excellent Beta Engagement',
        message: 'High completion rate indicates strong product fit',
        metric: `${metrics.betaTesters.completionRate.toFixed(1)}%`,
        priority: 0
      });
    }

    // Performance Opportunities
    if (metrics.voiceHealth.processingLatency > 2000) {
      alerts.push({
        id: 'latency-info',
        type: 'info',
        title: 'Voice Processing Latency High',
        message: 'Consider optimizing for better real-time experience',
        action: 'Review voice pipeline optimization opportunities',
        metric: `${metrics.voiceHealth.processingLatency.toFixed(0)}ms`,
        priority: 3
      });
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  };

  const alerts = generateAlerts();
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info': return <Target className="w-5 h-5 text-blue-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-amber-500/30 bg-amber-500/10';
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-300';
      case 'warning': return 'text-amber-300';
      case 'success': return 'text-green-300';
      case 'info': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Zap className="w-6 h-6 mr-2" />
          Launch Readiness Alerts
          <div className="ml-auto flex space-x-2">
            {criticalCount > 0 && (
              <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                {criticalCount} Critical
              </div>
            )}
            {warningCount > 0 && (
              <div className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-medium">
                {warningCount} Warning
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-medium ${getTextColor(alert.type)}`}>
                    {alert.title}
                  </h4>
                  {alert.metric && (
                    <span className={`text-xs font-medium ${getTextColor(alert.type)}`}>
                      {alert.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {alert.message}
                </p>
                {alert.action && (
                  <div className="text-xs text-gray-500 bg-gray-800/50 rounded px-2 py-1">
                    Action: {alert.action}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Launch Readiness Summary */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall Launch Status</span>
            <div className="flex items-center space-x-2">
              {criticalCount === 0 && warningCount === 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Ready for Launch</span>
                </>
              ) : criticalCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Blocked - Critical Issues</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-medium">Near Ready - Warnings Only</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Clock, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { BetaTesterMetrics } from '../hooks/useBetaMetrics';

interface BetaTesterFeedbackProps {
  feedbackData?: BetaTesterMetrics;
}

export default function BetaTesterFeedback({ feedbackData }: BetaTesterFeedbackProps) {
  if (!feedbackData) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const engagementColor = feedbackData.completionRate >= 80 ? 'text-green-400' : 
                          feedbackData.completionRate >= 60 ? 'text-amber-400' : 'text-red-400';

  const retentionColor = feedbackData.retentionRate >= 70 ? 'text-green-400' : 
                         feedbackData.retentionRate >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Beta Tester Insights
        </CardTitle>
        <div className="text-lg font-semibold text-gray-300">
          {feedbackData.active} active • {feedbackData.total} total
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Completion Rate</span>
            </div>
            <span className={`text-sm font-semibold ${engagementColor}`}>
              {feedbackData.completionRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300">Retention Rate</span>
            </div>
            <span className={`text-sm font-semibold ${retentionColor}`}>
              {feedbackData.retentionRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Avg Session</span>
            </div>
            <span className="text-sm font-semibold text-green-400">
              {feedbackData.averageSessionTime.toFixed(1)}min
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300">Feedback Count</span>
            </div>
            <span className="text-sm font-semibold text-amber-400">
              {feedbackData.feedbackSubmissions}
            </span>
          </div>
        </div>

        {/* Engagement Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Tester Engagement</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Active Testers</span>
              <span className="text-blue-400">{feedbackData.active}/{feedbackData.total}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div
                className="h-2 bg-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(feedbackData.active / feedbackData.total) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Task Completion</span>
              <span className={engagementColor}>{feedbackData.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  feedbackData.completionRate >= 80 ? 'bg-green-400' : 
                  feedbackData.completionRate >= 60 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${feedbackData.completionRate}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Tester Quality Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Quality Indicators</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                feedbackData.averageSessionTime >= 15 ? 'bg-green-400' : 'bg-amber-400'
              }`}></div>
              <span className="text-gray-300">
                {feedbackData.averageSessionTime >= 15 ? 'Deep Engagement' : 'Light Testing'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                feedbackData.feedbackSubmissions >= 50 ? 'bg-green-400' : 'bg-amber-400'
              }`}></div>
              <span className="text-gray-300">
                {feedbackData.feedbackSubmissions >= 50 ? 'High Feedback' : 'Moderate Feedback'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${retentionColor.includes('green') ? 'bg-green-400' : 
                               retentionColor.includes('amber') ? 'bg-amber-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300">
                {feedbackData.retentionRate >= 70 ? 'High Retention' : 
                 feedbackData.retentionRate >= 50 ? 'Good Retention' : 'Low Retention'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                (feedbackData.active / feedbackData.total) >= 0.6 ? 'bg-green-400' : 'bg-amber-400'
              }`}></div>
              <span className="text-gray-300">
                {(feedbackData.active / feedbackData.total) >= 0.6 ? 'Active Community' : 'Growing Community'}
              </span>
            </div>
          </div>
        </div>

        {/* Beta Insights */}
        <div className="pt-4 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Beta Insights</h4>
          <div className="space-y-2 text-xs">
            {feedbackData.completionRate >= 80 && (
              <div className="flex items-center space-x-2 text-green-400">
                <Award className="w-3 h-3" />
                <span>Excellent tester engagement - ready for expanded beta</span>
              </div>
            )}
            
            {feedbackData.averageSessionTime >= 20 && (
              <div className="flex items-center space-x-2 text-blue-400">
                <Clock className="w-3 h-3" />
                <span>Deep testing sessions indicate strong product-market fit</span>
              </div>
            )}
            
            {feedbackData.retentionRate >= 70 && (
              <div className="flex items-center space-x-2 text-amber-400">
                <TrendingUp className="w-3 h-3" />
                <span>High retention suggests compelling user experience</span>
              </div>
            )}
            
            {feedbackData.feedbackSubmissions >= 60 && (
              <div className="flex items-center space-x-2 text-amber-400">
                <MessageSquare className="w-3 h-3" />
                <span>Rich feedback volume enables rapid iteration</span>
              </div>
            )}

            {/* Improvement suggestions */}
            {feedbackData.completionRate < 60 && (
              <div className="text-red-300">
                • Focus on reducing onboarding friction
              </div>
            )}
            
            {feedbackData.retentionRate < 50 && (
              <div className="text-red-300">
                • Investigate user drop-off points
              </div>
            )}
          </div>
        </div>

        {/* Next Beta Wave */}
        <div className="p-3 bg-sacred-gold/10 border border-sacred-gold/20 rounded-lg">
          <div className="text-xs font-medium text-sacred-gold mb-1">
            Ready for Next Wave?
          </div>
          <div className="text-xs text-sacred-gold/80">
            {feedbackData.completionRate >= 75 && feedbackData.retentionRate >= 60 
              ? '✓ Metrics support expanding beta cohort'
              : '⏳ Optimize current experience before scaling'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
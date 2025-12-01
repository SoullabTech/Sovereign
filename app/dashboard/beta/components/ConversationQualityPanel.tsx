"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Target, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ConversationQualityMetrics {
  personalization_success_rate: number;
  boilerplate_rejection_count: number;
  avg_tokens_per_response: number;
  total_conversations: number;
  personalized_responses: number;
  generic_responses: number;
}

interface ConversationQualityPanelProps {
  qualityMetrics?: ConversationQualityMetrics;
}

export default function ConversationQualityPanel({ qualityMetrics }: ConversationQualityPanelProps) {
  if (!qualityMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-700/20 rounded"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-700/20 rounded"></div>
                <div className="h-8 bg-gray-700/20 rounded"></div>
                <div className="h-8 bg-gray-700/20 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const personalizationColor = qualityMetrics.personalization_success_rate >= 85 ? 'text-green-400' : 
                               qualityMetrics.personalization_success_rate >= 70 ? 'text-amber-400' : 'text-red-400';

  const tokensColor = qualityMetrics.avg_tokens_per_response >= 80 && qualityMetrics.avg_tokens_per_response <= 150 ? 'text-green-400' : 'text-amber-400';

  // Response type breakdown data
  const responseTypeData = [
    {
      name: 'Personalized',
      count: qualityMetrics.personalized_responses,
      percentage: (qualityMetrics.personalized_responses / qualityMetrics.total_conversations * 100).toFixed(1)
    },
    {
      name: 'Generic',
      count: qualityMetrics.generic_responses,
      percentage: (qualityMetrics.generic_responses / qualityMetrics.total_conversations * 100).toFixed(1)
    }
  ];

  // Mock hourly personalization trend data
  const personalizationTrendData = Array.from({ length: 12 }, (_, i) => ({
    hour: i + 1,
    personalization: qualityMetrics.personalization_success_rate + (Math.random() - 0.5) * 10
  }));

  // Token distribution mock data
  const tokenDistributionData = [
    { range: '<50', count: 5 },
    { range: '50-80', count: 18 },
    { range: '80-120', count: 45 },
    { range: '120-150', count: 28 },
    { range: '>150', count: 12 }
  ];

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Conversation Quality
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm">
          <div className={`font-semibold ${personalizationColor}`}>
            {qualityMetrics.personalization_success_rate.toFixed(1)}% Personalized
          </div>
          <div className="text-gray-400">
            {qualityMetrics.boilerplate_rejection_count} Boilerplate Rejections
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Personalized vs Generic Response Bar Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Response Type Breakdown</h4>
            <div className="h-32 bg-gray-800/30 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTypeData} layout="horizontal">
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#FFD700"
                    radius={[0, 2, 2, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span className="text-green-400">Personalized</span>
                <span className="font-semibold text-green-400">{responseTypeData[0].percentage}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span className="text-amber-400">Generic</span>
                <span className="font-semibold text-amber-400">{responseTypeData[1].percentage}%</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Quality Metrics</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-sacred-gold" />
                  <span className="text-sm text-gray-300">Personalization Rate</span>
                </div>
                <span className={`font-semibold ${personalizationColor}`}>
                  {qualityMetrics.personalization_success_rate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Avg Tokens</span>
                </div>
                <span className={`font-semibold ${tokensColor}`}>
                  {qualityMetrics.avg_tokens_per_response.toFixed(0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${
                    qualityMetrics.boilerplate_rejection_count <= 10 ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <span className="text-sm text-gray-300">Boilerplate Rejections</span>
                </div>
                <span className={`font-semibold ${
                  qualityMetrics.boilerplate_rejection_count <= 10 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {qualityMetrics.boilerplate_rejection_count}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personalization Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Personalization Trend (12h)</h4>
            <div className="text-xs text-gray-400">
              Target: 85%
            </div>
          </div>
          <div className="h-20 bg-gray-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={personalizationTrendData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis 
                  domain={[60, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="personalization"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, stroke: '#FFD700', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Length Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Response Length Distribution</h4>
          <div className="h-16 bg-gray-800/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenDistributionData}>
                <XAxis 
                  dataKey="range" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#9CA3AF' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#C084FC"
                  radius={[1, 1, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">
              {qualityMetrics.total_conversations}
            </div>
            <div className="text-xs text-gray-400">Total Conversations</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${personalizationColor}`}>
              {qualityMetrics.personalization_success_rate >= 85 ? 'Excellent' : 
               qualityMetrics.personalization_success_rate >= 70 ? 'Good' : 'Poor'}
            </div>
            <div className="text-xs text-gray-400">Quality Score</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${tokensColor}`}>
              {qualityMetrics.avg_tokens_per_response >= 80 && qualityMetrics.avg_tokens_per_response <= 150 ? 'Optimal' : 'Review'}
            </div>
            <div className="text-xs text-gray-400">Token Length</div>
          </div>
        </div>

        {/* Quality Insights */}
        <div className="space-y-2 text-xs">
          {qualityMetrics.personalization_success_rate >= 85 && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>High personalization rate indicates strong memory integration</span>
            </div>
          )}
          
          {qualityMetrics.boilerplate_rejection_count <= 5 && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Low boilerplate count shows authentic conversation quality</span>
            </div>
          )}
          
          {qualityMetrics.avg_tokens_per_response >= 80 && qualityMetrics.avg_tokens_per_response <= 150 && (
            <div className="flex items-center space-x-2 text-blue-400">
              <TrendingUp className="w-3 h-3" />
              <span>Response length in optimal range for engagement</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
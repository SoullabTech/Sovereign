"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Star, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { UserExperienceMetrics } from '../hooks/useBetaMetrics';

interface UserExperiencePanelProps {
  uxMetrics?: UserExperienceMetrics;
}

export default function UserExperiencePanel({ uxMetrics }: UserExperiencePanelProps) {
  if (!uxMetrics) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/20 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700/20 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const satisfactionColor = uxMetrics.averageRating >= 4.2 ? 'text-green-400' : 
                            uxMetrics.averageRating >= 3.8 ? 'text-amber-400' : 'text-red-400';

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-sacred-gold fill-sacred-gold' 
            : i < rating 
            ? 'text-sacred-gold fill-sacred-gold/50'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sacred-gold flex items-center">
          <Heart className="w-6 h-6 mr-2" />
          User Experience
        </CardTitle>
        <div className={`text-2xl font-bold ${satisfactionColor}`}>
          {uxMetrics.overall.toFixed(1)}% Satisfaction
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              {renderStars(uxMetrics.averageRating)}
            </div>
            <div className={`text-lg font-semibold ${satisfactionColor}`}>
              {uxMetrics.averageRating.toFixed(1)}/5
            </div>
            <div className="text-xs text-gray-400">Average Rating</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className="text-lg font-semibold text-amber-400">
              {uxMetrics.feelsAlive.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">"Maya Feels Alive"</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className="text-lg font-semibold text-blue-400">
              {uxMetrics.dailyUseIntent.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Daily Use Intent</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg text-center">
            <div className="text-lg font-semibold text-green-400">
              {uxMetrics.voicePreference.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Voice Preference</div>
          </div>
        </div>

        {/* Satisfaction Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Satisfaction Trend</h4>
          <div className="h-24 bg-gray-800/30 rounded-lg p-2">
            <SatisfactionChart data={uxMetrics.satisfactionTrend} />
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Recent Feedback</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uxMetrics.recentFeedback.slice(0, 3).map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border text-xs ${
                  feedback.rating >= 4 
                    ? 'bg-green-500/10 border-green-500/20'
                    : feedback.rating >= 3
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(feedback.rating)}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{feedback.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500 text-xs">
                    Category: {feedback.category}
                  </span>
                  <span className="text-gray-500 text-xs">
                    User: {feedback.userId}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Experience Insights */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            {uxMetrics.feelsAlive >= 75 ? (
              <>
                <Heart className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">High Aliveness Score</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400">Moderate Aliveness</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {uxMetrics.voicePreference >= 60 ? (
              <>
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400">Voice Preferred</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Text Preferred</span>
              </>
            )}
          </div>
        </div>

        {/* Action Items */}
        {uxMetrics.averageRating < 4.2 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-medium mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Improvement Opportunity</span>
            </div>
            <p className="text-amber-300 text-xs">
              User satisfaction below target. Focus on {
                uxMetrics.feelsAlive < 75 ? 'personality depth' :
                uxMetrics.voicePreference < 60 ? 'voice experience' : 
                'overall user experience'
              } improvements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Satisfaction Chart Component
function SatisfactionChart({ data }: { data: any[] }) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).getHours(),
    satisfaction: point.value,
    timestamp: point.timestamp
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
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
          dataKey="satisfaction"
          stroke="#FFD700"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, stroke: '#FFD700', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
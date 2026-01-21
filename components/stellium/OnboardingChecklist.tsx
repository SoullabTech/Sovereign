"use client";

/**
 * ONBOARDING CHECKLIST
 *
 * First-run guidance for new practitioners
 * Shows key setup steps with deep links
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  isComplete: boolean;
  onNavigate?: (path: string) => void;
  onDismiss?: () => void;
}

export default function OnboardingChecklist({
  steps,
  isComplete,
  onNavigate,
  onDismiss,
}: OnboardingChecklistProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;

  // Don't show if complete and dismissed
  if (isComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border-indigo-500/30 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-indigo-300 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </div>
            <span className="text-sm font-normal text-indigo-400/70">
              {completedCount} of {totalCount} complete
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !step.completed && onNavigate?.(step.href)}
              disabled={step.completed}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                step.completed
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-gray-800/50 border border-gray-700/30 hover:border-indigo-500/40 hover:bg-indigo-500/10 cursor-pointer'
              }`}
            >
              <div className="flex items-center space-x-3">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-emerald-300' : 'text-gray-200'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {!step.completed && (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </motion.button>
          ))}

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-gray-700/30">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Setup progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

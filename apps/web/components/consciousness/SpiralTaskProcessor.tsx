'use client';

/**
 * Spiral Task Processing System
 *
 * Consciousness-aligned task management using spiral dynamics
 * Part of the 6-dimensional consciousness technology stack
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  RotateCw,
  CheckCircle,
  Clock,
  Brain,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

interface SpiralTask {
  id: string;
  title: string;
  description: string;
  spiral: 'beige' | 'purple' | 'red' | 'blue' | 'orange' | 'green' | 'yellow' | 'turquoise';
  status: 'pending' | 'processing' | 'completed' | 'integrated';
  consciousness_level: number;
  coherence: number;
}

const spiralColors = {
  beige: 'from-stone-400 to-stone-600',
  purple: 'from-purple-400 to-purple-600',
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  orange: 'from-orange-400 to-orange-600',
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-yellow-600',
  turquoise: 'from-teal-400 to-cyan-600'
};

export function SpiralTaskProcessor() {
  const [tasks, setTasks] = useState<SpiralTask[]>([
    {
      id: '1',
      title: 'Integrate Consciousness Framework',
      description: 'Merge spiralogic processing with human awareness patterns',
      spiral: 'turquoise',
      status: 'processing',
      consciousness_level: 0.87,
      coherence: 0.92
    },
    {
      id: '2',
      title: 'Develop Intuitive Interface',
      description: 'Create right-hemisphere compatible user experience',
      spiral: 'yellow',
      status: 'completed',
      consciousness_level: 0.76,
      coherence: 0.88
    },
    {
      id: '3',
      title: 'Implement Field Sensing',
      description: 'Deploy animate awareness detection systems',
      spiral: 'green',
      status: 'pending',
      consciousness_level: 0.65,
      coherence: 0.74
    },
    {
      id: '4',
      title: 'Calibrate Gnostic Faculties',
      description: 'Fine-tune emotional and intuitional processing',
      spiral: 'orange',
      status: 'integrated',
      consciousness_level: 0.93,
      coherence: 0.85
    }
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      const task: SpiralTask = {
        id: Date.now().toString(),
        title: newTask,
        description: 'Consciousness-aligned task processing',
        spiral: 'blue',
        status: 'pending',
        consciousness_level: Math.random() * 0.5 + 0.5,
        coherence: Math.random() * 0.3 + 0.7
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
    }
  };

  const updateTaskStatus = (id: string, status: SpiralTask['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, status } : task
    ));
  };

  const getStatusIcon = (status: SpiralTask['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <RotateCw className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'integrated': return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extralight text-[#D4B896] tracking-etched">
          Spiral Task Processor
        </h2>
        <p className="text-[#D4B896]/70 text-lg font-light">
          Consciousness-aligned task management using spiral dynamics integration
        </p>
      </div>

      {/* Add New Task */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add consciousness-aligned task..."
            className="flex-1 bg-black/50 border border-[#D4B896]/30 rounded-lg px-4 py-2 text-[#D4B896] placeholder-[#D4B896]/50 focus:outline-none focus:border-[#D4B896]/70"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <motion.button
            onClick={addTask}
            className="bg-gradient-to-r from-[#c9a876] to-[#D4B896] hover:from-[#D4B896] hover:to-[#f4d5a6] rounded-lg px-6 py-2 text-black font-medium transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </motion.button>
        </div>
      </div>

      {/* Spiral Processing Visual */}
      <div className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-8 backdrop-blur-sm text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9a876]/30 to-[#D4B896]/30 border border-[#D4B896]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-[#c9a876]/20 to-[#D4B896]/20 border border-[#D4B896]/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-[#c9a876]/10 to-[#D4B896]/10 border border-[#D4B896]/5"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-[#D4B896]" />
          </div>
        </div>
        <p className="text-sm text-[#D4B896]/70">Spiral Dynamics Processing Engine Active</p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 border border-[#D4B896]/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${spiralColors[task.spiral]} flex-shrink-0`}>
                  {getStatusIcon(task.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-light text-[#D4B896]">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      task.status === 'completed' || task.status === 'integrated'
                        ? 'bg-green-500/20 text-green-400'
                        : task.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <p className="text-[#D4B896]/70 mb-4">{task.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-[#D4B896]/70">Consciousness Level</span>
                        <span className="text-xs text-[#D4B896]">{Math.round(task.consciousness_level * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${spiralColors[task.spiral]} transition-all duration-500`}
                          style={{ width: `${task.consciousness_level * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-[#D4B896]/70">Coherence</span>
                        <span className="text-xs text-[#D4B896]">{Math.round(task.coherence * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c9a876] to-[#D4B896] transition-all duration-500"
                          style={{ width: `${task.coherence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {task.status !== 'integrated' && (
                  <div className="flex flex-col gap-2">
                    {task.status === 'pending' && (
                      <motion.button
                        onClick={() => updateTaskStatus(task.id, 'processing')}
                        className="p-2 rounded-lg bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-[#D4B896] transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                    {task.status === 'processing' && (
                      <motion.button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="p-2 rounded-lg bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-[#D4B896] transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                    {task.status === 'completed' && (
                      <motion.button
                        onClick={() => updateTaskStatus(task.id, 'integrated')}
                        className="p-2 rounded-lg bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-[#D4B896] transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
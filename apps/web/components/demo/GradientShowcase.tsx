'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { soullabColors } from '@/lib/theme/soullabColors'
import { soullabGradients } from '@/lib/theme/soullabGradients'

export default function GradientShowcase() {
  const gradients = [
    { name: 'Warmth', gradient: soullabGradients.warmth, description: 'Terracotta → Amber' },
    { name: 'Nature', gradient: soullabGradients.nature, description: 'Sage → Ocean' },
    { name: 'Earth', gradient: soullabGradients.earth, description: 'Terracotta → Sage' },
    { name: 'Sunset', gradient: soullabGradients.sunset, description: 'Amber → Ocean' },
  ]

  const subtleGradients = [
    { name: 'Warmth Subtle', gradient: soullabGradients.warmthSubtle },
    { name: 'Nature Subtle', gradient: soullabGradients.natureSubtle },
    { name: 'Earth Subtle', gradient: soullabGradients.earthSubtle },
    { name: 'Sunset Subtle', gradient: soullabGradients.sunsetSubtle },
  ]

  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-serif mb-6" style={{ color: soullabColors.terracotta[700] }}>
          Soullab Gradient System
        </h2>
        
        {/* Primary Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {gradients.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative h-32 rounded-xl overflow-hidden"
              style={{ background: item.gradient }}
            >
              {/* Overlay with text */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-serif mb-1">{item.name}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle Background Gradients */}
        <h3 className="text-xl font-serif mb-6" style={{ color: soullabColors.sage[700] }}>
          Subtle Backgrounds
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {subtleGradients.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="h-24 rounded-lg border border-gray-200"
              style={{ background: item.gradient }}
            >
              <div className="h-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {item.name.replace(' Subtle', '')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aura Gradients */}
        <h3 className="text-xl font-serif mb-6" style={{ color: soullabColors.ocean[700] }}>
          Aura Effects
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {Object.entries(soullabGradients.aura).map(([name, aura], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className="h-32 rounded-xl border border-gray-100 flex items-center justify-center relative"
              style={{ background: '#fafafa' }}
            >
              <motion.div
                className="w-20 h-20 rounded-full"
                style={{ background: aura }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mesh Gradients */}
        <h3 className="text-xl font-serif mb-6" style={{ color: soullabColors.amber[700] }}>
          Mesh Gradients
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-48 rounded-xl"
            style={{ background: soullabGradients.mesh.harmony }}
          >
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-xl font-serif text-gray-800 mb-2">Harmony</h4>
                <p className="text-sm text-gray-600">4-color balanced composition</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-48 rounded-xl"
            style={{ background: soullabGradients.mesh.balance }}
          >
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-xl font-serif text-gray-800 mb-2">Balance</h4>
                <p className="text-sm text-gray-600">3-color centered design</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Example */}
        <h3 className="text-xl font-serif mb-6" style={{ color: soullabColors.terracotta[600] }}>
          Animated Gradient
        </h3>
        <motion.div
          className="h-24 rounded-xl flex items-center justify-center"
          animate={{
            background: [
              soullabGradients.warmth,
              soullabGradients.nature,
              soullabGradients.sunset,
              soullabGradients.earth,
              soullabGradients.warmth,
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-white font-serif text-lg">
            Sacred Flow Animation
          </span>
        </motion.div>
      </div>
    </div>
  )
}
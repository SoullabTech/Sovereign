"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SensorData {
  // Biofeedback
  eegBands: { delta: number; theta: number; alpha: number; beta: number; gamma: number };
  heartRateVariability: number;
  galvanicSkinResponse: number;
  respirationRate: number;
  bodyTemperature: number;

  // Physical Controls
  joystickPosition: { x: number; y: number; z: number };
  gripPressure: { left: number; right: number };
  fingerTracking: { thumb: number; index: number; middle: number; ring: number; pinky: number };

  // Optical
  eyeGaze: { x: number; y: number };
  pupilDilation: number;
  bodyPosture: { lean: number; rotation: number; height: number };
  gestureRecognition: { type: string; intensity: number };

  // Environmental
  ambientLight: number;
  roomTemperature: number;
  acousticEnvironment: number;
}

interface FieldEffects {
  // Audio Field
  frequencyMapping: {
    deltaLayer: { volume: number; frequency: number; spatial: string };
    thetaLayer: { volume: number; frequency: number; spatial: string };
    alphaLayer: { volume: number; frequency: number; spatial: string };
    betaLayer: { volume: number; frequency: number; spatial: string };
    gammaLayer: { volume: number; frequency: number; spatial: string };
  };

  // Light Field
  lightingSystem: {
    ambientHue: number;
    intensity: number;
    strobeFrequency: number;
    spatialPattern: string;
  };

  // Visualization Field
  oscillatorParameters: {
    gridDensity: number;
    couplingStrength: number;
    phaseCoherence: number;
    visualIntensity: number;
  };

  // Haptic Field
  hapticFeedback: {
    vibrationPattern: string;
    intensity: number;
    spatialDistribution: string;
    temperatureModulation: number;
  };
}

export function UnifiedFieldController() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [fieldEffects, setFieldEffects] = useState<FieldEffects | null>(null);
  const [isNeuropodConnected, setIsNeuropodConnected] = useState(false);
  const [fieldCoherence, setFieldCoherence] = useState(0.75);

  // Simulate sensor data (in real implementation, this would connect to actual hardware)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isNeuropodConnected) {
        // Simulate real-time sensor data
        const mockSensorData: SensorData = {
          // Biofeedback simulation
          eegBands: {
            delta: Math.random() * 0.3 + 0.1,
            theta: Math.random() * 0.4 + 0.2,
            alpha: Math.random() * 0.6 + 0.3,
            beta: Math.random() * 0.5 + 0.25,
            gamma: Math.random() * 0.2 + 0.05
          },
          heartRateVariability: Math.random() * 50 + 50,
          galvanicSkinResponse: Math.random() * 10 + 5,
          respirationRate: Math.random() * 4 + 12,
          bodyTemperature: Math.random() * 2 + 98,

          // Physical controls simulation
          joystickPosition: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
          },
          gripPressure: {
            left: Math.random() * 100,
            right: Math.random() * 100
          },
          fingerTracking: {
            thumb: Math.random(),
            index: Math.random(),
            middle: Math.random(),
            ring: Math.random(),
            pinky: Math.random()
          },

          // Optical simulation
          eyeGaze: {
            x: (Math.random() - 0.5) * 1920,
            y: (Math.random() - 0.5) * 1080
          },
          pupilDilation: Math.random() * 4 + 2,
          bodyPosture: {
            lean: (Math.random() - 0.5) * 30,
            rotation: (Math.random() - 0.5) * 45,
            height: Math.random() * 10 + 160
          },
          gestureRecognition: {
            type: ['peace', 'fist', 'open_palm', 'pointing'][Math.floor(Math.random() * 4)],
            intensity: Math.random()
          },

          // Environmental
          ambientLight: Math.random() * 1000 + 200,
          roomTemperature: Math.random() * 5 + 70,
          acousticEnvironment: Math.random() * 60 + 30
        };

        setSensorData(mockSensorData);

        // Calculate field effects based on sensor data
        calculateFieldEffects(mockSensorData);
      }
    }, 100); // 10Hz update rate

    return () => clearInterval(interval);
  }, [isNeuropodConnected]);

  const calculateFieldEffects = (sensors: SensorData) => {
    // Advanced algorithm mapping sensors to unified field effects
    const dominantBrainwave = Object.entries(sensors.eegBands)
      .reduce((a, b) => sensors.eegBands[a[0] as keyof typeof sensors.eegBands] > sensors.eegBands[b[0] as keyof typeof sensors.eegBands] ? a : b)[0];

    // Calculate field coherence based on biofeedback harmony
    const coherence = (sensors.heartRateVariability / 100 +
                     (1 - Math.abs(sensors.respirationRate - 16) / 16) +
                     sensors.eegBands.alpha) / 3;

    setFieldCoherence(coherence);

    const effects: FieldEffects = {
      // Audio field mapping
      frequencyMapping: {
        deltaLayer: {
          volume: sensors.eegBands.delta * 100,
          frequency: 2 + sensors.joystickPosition.z * 2,
          spatial: sensors.bodyPosture.lean < -10 ? 'left' : sensors.bodyPosture.lean > 10 ? 'right' : 'center'
        },
        thetaLayer: {
          volume: sensors.eegBands.theta * 100,
          frequency: 6 + sensors.gripPressure.left / 50,
          spatial: 'surround'
        },
        alphaLayer: {
          volume: sensors.eegBands.alpha * 100,
          frequency: 10 + sensors.heartRateVariability / 10,
          spatial: 'front'
        },
        betaLayer: {
          volume: sensors.eegBands.beta * 100,
          frequency: 20 + sensors.galvanicSkinResponse * 2,
          spatial: 'overhead'
        },
        gammaLayer: {
          volume: sensors.eegBands.gamma * 100,
          frequency: 40 + sensors.pupilDilation * 5,
          spatial: 'omnidirectional'
        }
      },

      // Light field
      lightingSystem: {
        ambientHue: (sensors.eyeGaze.x + 960) / 1920 * 360, // Eye gaze controls hue
        intensity: sensors.ambientLight / 10,
        strobeFrequency: sensors.eegBands[dominantBrainwave as keyof typeof sensors.eegBands] * 30,
        spatialPattern: sensors.gestureRecognition.type
      },

      // Oscillator visualization
      oscillatorParameters: {
        gridDensity: Math.floor(16 + sensors.joystickPosition.x * 24),
        couplingStrength: sensors.gripPressure.right / 100,
        phaseCoherence: coherence,
        visualIntensity: sensors.pupilDilation / 6
      },

      // Haptic feedback
      hapticFeedback: {
        vibrationPattern: dominantBrainwave,
        intensity: sensors.galvanicSkinResponse / 15 * 100,
        spatialDistribution: 'body_mapped',
        temperatureModulation: (sensors.bodyTemperature - 98) * 10
      }
    };

    setFieldEffects(effects);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-[600px]">
        {/* Neuropod Connection Status */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              className={`w-3 h-3 rounded-full ${isNeuropodConnected ? 'bg-green-400' : 'bg-red-400'}`}
              animate={{
                scale: isNeuropodConnected ? [1, 1.2, 1] : 1,
                opacity: isNeuropodConnected ? [1, 0.7, 1] : 0.5
              }}
              transition={{
                duration: 2,
                repeat: isNeuropodConnected ? Infinity : 0
              }}
            />
            <h3 className="text-white font-medium text-sm">
              Neuropod Unified Field Controller
            </h3>
            <button
              onClick={() => setIsNeuropodConnected(!isNeuropodConnected)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isNeuropodConnected
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {isNeuropodConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
          <p className="text-white/60 text-xs">
            Multi-Modal Consciousness Interface • Sound/Light/Haptic/Visual Synthesis
          </p>
        </div>

        {isNeuropodConnected && sensorData && fieldEffects && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-4"
          >
            {/* Field Coherence Indicator */}
            <div className="text-center">
              <div className="text-xs text-white/60 mb-2">Field Coherence</div>
              <motion.div
                className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden"
                animate={{
                  boxShadow: fieldCoherence > 0.8 ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
                }}
              >
                <motion.div
                  className={`h-full ${
                    fieldCoherence > 0.8 ? 'bg-amber-400' :
                    fieldCoherence > 0.6 ? 'bg-green-400' :
                    fieldCoherence > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  animate={{ width: `${fieldCoherence * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <div className="text-xs text-amber-400 font-mono mt-1">
                {(fieldCoherence * 100).toFixed(1)}%
              </div>
            </div>

            {/* Real-time Sensor Data Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              {/* Biofeedback */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/80 font-medium mb-2">Biofeedback</div>
                <div className="space-y-1">
                  {Object.entries(sensorData.eegBands).map(([band, value]) => (
                    <div key={band} className="flex justify-between">
                      <span className="text-white/60">{band.toUpperCase()}</span>
                      <span className="text-amber-400 font-mono">{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                    <span className="text-white/60">HRV</span>
                    <span className="text-green-400 font-mono">{sensorData.heartRateVariability.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Physical Controls */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/80 font-medium mb-2">Physical Interface</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/60">Joystick XYZ</span>
                    <span className="text-blue-400 font-mono">
                      {sensorData.joystickPosition.x.toFixed(1)}, {sensorData.joystickPosition.y.toFixed(1)}, {sensorData.joystickPosition.z.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Grip L/R</span>
                    <span className="text-purple-400 font-mono">
                      {sensorData.gripPressure.left.toFixed(0)}, {sensorData.gripPressure.right.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Gesture</span>
                    <span className="text-cyan-400">{sensorData.gestureRecognition.type}</span>
                  </div>
                </div>
              </div>

              {/* Optical Tracking */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/80 font-medium mb-2">Optical Tracking</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/60">Gaze XY</span>
                    <span className="text-pink-400 font-mono">
                      {sensorData.eyeGaze.x.toFixed(0)}, {sensorData.eyeGaze.y.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Pupil</span>
                    <span className="text-orange-400 font-mono">{sensorData.pupilDilation.toFixed(1)}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Posture</span>
                    <span className="text-indigo-400 font-mono">{sensorData.bodyPosture.lean.toFixed(0)}°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Effects Status */}
            <div className="bg-gradient-to-r from-amber-400/10 to-purple-500/10 rounded-lg p-3 border border-amber-400/20">
              <div className="text-center text-xs">
                <div className="text-amber-400 font-medium mb-1">🌊 Unified Field Active</div>
                <div className="text-white/80">
                  Audio: {Object.values(fieldEffects.frequencyMapping).map(layer => layer.volume.toFixed(0)).join('/')} •
                  Light: {fieldEffects.lightingSystem.intensity.toFixed(0)}lux •
                  Haptic: {fieldEffects.hapticFeedback.intensity.toFixed(0)}% •
                  Visual: {fieldEffects.oscillatorParameters.gridDensity}×{fieldEffects.oscillatorParameters.gridDensity}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!isNeuropodConnected && (
          <div className="text-center py-8 text-white/50">
            <div className="text-sm mb-2">Neuropod Disconnected</div>
            <div className="text-xs">
              Connect to activate multi-modal consciousness interface
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
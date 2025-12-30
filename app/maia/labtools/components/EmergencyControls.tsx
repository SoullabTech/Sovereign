// @ts-nocheck
'use client';

import { useState } from 'react';
import { LabToolsService } from '../lib/LabToolsService';

interface EmergencyControlsProps {
  service: LabToolsService;
}

export function EmergencyControls({ service }: EmergencyControlsProps) {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleEmergencyStop = async () => {
    setIsEmergencyActive(true);
    setLastAction('Emergency Stop Activated');

    try {
      await service.emergencyStop();

      // Reset emergency state after 5 seconds
      setTimeout(() => {
        setIsEmergencyActive(false);
      }, 5000);
    } catch (error) {
      console.error('Emergency stop failed:', error);
      setLastAction('Emergency Stop Failed');
    }
  };

  const handleGentleTransition = async () => {
    setLastAction('Gentle Transition Initiated');

    try {
      // Implement gentle stop protocol
      await service.stopProtocol();
      console.log('🌊 Gentle transition protocol activated');
    } catch (error) {
      console.error('Gentle transition failed:', error);
      setLastAction('Gentle Transition Failed');
    }
  };

  const handleGroundingProtocol = async () => {
    setLastAction('Grounding Protocol Started');

    try {
      // Implement grounding protocol
      console.log('🌍 Grounding protocol activated');
    } catch (error) {
      console.error('Grounding protocol failed:', error);
      setLastAction('Grounding Protocol Failed');
    }
  };

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
        🚨 Emergency Override
        {isEmergencyActive && (
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        )}
      </h2>

      {isEmergencyActive && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="text-red-300 font-semibold text-sm">
            🚨 EMERGENCY PROTOCOLS ACTIVE
          </div>
          <div className="text-red-400 text-xs mt-1">
            All consciousness protocols have been safely terminated
          </div>
        </div>
      )}

      <div className="space-y-3">
        <EmergencyButton
          label="IMMEDIATE STOP"
          description="Full emergency stop - all protocols"
          action={handleEmergencyStop}
          className="bg-red-600 hover:bg-red-700 border-red-500"
          icon="🛑"
          disabled={isEmergencyActive}
        />

        <EmergencyButton
          label="Gentle Transition"
          description="Gradual protocol wind-down"
          action={handleGentleTransition}
          className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
          icon="🌊"
          disabled={isEmergencyActive}
        />

        <EmergencyButton
          label="Grounding Protocol"
          description="Earth-based stabilization"
          action={handleGroundingProtocol}
          className="bg-green-600 hover:bg-green-700 border-green-500"
          icon="🌍"
          disabled={isEmergencyActive}
        />
      </div>

      {/* Safety Checklist */}
      <div className="mt-4 pt-4 border-t border-red-500/30">
        <h3 className="text-sm font-semibold text-red-300 mb-2">Safety Checklist</h3>
        <SafetyChecklist />
      </div>

      {/* Last Action Display */}
      {lastAction && (
        <div className="mt-4 p-2 bg-black/30 rounded text-sm">
          <span className="text-gray-400">Last Action:</span>
          <span className="text-white ml-2">{lastAction}</span>
          <span className="text-gray-500 ml-2">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Emergency Contact */}
      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
        <div className="text-sm text-purple-300">
          <div className="font-semibold">Emergency Support</div>
          <div className="text-xs mt-1 space-y-1">
            <div>• Local Emergency: 911</div>
            <div>• Crisis Support: 988</div>
            <div>• Integration Support: Available 24/7</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmergencyButtonProps {
  label: string;
  description: string;
  action: () => void;
  className: string;
  icon: string;
  disabled?: boolean;
}

function EmergencyButton({
  label,
  description,
  action,
  className,
  icon,
  disabled = false
}: EmergencyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [requireConfirm, setRequireConfirm] = useState(false);

  const handleClick = () => {
    if (label === 'IMMEDIATE STOP') {
      // Require confirmation for emergency stop
      if (!requireConfirm) {
        setRequireConfirm(true);
        setTimeout(() => setRequireConfirm(false), 3000);
        return;
      }
    }

    setIsPressed(true);
    action();

    setTimeout(() => {
      setIsPressed(false);
      setRequireConfirm(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full p-3 border rounded-lg transition-all duration-200 font-semibold
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isPressed ? 'scale-95 brightness-125' : ''}
        ${requireConfirm ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div className="text-left">
            <div className="text-sm font-bold">
              {requireConfirm ? 'CONFIRM?' : label}
            </div>
            <div className="text-xs opacity-75">
              {requireConfirm ? 'Click again to confirm' : description}
            </div>
          </div>
        </div>

        {isPressed && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
    </button>
  );
}

function SafetyChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const safetyItems = [
    { id: 'breathing', label: 'Breathing is steady and natural', icon: '🫁' },
    { id: 'grounded', label: 'Feel connected to physical body', icon: '🌍' },
    { id: 'oriented', label: 'Know current time and location', icon: '🧭' },
    { id: 'supported', label: 'Support person available if needed', icon: '👥' },
    { id: 'hydrated', label: 'Water and light food available', icon: '💧' }
  ];

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const completionPercentage = (checkedItems.size / safetyItems.length) * 100;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {safetyItems.map(item => (
        <label
          key={item.id}
          className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/20"
        >
          <input
            type="checkbox"
            checked={checkedItems.has(item.id)}
            onChange={() => toggleItem(item.id)}
            className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500"
          />
          <span className="text-lg">{item.icon}</span>
          <span className={`text-sm ${
            checkedItems.has(item.id) ? 'text-green-300' : 'text-gray-300'
          }`}>
            {item.label}
          </span>
        </label>
      ))}

      {completionPercentage === 100 && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-center">
          <span className="text-green-300 text-sm">✅ Safety checklist complete</span>
        </div>
      )}
    </div>
  );
}
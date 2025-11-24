"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";

interface ProsodyDebugData {
  element?: string;
  mirrorLine?: string;
  balanceLine?: string;
  phase?: string;
  shaped?: string;
  raw?: string;
  confidence?: number;
  toneAnalysis?: {
    dominantElement?: string;
    energyLevel?: string;
    emotionalQualities?: string[];
    confidenceScore?: number;
    resistanceFlags?: {
      uncertainty?: boolean;
      defensiveness?: boolean;
      overwhelm?: boolean;
      disconnection?: boolean;
    };
    mixedTones?: {
      primary?: string;
      secondary?: string;
      ratio?: number;
    };
  };
  voiceParams?: {
    speed?: number;
    pitch?: number;
    emphasis?: number;
    warmth?: number;
  };
  contextFlags?: {
    overwhelmed?: boolean;
    uncertain?: boolean;
    stuck?: boolean;
  };
  greetingContext?: {
    sessionType?: 'first_session' | 'returning_user' | 'context_aware';
    userName?: string;
    rememberedElement?: string;
    adaptiveGreeting?: string;
  };
}

interface DebugProps extends ProsodyDebugData {
  debugData?: ProsodyDebugData;
  onClose?: () => void;
}

const elementColors = {
  fire: "text-red-500 bg-red-50 border-red-200",
  water: "text-blue-500 bg-blue-50 border-blue-200",
  earth: "text-amber-600 bg-amber-50 border-amber-200",
  air: "text-sky-500 bg-sky-50 border-sky-200",
  aether: "text-amber-500 bg-amber-50 border-amber-200",
  resistance: "text-gray-500 bg-gray-50 border-gray-200"
};

export default function ProsodyDebugOverlay(props: DebugProps) {
  const [visible, setVisible] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['flow']));

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in dev mode
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!visible) return (
    <button
      onClick={() => setVisible(true)}
      className="fixed bottom-4 right-4 px-3 py-1 text-xs rounded bg-gray-800 text-white opacity-60 hover:opacity-90"
    >
      🔍 Prosody Debug
    </button>
  );

  const element = props.element || props.debugData?.element;
  const elementClass = elementColors[element as keyof typeof elementColors] || elementColors.aether;
  const confidence = props.confidence || props.debugData?.confidence || props.debugData?.toneAnalysis?.confidenceScore || 0;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-sm">Prosody Debug</h3>
          {confidence > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
        <button 
          onClick={props.onClose || (() => setVisible(false))} 
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[550px]">
        {/* Greeting Context */}
        {props.greetingContext && (
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Greeting Context</h4>
            </div>
            <div className="text-xs space-y-1">
              <div><span className="font-medium">Session:</span> {props.greetingContext.sessionType}</div>
              {props.greetingContext.userName && (
                <div><span className="font-medium">User:</span> {props.greetingContext.userName}</div>
              )}
              {props.greetingContext.rememberedElement && (
                <div><span className="font-medium">Remembered Element:</span> {props.greetingContext.rememberedElement}</div>
              )}
              {props.greetingContext.adaptiveGreeting && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  {props.greetingContext.adaptiveGreeting}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Element Detection */}
        {element && (
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Element Detected</h4>
            </div>
            <div className={`px-3 py-2 rounded-lg border ${elementClass} text-sm font-medium`}>
              {element.toUpperCase()}
            </div>
          </div>
        )}

        {/* Mirror → Balance Flow */}
        <div className="border-b">
          <button
            onClick={() => toggleSection('flow')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <h4 className="font-medium text-sm">Mirror → Balance Flow</h4>
            {expandedSections.has('flow') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedSections.has('flow') && (
            <div className="px-3 pb-3 space-y-2">
              {(props.mirrorLine || props.debugData?.mirrorLine) && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">MIRROR</div>
                  <div className="text-sm p-2 bg-blue-50 border-l-2 border-blue-300 rounded">
                    {props.mirrorLine || props.debugData?.mirrorLine}
                  </div>
                </div>
              )}
              {(props.balanceLine || props.debugData?.balanceLine) && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">BALANCE</div>
                  <div className="text-sm p-2 bg-green-50 border-l-2 border-green-300 rounded">
                    {props.balanceLine || props.debugData?.balanceLine}
                  </div>
                </div>
              )}
              {(props.phase || props.debugData?.phase) && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">PHASE</div>
                  <div className="text-sm p-2 bg-amber-50 border-l-2 border-amber-300 rounded">
                    {props.phase || props.debugData?.phase}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tone Analysis */}
        {props.debugData?.toneAnalysis && (
          <div className="border-b">
            <button
              onClick={() => toggleSection('analysis')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <h4 className="font-medium text-sm">Tone Analysis</h4>
              {expandedSections.has('analysis') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSections.has('analysis') && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Energy Level:</span>
                    <div className="font-medium">{props.debugData.toneAnalysis.energyLevel}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <div className="font-medium">{Math.round((props.debugData.toneAnalysis.confidenceScore || 0) * 100)}%</div>
                  </div>
                </div>
                
                {props.debugData.toneAnalysis.emotionalQualities && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Emotional Qualities:</div>
                    <div className="flex flex-wrap gap-1">
                      {props.debugData.toneAnalysis.emotionalQualities.map((quality, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {quality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {props.debugData.toneAnalysis.mixedTones && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mixed Tones:</div>
                    <div className="text-xs p-2 bg-orange-50 rounded">
                      {props.debugData.toneAnalysis.mixedTones.primary} + {props.debugData.toneAnalysis.mixedTones.secondary}
                      <span className="ml-2 text-gray-500">
                        ({Math.round((props.debugData.toneAnalysis.mixedTones.ratio || 0) * 100)}% primary)
                      </span>
                    </div>
                  </div>
                )}

                {props.debugData.toneAnalysis.resistanceFlags && Object.values(props.debugData.toneAnalysis.resistanceFlags).some(Boolean) && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Resistance Flags:</div>
                    <div className="space-y-1">
                      {Object.entries(props.debugData.toneAnalysis.resistanceFlags).map(([flag, value]) => (
                        value && (
                          <div key={flag} className="text-xs px-2 py-1 bg-yellow-50 border border-yellow-200 rounded">
                            {flag}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Voice Parameters */}
        {props.debugData?.voiceParams && (
          <div className="border-b">
            <button
              onClick={() => toggleSection('voice')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <h4 className="font-medium text-sm">Voice Parameters</h4>
              {expandedSections.has('voice') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSections.has('voice') && (
              <div className="px-3 pb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Speed:</span>
                    <div className="font-medium">{props.debugData.voiceParams.speed?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Pitch:</span>
                    <div className="font-medium">{props.debugData.voiceParams.pitch?.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Emphasis:</span>
                    <div className="font-medium">{props.debugData.voiceParams.emphasis?.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Warmth:</span>
                    <div className="font-medium">{props.debugData.voiceParams.warmth?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Raw vs Shaped */}
        {((props.raw || props.debugData?.raw) || (props.shaped || props.debugData?.shaped)) && (
          <div className="border-b">
            <button
              onClick={() => toggleSection('text')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <h4 className="font-medium text-sm">Text Processing</h4>
              {expandedSections.has('text') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expandedSections.has('text') && (
              <div className="px-3 pb-3 space-y-2">
                {(props.raw || props.debugData?.raw) && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">RAW</div>
                    <div className="text-xs p-2 bg-gray-50 border rounded font-mono">
                      {props.raw || props.debugData?.raw}
                    </div>
                  </div>
                )}
                {(props.shaped || props.debugData?.shaped) && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">SHAPED</div>
                    <div className="text-xs p-2 bg-green-50 border border-green-200 rounded">
                      {props.shaped || props.debugData?.shaped}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
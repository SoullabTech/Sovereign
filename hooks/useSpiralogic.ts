import { useState, useEffect, useCallback } from 'react';
import { spiralogicOrchestrator, SpiralogicEvent } from '@/lib/spiralogic/integration/SpiralogicOrchestrator';
import { Element, ElementalState } from '@/lib/spiralogic/core/elementalOperators';
import { SpiralState } from '@/lib/spiralogic/core/spiralProcess';
import { MaiaResponse } from '@/lib/spiralogic/agents/MaiaAgent';
import { FractalPattern } from '@/lib/spiralogic/core/fractalRecursion';

interface UseSpiralogicReturn {
  // States
  elementalState: ElementalState | null;
  spiralState: SpiralState | null;
  currentElement: Element;
  maiaResponse: MaiaResponse | null;
  fractalPattern: FractalPattern | null;
  isProcessing: boolean;
  sessionInsights: any;
  
  // Actions
  processInput: (input: string) => Promise<void>;
  changeElement: (element: Element) => void;
  clearSession: () => void;
  exportSession: () => string;
  importSession: (data: string) => void;
  
  // Events
  events: SpiralogicEvent[];
}

export function useSpiralogic(userId: string): UseSpiralogicReturn {
  // Core states
  const [elementalState, setElementalState] = useState<ElementalState | null>(null);
  const [spiralState, setSpiralState] = useState<SpiralState | null>(null);
  const [currentElement, setCurrentElement] = useState<Element>('Fire');
  const [maiaResponse, setMaiaResponse] = useState<MaiaResponse | null>(null);
  const [fractalPattern, setFractalPattern] = useState<FractalPattern | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionInsights, setSessionInsights] = useState<any>(null);
  const [events, setEvents] = useState<SpiralogicEvent[]>([]);
  
  // Initialize session and subscribe to events
  useEffect(() => {
    const session = spiralogicOrchestrator.getOrCreateSession(userId);
    setElementalState(session.elementalState);
    setSpiralState(session.spiralState);
    setCurrentElement(session.currentElement);
    
    // Subscribe to events
    const handleEvent = (event: SpiralogicEvent) => {
      setEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events
      
      // Update local state based on events
      if (event.type === 'element_change') {
        setCurrentElement(event.data.element);
      }
      
      // Update insights on key events
      if (['breakthrough', 'evolution', 'spiral_step'].includes(event.type)) {
        const insights = spiralogicOrchestrator.generateSessionInsights(userId);
        setSessionInsights(insights);
      }
    };
    
    spiralogicOrchestrator.addEventListener(handleEvent);
    
    return () => {
      spiralogicOrchestrator.removeEventListener(handleEvent);
    };
  }, [userId]);
  
  // Process user input
  const processInput = useCallback(async (input: string) => {
    setIsProcessing(true);
    try {
      const result = await spiralogicOrchestrator.processInput(userId, input);
      
      setMaiaResponse(result.response);
      setElementalState(result.elementalState);
      setSpiralState(result.spiralState);
      
      if (result.fractalPattern) {
        setFractalPattern(result.fractalPattern);
      }
      
      // Generate fresh insights
      const insights = spiralogicOrchestrator.generateSessionInsights(userId);
      setSessionInsights(insights);
      
    } catch (error) {
      console.error('Error processing Spiralogic input:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [userId]);
  
  // Change element
  const changeElement = useCallback((element: Element) => {
    spiralogicOrchestrator.changeElement(userId, element);
    setCurrentElement(element);
  }, [userId]);
  
  // Clear session
  const clearSession = useCallback(() => {
    spiralogicOrchestrator.clearSession(userId);
    setElementalState(null);
    setSpiralState(null);
    setMaiaResponse(null);
    setFractalPattern(null);
    setSessionInsights(null);
    setEvents([]);
  }, [userId]);
  
  // Export session
  const exportSession = useCallback(() => {
    return spiralogicOrchestrator.exportSession(userId);
  }, [userId]);
  
  // Import session
  const importSession = useCallback((data: string) => {
    spiralogicOrchestrator.importSession(data);
    const session = spiralogicOrchestrator.getOrCreateSession(userId);
    setElementalState(session.elementalState);
    setSpiralState(session.spiralState);
    setCurrentElement(session.currentElement);
  }, [userId]);
  
  return {
    elementalState,
    spiralState,
    currentElement,
    maiaResponse,
    fractalPattern,
    isProcessing,
    sessionInsights,
    processInput,
    changeElement,
    clearSession,
    exportSession,
    importSession,
    events
  };
}
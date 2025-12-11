/**
 * SessionScreen.tsx
 * Complete consciousness session management interface
 * Provides guided sessions, timer, FCI tracking, and session analytics
 *
 * Created: December 8, 2025
 * Purpose: Full-featured mobile consciousness session interface
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useField } from '../contexts/FieldContext';
import { Element, Archetype, SessionType } from '../types';

const { width, height } = Dimensions.get('window');

export default function SessionScreen(): JSX.Element {
  const consciousness = useConsciousness();
  const field = useField();

  // Session state
  const [showSessionSetup, setShowSessionSetup] = useState(false);
  const [selectedType, setSelectedType] = useState<SessionType>('personal_alchemy');
  const [selectedElement, setSelectedElement] = useState<Element>('aether');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('mystic');
  const [selectedDuration, setSelectedDuration] = useState(1200); // 20 minutes default

  // Timer and animation state
  const [sessionTimer, setSessionTimer] = useState(0);
  const [fciHistory, setFciHistory] = useState<{ timestamp: number; value: number }[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Session types configuration
  const sessionTypes = [
    {
      type: 'personal_alchemy' as SessionType,
      name: 'Personal Alchemy',
      description: 'Transform consciousness through elemental and archetypal work',
      icon: '🧬',
      color: '#8B5CF6',
    },
    {
      type: 'elemental_attunement' as SessionType,
      name: 'Elemental Attunement',
      description: 'Deep connection with specific elemental energies',
      icon: '🔥',
      color: '#EF4444',
    },
    {
      type: 'archetype_activation' as SessionType,
      name: 'Archetype Activation',
      description: 'Embody and integrate archetypal wisdom',
      icon: '👑',
      color: '#F59E0B',
    },
    {
      type: 'field_coherence' as SessionType,
      name: 'Field Coherence',
      description: 'Synchronize with the collective consciousness field',
      icon: '🌐',
      color: '#10B981',
    },
    {
      type: 'guided_meditation' as SessionType,
      name: 'Guided Meditation',
      description: 'Structured meditation with consciousness guidance',
      icon: '🧘‍♀️',
      color: '#3B82F6',
    },
    {
      type: 'free_flow' as SessionType,
      name: 'Free Flow',
      description: 'Open consciousness exploration without structure',
      icon: '🌊',
      color: '#06B6D4',
    },
  ];

  const elements = [
    { name: 'fire' as Element, icon: '🔥', color: '#EF4444' },
    { name: 'water' as Element, icon: '💧', color: '#3B82F6' },
    { name: 'earth' as Element, icon: '🌍', color: '#10B981' },
    { name: 'air' as Element, icon: '💨', color: '#F59E0B' },
    { name: 'aether' as Element, icon: '✨', color: '#8B5CF6' },
  ];

  const archetypes = [
    { name: 'healer' as Archetype, icon: '💚', color: '#10B981' },
    { name: 'sage' as Archetype, icon: '📚', color: '#3B82F6' },
    { name: 'warrior' as Archetype, icon: '⚔️', color: '#EF4444' },
    { name: 'mystic' as Archetype, icon: '🔮', color: '#8B5CF6' },
    { name: 'builder' as Archetype, icon: '🏗️', color: '#F59E0B' },
    { name: 'visionary' as Archetype, icon: '👁️', color: '#06B6D4' },
    { name: 'guide' as Archetype, icon: '🧭', color: '#84CC16' },
  ];

  const durations = [
    { minutes: 5, seconds: 300, label: '5 min' },
    { minutes: 10, seconds: 600, label: '10 min' },
    { minutes: 15, seconds: 900, label: '15 min' },
    { minutes: 20, seconds: 1200, label: '20 min' },
    { minutes: 30, seconds: 1800, label: '30 min' },
    { minutes: 45, seconds: 2700, label: '45 min' },
    { minutes: 60, seconds: 3600, label: '1 hour' },
  ];

  // Session timer management
  useEffect(() => {
    if (consciousness.isSessionActive()) {
      startSessionTimer();
    } else {
      stopSessionTimer();
    }

    return () => stopSessionTimer();
  }, [consciousness.currentSession]);

  // Pulse animation for active sessions
  useEffect(() => {
    if (consciousness.isSessionActive()) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [consciousness.currentSession]);

  // Track FCI during session
  useEffect(() => {
    if (consciousness.isSessionActive()) {
      const interval = setInterval(async () => {
        const currentFCI = await consciousness.getCurrentFCI();
        setFciHistory(prev => [
          ...prev.slice(-19), // Keep last 20 readings
          { timestamp: Date.now(), value: currentFCI }
        ]);
      }, 10000); // Every 10 seconds

      return () => clearInterval(interval);
    }
  }, [consciousness.currentSession]);

  const startSessionTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    timerInterval.current = setInterval(() => {
      const duration = consciousness.getSessionDuration();
      setSessionTimer(Math.floor(duration));
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setSessionTimer(0);
    setFciHistory([]);
  };

  const handleStartSession = async () => {
    try {
      await consciousness.startSession(
        selectedType,
        selectedElement,
        selectedArchetype,
        selectedDuration
      );
      setShowSessionSetup(false);
    } catch (error) {
      Alert.alert('Session Error', 'Failed to start consciousness session');
    }
  };

  const handleEndSession = async () => {
    if (!consciousness.currentSession) return;

    Alert.alert(
      'End Session',
      'Are you sure you want to end your consciousness session?',
      [
        { text: 'Continue Session', style: 'cancel' },
        {
          text: 'End Session',
          onPress: async () => {
            try {
              await consciousness.endSession();
            } catch (error) {
              Alert.alert('Error', 'Failed to end session');
            }
          },
        },
      ]
    );
  };

  const handlePauseSession = () => {
    consciousness.pauseSession();
  };

  const handleResumeSession = () => {
    consciousness.resumeSession();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = (): number => {
    if (!consciousness.currentSession) return 0;
    return Math.min(sessionTimer / selectedDuration, 1);
  };

  const renderSessionSetup = () => (
    <Modal
      visible={showSessionSetup}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Session</Text>
          <TouchableOpacity onPress={() => setShowSessionSetup(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Session Type Selection */}
          <Text style={styles.sectionTitle}>Session Type</Text>
          <View style={styles.optionsGrid}>
            {sessionTypes.map((type) => (
              <TouchableOpacity
                key={type.type}
                style={[
                  styles.optionCard,
                  selectedType === type.type && { borderColor: type.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedType(type.type)}
              >
                <Text style={styles.optionIcon}>{type.icon}</Text>
                <Text style={styles.optionName}>{type.name}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Element Selection */}
          <Text style={styles.sectionTitle}>Primary Element</Text>
          <View style={styles.elementRow}>
            {elements.map((element) => (
              <TouchableOpacity
                key={element.name}
                style={[
                  styles.elementCard,
                  selectedElement === element.name && { borderColor: element.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedElement(element.name)}
              >
                <Text style={styles.elementIcon}>{element.icon}</Text>
                <Text style={[styles.elementName, { color: element.color }]}>
                  {element.name.charAt(0).toUpperCase() + element.name.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Archetype Selection */}
          <Text style={styles.sectionTitle}>Guiding Archetype</Text>
          <View style={styles.archetypeRow}>
            {archetypes.map((archetype) => (
              <TouchableOpacity
                key={archetype.name}
                style={[
                  styles.archetypeCard,
                  selectedArchetype === archetype.name && { borderColor: archetype.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedArchetype(archetype.name)}
              >
                <Text style={styles.archetypeIcon}>{archetype.icon}</Text>
                <Text style={[styles.archetypeName, { color: archetype.color }]}>
                  {archetype.name.charAt(0).toUpperCase() + archetype.name.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration Selection */}
          <Text style={styles.sectionTitle}>Session Duration</Text>
          <View style={styles.durationRow}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.seconds}
                style={[
                  styles.durationCard,
                  selectedDuration === duration.seconds && styles.durationCardSelected
                ]}
                onPress={() => setSelectedDuration(duration.seconds)}
              >
                <Text style={[
                  styles.durationLabel,
                  selectedDuration === duration.seconds && styles.durationLabelSelected
                ]}>
                  {duration.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>Begin Consciousness Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderActiveSession = () => {
    if (!consciousness.currentSession) return null;

    const progress = getSessionProgress();
    const remainingTime = Math.max(0, selectedDuration - sessionTimer);

    return (
      <View style={styles.activeSessionContainer}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>Active Session</Text>
          <Text style={styles.sessionType}>
            {sessionTypes.find(t => t.type === consciousness.currentSession?.type)?.name}
          </Text>
        </View>

        {/* Main Timer Display */}
        <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressArc,
                {
                  transform: [{ rotate: `${progress * 360}deg` }],
                }
              ]}
            />
          </View>
        </Animated.View>

        {/* Current FCI Display */}
        <View style={styles.fciContainer}>
          <Text style={styles.fciLabel}>Current FCI</Text>
          <Text style={styles.fciValue}>{field.currentFCI.toFixed(3)}</Text>

          {fciHistory.length > 1 && (
            <View style={styles.fciTrend}>
              <Text style={styles.fciTrendLabel}>Session Trend</Text>
              <View style={styles.fciGraph}>
                {fciHistory.map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.fciPoint,
                      { height: point.value * 60, backgroundColor: '#8B5CF6' }
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Session Elements */}
        <View style={styles.sessionElements}>
          <View style={styles.elementDisplay}>
            <Text style={styles.elementDisplayIcon}>
              {elements.find(e => e.name === consciousness.currentSession?.element)?.icon}
            </Text>
            <Text style={styles.elementDisplayText}>
              {consciousness.currentSession?.element}
            </Text>
          </View>
          <View style={styles.archetypeDisplay}>
            <Text style={styles.archetypeDisplayIcon}>
              {archetypes.find(a => a.name === consciousness.currentSession?.archetype)?.icon}
            </Text>
            <Text style={styles.archetypeDisplayText}>
              {consciousness.currentSession?.archetype}
            </Text>
          </View>
        </View>

        {/* Session Controls */}
        <View style={styles.sessionControls}>
          <TouchableOpacity style={styles.pauseButton} onPress={handlePauseSession}>
            <Text style={styles.controlButtonText}>⏸️ Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
            <Text style={styles.controlButtonText}>⏹️ End Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSessionHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Recent Sessions</Text>

      {consciousness.sessionHistory.length === 0 ? (
        <View style={styles.noHistoryContainer}>
          <Text style={styles.noHistoryText}>No sessions yet</Text>
          <Text style={styles.noHistorySubtext}>Start your first consciousness session above</Text>
        </View>
      ) : (
        consciousness.sessionHistory.slice(0, 5).map((session) => (
          <View key={session.id} style={styles.historyItem}>
            <View style={styles.historyItemHeader}>
              <Text style={styles.historyItemType}>
                {sessionTypes.find(t => t.type === session.type)?.name}
              </Text>
              <Text style={styles.historyItemDate}>
                {new Date(session.startTime).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.historyItemDetails}>
              <Text style={styles.historyItemElement}>
                {elements.find(e => e.name === session.element)?.icon} {session.element}
              </Text>
              <Text style={styles.historyItemArchetype}>
                {archetypes.find(a => a.name === session.archetype)?.icon} {session.archetype}
              </Text>
              <Text style={styles.historyItemDuration}>
                {formatTime(session.duration || 0)}
              </Text>
            </View>

            {session.fciAfter && session.fciBefore && (
              <View style={styles.historyItemFci}>
                <Text style={styles.historyItemFciLabel}>FCI Change:</Text>
                <Text style={[
                  styles.historyItemFciValue,
                  { color: session.fciAfter > session.fciBefore ? '#10B981' : '#EF4444' }
                ]}>
                  {((session.fciAfter - session.fciBefore) * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Consciousness Sessions</Text>
          <Text style={styles.subtitle}>
            Guided development and field attunement
          </Text>
        </View>

        {/* Active Session or Start Button */}
        {consciousness.isSessionActive() ? (
          renderActiveSession()
        ) : (
          <View style={styles.startContainer}>
            <TouchableOpacity
              style={styles.newSessionButton}
              onPress={() => setShowSessionSetup(true)}
            >
              <Text style={styles.newSessionIcon}>🧘</Text>
              <Text style={styles.newSessionText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Session History */}
        {renderSessionHistory()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Session Setup Modal */}
      {renderSessionSetup()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Start Session Container
  startContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  newSessionButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  newSessionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  newSessionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  modalClose: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginTop: 25,
    marginBottom: 15,
  },

  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },

  // Element Selection
  elementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  elementCard: {
    width: '18%',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  elementIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  elementName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Archetype Selection
  archetypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  archetypeCard: {
    width: '13%',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  archetypeIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  archetypeName: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Duration Selection
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  durationCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F3F4F6',
  },
  durationLabelSelected: {
    color: '#FFFFFF',
  },

  // Start Button
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 30,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Active Session
  activeSessionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  // Timer
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1F2937',
    borderWidth: 4,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  timerLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  progressRing: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
  },
  progressArc: {
    width: '50%',
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 104,
  },

  // FCI Display
  fciContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  fciLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  fciValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 16,
  },
  fciTrend: {
    alignItems: 'center',
  },
  fciTrendLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  fciGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 2,
  },
  fciPoint: {
    width: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 1,
  },

  // Session Elements
  sessionElements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  elementDisplay: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
  },
  archetypeDisplay: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
  },
  elementDisplayIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  archetypeDisplayIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  elementDisplayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F3F4F6',
    textTransform: 'capitalize',
  },
  archetypeDisplayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F3F4F6',
    textTransform: 'capitalize',
  },

  // Session Controls
  sessionControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 8,
  },
  endButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Session History
  historyContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHistoryText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  noHistorySubtext: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  historyItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  historyItemDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyItemElement: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyItemArchetype: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyItemDuration: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyItemFci: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  historyItemFciLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItemFciValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 30,
  },
});
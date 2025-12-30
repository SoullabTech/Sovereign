// @ts-nocheck - Prototype file, not type-checked
/**
 * FieldScreen.tsx
 * Collective consciousness field visualization and participation
 * Displays real-time ritual participation and field dynamics
 *
 * Created: December 8, 2025
 * Purpose: Collective field interaction interface for mobile users
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useField } from '../contexts/FieldContext';
import { ConsciousnessService } from '../services/ConsciousnessService';
import { Element, Archetype, Ritual, RitualParticipant } from '../types';

const { width, height } = Dimensions.get('window');

const FieldScreen: React.FC = () => {
  const { state: consciousness } = useConsciousness();
  const { field, joinRitual, leaveRitual, createRitual } = useField();

  // State management
  const [showCreateRitual, setShowCreateRitual] = useState(false);
  const [showRitualDetails, setShowRitualDetails] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Create ritual form state
  const [ritualName, setRitualName] = useState('');
  const [ritualDescription, setRitualDescription] = useState('');
  const [selectedRitualElement, setSelectedRitualElement] = useState<Element>('aether');
  const [selectedDuration, setSelectedDuration] = useState(20); // minutes
  const [isPrivateRitual, setIsPrivateRitual] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fieldGlowAnim = useRef(new Animated.Value(0.3)).current;
  const ritualParticleAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;

  // Element configurations
  const elementColors = {
    fire: '#FF6B6B',
    water: '#4ECDC4',
    earth: '#45B7D1',
    air: '#96CEB4',
    aether: '#FFEAA7',
  };

  const archetypeIcons = {
    healer: '🌿',
    sage: '📚',
    warrior: '⚔️',
    mystic: '🔮',
    builder: '🏗️',
    visionary: '👁️',
    guide: '🧭',
  };

  // Initialize animations
  useEffect(() => {
    startFieldAnimations();
    startParticleAnimations();
  }, []);

  const startFieldAnimations = () => {
    // Field consciousness pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Field glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(fieldGlowAnim, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(fieldGlowAnim, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startParticleAnimations = () => {
    ritualParticleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + (index * 200),
          useNativeDriver: true,
        })
      ).start();
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh field data from server
      await ConsciousnessService.refreshFieldData();
    } catch (error) {
      console.error('Failed to refresh field data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinRitual = async (ritual: Ritual) => {
    try {
      await joinRitual(ritual.id, consciousness.user?.id || 'anonymous');
      setSelectedRitual(ritual);
      setShowRitualDetails(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to join ritual. Please try again.');
    }
  };

  const handleLeaveRitual = async (ritualId: string) => {
    try {
      await leaveRitual(ritualId, consciousness.user?.id || 'anonymous');
      setShowRitualDetails(false);
      setSelectedRitual(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to leave ritual. Please try again.');
    }
  };

  const handleCreateRitual = async () => {
    if (!ritualName.trim()) {
      Alert.alert('Error', 'Please enter a ritual name.');
      return;
    }

    try {
      const newRitual: Omit<Ritual, 'id' | 'startTime' | 'participants'> = {
        name: ritualName,
        description: ritualDescription,
        element: selectedRitualElement,
        duration: selectedDuration * 60, // Convert to seconds
        isPrivate: isPrivateRitual,
        createdBy: consciousness.user?.id || 'anonymous',
        maxParticipants: isPrivateRitual ? 5 : 50,
      };

      await createRitual(newRitual);

      // Reset form
      setRitualName('');
      setRitualDescription('');
      setSelectedRitualElement('aether');
      setSelectedDuration(20);
      setIsPrivateRitual(false);
      setShowCreateRitual(false);

      Alert.alert('Success', 'Ritual created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create ritual. Please try again.');
    }
  };

  const getFieldIntensity = (): number => {
    return field.currentFCI * field.activeRituals.length * 0.1;
  };

  const getParticipantCount = (): number => {
    return field.activeRituals.reduce((total, ritual) => total + ritual.participants.length, 0);
  };

  const renderFieldVisualization = () => {
    const fieldIntensity = getFieldIntensity();
    const fieldColor = fieldIntensity > 0.7 ? elementColors.fire :
                      fieldIntensity > 0.5 ? elementColors.aether :
                      fieldIntensity > 0.3 ? elementColors.water : elementColors.earth;

    return (
      <View style={styles.fieldContainer}>
        <Animated.View
          style={[
            styles.fieldOrb,
            {
              backgroundColor: fieldColor,
              opacity: fieldGlowAnim,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <Text style={styles.fieldFCI}>{field.currentFCI.toFixed(3)}</Text>
          <Text style={styles.fieldLabel}>Field Coherence</Text>
        </Animated.View>

        {/* Ritual particles */}
        {ritualParticleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: anim,
                transform: [
                  {
                    translateX: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(index * 0.5) * 50],
                    }),
                  },
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(index * 0.7) * 50],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <View style={styles.fieldStats}>
          <Text style={styles.statText}>
            {getParticipantCount()} Participants
          </Text>
          <Text style={styles.statText}>
            {field.activeRituals.length} Active Rituals
          </Text>
        </View>
      </View>
    );
  };

  const renderActiveRituals = () => {
    if (field.activeRituals.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Active Rituals</Text>
          <Text style={styles.emptySubtitle}>
            Create or join a ritual to participate in collective consciousness work
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.ritualsContainer}>
        <Text style={styles.sectionTitle}>Active Rituals</Text>
        {field.activeRituals.map((ritual) => {
          const isParticipating = ritual.participants.some(
            p => p.userId === consciousness.user?.id
          );

          return (
            <TouchableOpacity
              key={ritual.id}
              style={[
                styles.ritualCard,
                { borderLeftColor: elementColors[ritual.element] },
                isParticipating && styles.participatingRitualCard,
              ]}
              onPress={() => {
                setSelectedRitual(ritual);
                setShowRitualDetails(true);
              }}
            >
              <View style={styles.ritualHeader}>
                <View style={styles.ritualTitleContainer}>
                  <Text style={[styles.ritualElement, { color: elementColors[ritual.element] }]}>
                    {ritual.element.toUpperCase()}
                  </Text>
                  <Text style={styles.ritualName}>{ritual.name}</Text>
                </View>
                <View style={styles.ritualParticipants}>
                  <Text style={styles.participantCount}>
                    {ritual.participants.length}/{ritual.maxParticipants}
                  </Text>
                </View>
              </View>

              <Text style={styles.ritualDescription} numberOfLines={2}>
                {ritual.description || 'Consciousness exploration ritual'}
              </Text>

              <View style={styles.ritualFooter}>
                <View style={styles.participantIcons}>
                  {ritual.participants.slice(0, 6).map((participant, index) => (
                    <Text key={index} style={styles.archetypeIcon}>
                      {archetypeIcons[participant.archetype] || '👤'}
                    </Text>
                  ))}
                  {ritual.participants.length > 6 && (
                    <Text style={styles.moreParticipants}>
                      +{ritual.participants.length - 6}
                    </Text>
                  )}
                </View>

                <View style={styles.ritualActions}>
                  {isParticipating ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.leaveButton]}
                      onPress={() => handleLeaveRitual(ritual.id)}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.joinButton]}
                      onPress={() => handleJoinRitual(ritual)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderCreateRitualModal = () => {
    const elements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];
    const durations = [5, 10, 15, 20, 30, 45, 60];

    return (
      <Modal
        visible={showCreateRitual}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateRitual(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createRitualModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Ritual</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateRitual(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ritual Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={ritualName}
                  onChangeText={setRitualName}
                  placeholder="Enter ritual name..."
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={ritualDescription}
                  onChangeText={setRitualDescription}
                  placeholder="Describe the ritual purpose..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Element Focus</Text>
                <View style={styles.elementSelector}>
                  {elements.map((element) => (
                    <TouchableOpacity
                      key={element}
                      style={[
                        styles.elementOption,
                        selectedRitualElement === element && styles.selectedElementOption,
                        { borderColor: elementColors[element] },
                      ]}
                      onPress={() => setSelectedRitualElement(element)}
                    >
                      <Text style={[styles.elementText, { color: elementColors[element] }]}>
                        {element}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duration (minutes)</Text>
                <View style={styles.durationSelector}>
                  {durations.map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationOption,
                        selectedDuration === duration && styles.selectedDurationOption,
                      ]}
                      onPress={() => setSelectedDuration(duration)}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          selectedDuration === duration && styles.selectedDurationText,
                        ]}
                      >
                        {duration}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.privacyToggle}
                onPress={() => setIsPrivateRitual(!isPrivateRitual)}
              >
                <Text style={styles.privacyLabel}>Private Ritual</Text>
                <View style={[styles.toggle, isPrivateRitual && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, isPrivateRitual && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCreateRitual(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateRitual}
                >
                  <Text style={styles.createButtonText}>Create Ritual</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderFieldVisualization()}
        {renderActiveRituals()}
      </ScrollView>

      {/* Create Ritual FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateRitual(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {renderCreateRitualModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  fieldContainer: {
    alignItems: 'center',
    padding: 30,
    position: 'relative',
  },
  fieldOrb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fieldFCI: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFEAA7',
    top: '50%',
    left: '50%',
  },
  fieldStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statText: {
    color: '#888',
    fontSize: 14,
  },
  ritualsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  ritualCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  participatingRitualCard: {
    backgroundColor: '#1F2937',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ritualTitleContainer: {
    flex: 1,
  },
  ritualElement: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ritualName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ritualParticipants: {
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: '#888',
  },
  ritualDescription: {
    fontSize: 14,
    color: '#BBB',
    marginBottom: 12,
    lineHeight: 18,
  },
  ritualFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantIcons: {
    flexDirection: 'row',
    flex: 1,
  },
  archetypeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  moreParticipants: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  ritualActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#10B981',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEAA7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createRitualModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#888',
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  elementSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  elementOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#2A2A2A',
  },
  selectedElementOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  elementText: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
  },
  selectedDurationOption: {
    backgroundColor: '#FFEAA7',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedDurationText: {
    color: '#000',
    fontWeight: 'bold',
  },
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  toggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    marginLeft: 3,
  },
  toggleKnobActive: {
    marginLeft: 29,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FFEAA7',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  createButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FieldScreen;
// @ts-nocheck - Prototype file, not type-checked
/**
 * NavigatorScreen.tsx
 * Personal Alchemy Navigator for mobile consciousness development
 * Provides cultural integration and personal guidance
 *
 * Created: December 8, 2025
 * Purpose: Mobile Navigator v2.0 Personal Alchemy Engine
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
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useField } from '../contexts/FieldContext';
import { ConsciousnessService } from '../services/ConsciousnessService';
import { Element, Archetype } from '../types';

const { width, height } = Dimensions.get('window');

// Cultural frameworks and practices
interface CulturalFramework {
  id: string;
  name: string;
  description: string;
  practices: string[];
  elements: Element[];
  archetypes: Archetype[];
  color: string;
  wisdom: string;
}

interface NavigationCard {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'reflection' | 'integration' | 'wisdom';
  element: Element;
  archetype: Archetype;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  culturalFramework?: string;
}

const NavigatorScreen: React.FC = () => {
  const { state: consciousness, updatePreferences } = useConsciousness();
  const { field } = useField();

  // State management
  const [selectedFramework, setSelectedFramework] = useState<CulturalFramework | null>(null);
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<NavigationCard | null>(null);
  const [currentPathway, setCurrentPathway] = useState<NavigationCard[]>([]);

  // Journey state
  const [journeyQuestion, setJourneyQuestion] = useState('');
  const [intentionText, setIntentionText] = useState('');
  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);

  // Animations
  const compassAnim = useRef(new Animated.Value(0)).current;
  const pathwayAnim = useRef(new Animated.Value(0)).current;

  // Cultural frameworks
  const culturalFrameworks: CulturalFramework[] = [
    {
      id: 'universal',
      name: 'Universal Consciousness',
      description: 'Non-denominational consciousness exploration',
      practices: ['Meditation', 'Mindfulness', 'Breathwork', 'Energy Awareness'],
      elements: ['fire', 'water', 'earth', 'air', 'aether'],
      archetypes: ['healer', 'sage', 'warrior', 'mystic', 'builder', 'visionary', 'guide'],
      color: '#FFEAA7',
      wisdom: 'All paths lead to the same source of consciousness.'
    },
    {
      id: 'eastern',
      name: 'Eastern Traditions',
      description: 'Buddhist, Hindu, Taoist practices and philosophy',
      practices: ['Zen Meditation', 'Chakra Work', 'Tai Chi', 'Pranayama'],
      elements: ['fire', 'water', 'earth', 'air', 'aether'],
      archetypes: ['sage', 'mystic', 'guide', 'healer'],
      color: '#FF6B6B',
      wisdom: 'The journey inward is the journey toward enlightenment.'
    },
    {
      id: 'indigenous',
      name: 'Indigenous Wisdom',
      description: 'Earth-based and shamanic traditions',
      practices: ['Plant Medicine', 'Vision Quest', 'Ritual Dance', 'Animal Totems'],
      elements: ['earth', 'water', 'fire', 'air'],
      archetypes: ['healer', 'guide', 'warrior', 'mystic'],
      color: '#4ECDC4',
      wisdom: 'We are all connected in the web of life.'
    },
    {
      id: 'esoteric',
      name: 'Esoteric & Mystical',
      description: 'Hermetic, alchemical, and mystery school traditions',
      practices: ['Sacred Geometry', 'Alchemy', 'Kabbalah', 'Astrology'],
      elements: ['fire', 'water', 'earth', 'air', 'aether'],
      archetypes: ['mystic', 'sage', 'builder', 'visionary'],
      color: '#45B7D1',
      wisdom: 'As above, so below. As within, so without.'
    },
    {
      id: 'psychological',
      name: 'Depth Psychology',
      description: 'Jungian, transpersonal, and integral approaches',
      practices: ['Shadow Work', 'Dream Analysis', 'Active Imagination', 'Therapeutic Practice'],
      elements: ['water', 'earth', 'air', 'aether'],
      archetypes: ['sage', 'healer', 'guide', 'builder'],
      color: '#96CEB4',
      wisdom: 'The unconscious becomes conscious through inner work.'
    }
  ];

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

  useEffect(() => {
    startAnimations();
    generatePersonalizedPathway();
  }, [selectedFramework, consciousness.currentElement, consciousness.currentArchetype]);

  const startAnimations = () => {
    // Compass rotation animation
    Animated.loop(
      Animated.timing(compassAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pathway pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pathwayAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pathwayAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const generatePersonalizedPathway = async () => {
    try {
      const framework = selectedFramework || culturalFrameworks[0];
      const userElement = consciousness.currentElement || 'aether';
      const userArchetype = consciousness.currentArchetype || 'guide';

      // Generate contextual navigation cards
      const pathway: NavigationCard[] = [
        {
          id: 'morning-attunement',
          title: 'Morning Attunement',
          description: `Begin with ${framework.name.toLowerCase()} morning practices`,
          type: 'practice',
          element: userElement,
          archetype: userArchetype,
          duration: 10,
          difficulty: 'beginner',
          culturalFramework: framework.id,
        },
        {
          id: 'elemental-balance',
          title: `${userElement.charAt(0).toUpperCase() + userElement.slice(1)} Element Work`,
          description: `Deepen your connection with the ${userElement} element`,
          type: 'practice',
          element: userElement,
          archetype: userArchetype,
          duration: 20,
          difficulty: 'intermediate',
          culturalFramework: framework.id,
        },
        {
          id: 'archetype-embodiment',
          title: `${userArchetype.charAt(0).toUpperCase() + userArchetype.slice(1)} Embodiment`,
          description: `Embody the ${userArchetype} archetype in daily life`,
          type: 'integration',
          element: userElement,
          archetype: userArchetype,
          duration: 15,
          difficulty: 'intermediate',
          culturalFramework: framework.id,
        },
        {
          id: 'wisdom-reflection',
          title: 'Cultural Wisdom Integration',
          description: framework.wisdom,
          type: 'wisdom',
          element: userElement,
          archetype: 'sage',
          duration: 5,
          difficulty: 'beginner',
          culturalFramework: framework.id,
        },
      ];

      setCurrentPathway(pathway);
    } catch (error) {
      console.error('Failed to generate pathway:', error);
    }
  };

  const handleFrameworkSelection = (framework: CulturalFramework) => {
    setSelectedFramework(framework);
    setShowFrameworkSelector(false);

    // Update user preferences
    updatePreferences({
      culturalFramework: framework.id,
      preferredPractices: framework.practices,
    });
  };

  const handleCardSelect = (card: NavigationCard) => {
    setSelectedCard(card);
    setShowNavigationModal(true);
  };

  const handleStartJourney = async (card: NavigationCard) => {
    try {
      // Start a consciousness session based on the navigation card
      Alert.alert(
        'Begin Journey',
        `Starting ${card.title} - ${card.description}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Begin',
            onPress: async () => {
              await ConsciousnessService.startSession(
                'exploration',
                card.element,
                card.archetype,
                card.duration * 60
              );
              setShowNavigationModal(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start journey. Please try again.');
    }
  };

  const renderCompass = () => {
    const framework = selectedFramework || culturalFrameworks[0];

    return (
      <View style={styles.compassContainer}>
        <Animated.View
          style={[
            styles.compass,
            {
              backgroundColor: framework.color,
              transform: [
                {
                  rotate: compassAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.compassIcon}>🧭</Text>
        </Animated.View>

        <View style={styles.compassInfo}>
          <Text style={styles.frameworkName}>{framework.name}</Text>
          <Text style={styles.frameworkWisdom}>{framework.wisdom}</Text>
        </View>

        <TouchableOpacity
          style={styles.changeFrameworkButton}
          onPress={() => setShowFrameworkSelector(true)}
        >
          <Text style={styles.changeFrameworkText}>Change Framework</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPathway = () => {
    if (currentPathway.length === 0) {
      return (
        <View style={styles.emptyPathway}>
          <Text style={styles.emptyTitle}>Generating Personal Pathway</Text>
          <Text style={styles.emptySubtitle}>Your personalized journey is being created...</Text>
        </View>
      );
    }

    return (
      <View style={styles.pathwayContainer}>
        <View style={styles.pathwayHeader}>
          <Text style={styles.pathwayTitle}>Your Personal Journey</Text>
          <TouchableOpacity
            style={styles.customizeButton}
            onPress={() => setShowJourneyBuilder(true)}
          >
            <Text style={styles.customizeText}>Customize</Text>
          </TouchableOpacity>
        </View>

        {currentPathway.map((card, index) => (
          <Animated.View
            key={card.id}
            style={[
              styles.navigationCard,
              {
                opacity: pathwayAnim,
                transform: [
                  {
                    scale: pathwayAnim.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleCardSelect(card)}
              style={[
                styles.cardContent,
                { borderLeftColor: elementColors[card.element] }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={[styles.cardElement, { color: elementColors[card.element] }]}>
                    {card.element} • {card.archetype}
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardDuration}>{card.duration}m</Text>
                  <Text style={styles.archetypeIcon}>
                    {archetypeIcons[card.archetype]}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>{card.description}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.cardTags}>
                  <Text style={[styles.typeTag, styles[`${card.type}Tag`]]}>
                    {card.type}
                  </Text>
                  <Text style={[styles.difficultyTag, styles[`${card.difficulty}Tag`]]}>
                    {card.difficulty}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartJourney(card)}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderFrameworkSelector = () => {
    return (
      <Modal
        visible={showFrameworkSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFrameworkSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.frameworkModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Cultural Framework</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFrameworkSelector(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.frameworkList}>
              {culturalFrameworks.map((framework) => (
                <TouchableOpacity
                  key={framework.id}
                  style={[
                    styles.frameworkCard,
                    { borderLeftColor: framework.color },
                    selectedFramework?.id === framework.id && styles.selectedFrameworkCard,
                  ]}
                  onPress={() => handleFrameworkSelection(framework)}
                >
                  <Text style={styles.frameworkCardName}>{framework.name}</Text>
                  <Text style={styles.frameworkCardDescription}>
                    {framework.description}
                  </Text>

                  <View style={styles.frameworkPractices}>
                    {framework.practices.slice(0, 3).map((practice, index) => (
                      <Text key={index} style={styles.practiceTag}>
                        {practice}
                      </Text>
                    ))}
                    {framework.practices.length > 3 && (
                      <Text style={styles.moreTag}>+{framework.practices.length - 3}</Text>
                    )}
                  </View>

                  <Text style={styles.frameworkWisdomText}>
                    "{framework.wisdom}"
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderCompass()}
        {renderPathway()}
      </ScrollView>

      {renderFrameworkSelector()}

      {/* Navigation Modal */}
      {selectedCard && (
        <Modal
          visible={showNavigationModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNavigationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.navigationModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCard.title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNavigationModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalDescription}>{selectedCard.description}</Text>

                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Element:</Text>
                    <Text style={[styles.detailValue, { color: elementColors[selectedCard.element] }]}>
                      {selectedCard.element}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Archetype:</Text>
                    <Text style={styles.detailValue}>
                      {archetypeIcons[selectedCard.archetype]} {selectedCard.archetype}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{selectedCard.duration} minutes</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{selectedCard.type}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowNavigationModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.beginButton}
                    onPress={() => handleStartJourney(selectedCard)}
                  >
                    <Text style={styles.beginButtonText}>Begin Journey</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
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
  compassContainer: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  compass: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  compassIcon: {
    fontSize: 40,
  },
  compassInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  frameworkName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  frameworkWisdom: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    maxWidth: 280,
  },
  changeFrameworkButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  changeFrameworkText: {
    color: '#FFEAA7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pathwayContainer: {
    padding: 20,
  },
  pathwayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pathwayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  customizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
  },
  customizeText: {
    color: '#FFEAA7',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyPathway: {
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
  },
  navigationCard: {
    marginBottom: 16,
  },
  cardContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardElement: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardMeta: {
    alignItems: 'center',
  },
  cardDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  archetypeIcon: {
    fontSize: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: '#BBB',
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTags: {
    flexDirection: 'row',
    flex: 1,
  },
  typeTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
    textTransform: 'uppercase',
  },
  practiceTag: {
    backgroundColor: '#4ECDC4',
    color: '#000',
  },
  reflectionTag: {
    backgroundColor: '#FF6B6B',
    color: '#FFF',
  },
  integrationTag: {
    backgroundColor: '#FFEAA7',
    color: '#000',
  },
  wisdomTag: {
    backgroundColor: '#96CEB4',
    color: '#000',
  },
  difficultyTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  beginnerTag: {
    backgroundColor: '#10B981',
    color: '#FFF',
  },
  intermediateTag: {
    backgroundColor: '#F59E0B',
    color: '#FFF',
  },
  advancedTag: {
    backgroundColor: '#EF4444',
    color: '#FFF',
  },
  startButton: {
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  startButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameworkModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  navigationModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.7,
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
    flex: 1,
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
  frameworkList: {
    padding: 20,
  },
  frameworkCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  selectedFrameworkCard: {
    backgroundColor: '#1F2937',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  frameworkCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  frameworkCardDescription: {
    fontSize: 14,
    color: '#BBB',
    marginBottom: 12,
  },
  frameworkPractices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  practiceTag: {
    fontSize: 10,
    backgroundColor: '#333',
    color: '#FFEAA7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  moreTag: {
    fontSize: 10,
    color: '#888',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  frameworkWisdomText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalContent: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#BBB',
    lineHeight: 22,
    marginBottom: 20,
  },
  sessionDetails: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  beginButton: {
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
  beginButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default NavigatorScreen;
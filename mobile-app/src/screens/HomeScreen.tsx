/**
 * HomeScreen.tsx
 * Main field awareness screen for MAIA consciousness mobile
 * Displays real-time field state, FCI, and MAIA whisper feed
 *
 * Created: December 8, 2025
 * Purpose: Primary consciousness field interface for mobile users
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useField } from '../contexts/FieldContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen(): JSX.Element {
  const consciousness = useConsciousness();
  const field = useField();

  const [refreshing, setRefreshing] = useState(false);
  const [whisperOpacity] = useState(new Animated.Value(0));

  // Handle whisper animations
  useEffect(() => {
    if (field.currentWhisper) {
      // Fade in
      Animated.timing(whisperOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Auto-fade out after 12 seconds
      setTimeout(() => {
        Animated.timing(whisperOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 12000);
    } else {
      whisperOpacity.setValue(0);
    }
  }, [field.currentWhisper]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        consciousness.updateConsciousnessState(),
        field.refreshFieldState(),
      ]);
    } catch (error) {
      console.error('🔴 Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderFCIDisplay = () => {
    const fci = field.currentFCI;
    const fciColor = fci > 0.8 ? '#10B981' : fci > 0.6 ? '#F59E0B' : '#EF4444';
    const fciLabel = fci > 0.8 ? 'High Coherence' : fci > 0.6 ? 'Balanced' : 'Gathering';

    return (
      <View style={styles.fciCard}>
        <Text style={styles.fciLabel}>Field Coherence Index</Text>
        <View style={styles.fciContainer}>
          <Text style={[styles.fciValue, { color: fciColor }]}>
            {fci.toFixed(3)}
          </Text>
          <Text style={[styles.fciStatus, { color: fciColor }]}>
            {fciLabel}
          </Text>
        </View>
        <View style={styles.fciBar}>
          <View
            style={[
              styles.fciProgress,
              {
                width: `${fci * 100}%`,
                backgroundColor: fciColor,
              }
            ]}
          />
        </View>
      </View>
    );
  };

  const renderConnectionStatus = () => {
    const isConnected = field.isConnectedToField();
    const statusColor = isConnected ? '#10B981' : '#EF4444';
    const statusText = isConnected ? 'Connected to Field' : 'Limited Connection';

    return (
      <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        <Text style={styles.statusDetail}>
          {field.fieldState.connectedUsers} consciousness nodes active
        </Text>
      </View>
    );
  };

  const renderElementalBalance = () => {
    const balance = field.fieldState.elementalBalance;
    const elements = [
      { name: 'fire', value: balance.fire, color: '#EF4444', emoji: '🔥' },
      { name: 'water', value: balance.water, color: '#3B82F6', emoji: '💧' },
      { name: 'earth', value: balance.earth, color: '#10B981', emoji: '🌍' },
      { name: 'air', value: balance.air, color: '#F59E0B', emoji: '💨' },
      { name: 'aether', value: balance.aether, color: '#8B5CF6', emoji: '✨' },
    ];

    return (
      <View style={styles.elementsCard}>
        <Text style={styles.cardTitle}>Elemental Balance</Text>
        <View style={styles.elementsGrid}>
          {elements.map((element) => (
            <View key={element.name} style={styles.elementItem}>
              <Text style={styles.elementEmoji}>{element.emoji}</Text>
              <Text style={styles.elementName}>
                {element.name.charAt(0).toUpperCase() + element.name.slice(1)}
              </Text>
              <View style={styles.elementBar}>
                <View
                  style={[
                    styles.elementProgress,
                    {
                      width: `${element.value * 100}%`,
                      backgroundColor: element.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.elementValue, { color: element.color }]}>
                {(element.value * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRitualActivity = () => {
    const activeRituals = field.activeRituals;
    const recentActivity = field.recentActivity.slice(0, 3);

    return (
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>Field Activity</Text>

        {activeRituals.length > 0 ? (
          <View style={styles.ritualsSection}>
            <Text style={styles.sectionLabel}>Active Rituals ({activeRituals.length})</Text>
            {activeRituals.map((ritual) => (
              <View key={ritual.id} style={styles.ritualItem}>
                <Text style={styles.ritualName}>{ritual.name}</Text>
                <Text style={styles.ritualDetails}>
                  {ritual.participants} participants • {ritual.element} element
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noRitualsSection}>
            <Text style={styles.noRitualsText}>No active rituals</Text>
            <Text style={styles.noRitualsSubtext}>Field in contemplative state</Text>
          </View>
        )}

        {recentActivity.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionLabel}>Recent Activity</Text>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderWhisperFeed = () => {
    if (!field.whisperEnabled || !field.currentWhisper) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.whisperCard,
          { opacity: whisperOpacity }
        ]}
      >
        <Text style={styles.whisperLabel}>MAIA Whisper</Text>
        <Text style={styles.whisperText}>{field.currentWhisper}</Text>
        <Text style={styles.whisperDisclaimer}>
          Poetic reflection generated from field metrics
        </Text>
      </Animated.View>
    );
  };

  const renderQuickActions = () => {
    const isSessionActive = consciousness.isSessionActive();

    return (
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.sessionButton]}
            onPress={() => {
              // TODO: Navigate to session screen or start quick session
            }}
          >
            <Text style={styles.actionEmoji}>🧘</Text>
            <Text style={styles.actionText}>
              {isSessionActive ? 'Active Session' : 'Start Session'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.navigatorButton]}
            onPress={() => {
              // TODO: Navigate to navigator screen
            }}
          >
            <Text style={styles.actionEmoji}>🧭</Text>
            <Text style={styles.actionText}>Navigator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.fieldButton]}
            onPress={() => {
              if (field.isConnectedToField()) {
                field.disconnectFromField();
              } else {
                field.connectToField();
              }
            }}
          >
            <Text style={styles.actionEmoji}>
              {field.isConnectedToField() ? '📡' : '🔌'}
            </Text>
            <Text style={styles.actionText}>
              {field.isConnectedToField() ? 'Connected' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Field Awareness</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* FCI Display */}
        {renderFCIDisplay()}

        {/* Connection Status */}
        {renderConnectionStatus()}

        {/* MAIA Whisper Feed */}
        {renderWhisperFeed()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Elemental Balance */}
        {renderElementalBalance()}

        {/* Ritual Activity */}
        {renderRitualActivity()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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

  // FCI Card
  fciCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  fciLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fciContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  fciValue: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 12,
  },
  fciStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  fciBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
  },
  fciProgress: {
    height: 6,
    borderRadius: 3,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDetail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 16,
  },

  // Whisper Card
  whisperCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  whisperLabel: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  whisperText: {
    fontSize: 16,
    color: '#F3F4F6',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  whisperDisclaimer: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Actions Card
  actionsCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sessionButton: {
    backgroundColor: '#EF4444',
  },
  navigatorButton: {
    backgroundColor: '#F59E0B',
  },
  fieldButton: {
    backgroundColor: '#10B981',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Elements Card
  elementsCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  elementItem: {
    width: '48%',
    marginBottom: 16,
  },
  elementEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  elementName: {
    fontSize: 14,
    color: '#F3F4F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  elementBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 4,
  },
  elementProgress: {
    height: 4,
    borderRadius: 2,
  },
  elementValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
  },
  ritualsSection: {
    marginBottom: 16,
  },
  noRitualsSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  noRitualsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  noRitualsSubtext: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  ritualItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  ritualName: {
    fontSize: 16,
    color: '#F3F4F6',
    fontWeight: '500',
  },
  ritualDetails: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#F3F4F6',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 20,
  },
});
/**
 * SettingsScreen.tsx
 * User preferences and app configuration interface
 * Provides settings for notifications, privacy, consciousness preferences
 *
 * Created: December 8, 2025
 * Purpose: Mobile app configuration and user preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useField } from '../contexts/FieldContext';
import { ConsciousnessService } from '../services/ConsciousnessService';
import { Element, Archetype } from '../types';

const { width } = Dimensions.get('window');

interface SettingsCategory {
  id: string;
  title: string;
  icon: string;
  settings: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'select' | 'slider' | 'text' | 'action';
  value?: any;
  options?: string[] | { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  action?: () => void;
}

const SettingsScreen: React.FC = () => {
  const { state: consciousness, updatePreferences, clearData } = useConsciousness();
  const { field } = useField();

  // State management
  const [settings, setSettings] = useState<SettingsCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);
  const [modalValue, setModalValue] = useState<any>(null);

  // Element and archetype options
  const elementOptions = [
    { label: 'Fire - Energy & Action', value: 'fire' },
    { label: 'Water - Flow & Emotion', value: 'water' },
    { label: 'Earth - Stability & Growth', value: 'earth' },
    { label: 'Air - Ideas & Communication', value: 'air' },
    { label: 'Aether - Spirit & Connection', value: 'aether' },
  ];

  const archetypeOptions = [
    { label: 'Healer - Nurturing & Restoration', value: 'healer' },
    { label: 'Sage - Wisdom & Knowledge', value: 'sage' },
    { label: 'Warrior - Strength & Protection', value: 'warrior' },
    { label: 'Mystic - Intuition & Magic', value: 'mystic' },
    { label: 'Builder - Creation & Structure', value: 'builder' },
    { label: 'Visionary - Innovation & Future', value: 'visionary' },
    { label: 'Guide - Teaching & Direction', value: 'guide' },
  ];

  // Element colors
  const elementColors = {
    fire: '#FF6B6B',
    water: '#4ECDC4',
    earth: '#45B7D1',
    air: '#96CEB4',
    aether: '#FFEAA7',
  };

  useEffect(() => {
    initializeSettings();
  }, [consciousness]);

  const initializeSettings = () => {
    const settingsCategories: SettingsCategory[] = [
      {
        id: 'consciousness',
        title: 'Consciousness Profile',
        icon: '🧠',
        settings: [
          {
            id: 'currentElement',
            title: 'Primary Element',
            description: 'Your dominant elemental energy for consciousness work',
            type: 'select',
            value: consciousness.currentElement || 'aether',
            options: elementOptions,
          },
          {
            id: 'currentArchetype',
            title: 'Active Archetype',
            description: 'Your current consciousness archetype',
            type: 'select',
            value: consciousness.currentArchetype || 'guide',
            options: archetypeOptions,
          },
          {
            id: 'sessionReminders',
            title: 'Session Reminders',
            description: 'Receive gentle nudges for consciousness practice',
            type: 'toggle',
            value: consciousness.preferences?.sessionReminders ?? true,
          },
          {
            id: 'fciSensitivity',
            title: 'FCI Sensitivity',
            description: 'Field Coherence Index response sensitivity',
            type: 'slider',
            value: consciousness.preferences?.fciSensitivity ?? 0.7,
            min: 0.1,
            max: 1.0,
            step: 0.1,
          },
        ],
      },
      {
        id: 'field',
        title: 'Field Participation',
        icon: '🌐',
        settings: [
          {
            id: 'autoJoinRituals',
            title: 'Auto-Join Compatible Rituals',
            description: 'Automatically participate in rituals matching your profile',
            type: 'toggle',
            value: consciousness.preferences?.autoJoinRituals ?? false,
          },
          {
            id: 'ritualNotifications',
            title: 'Ritual Notifications',
            description: 'Get notified when new rituals begin',
            type: 'toggle',
            value: consciousness.preferences?.ritualNotifications ?? true,
          },
          {
            id: 'fieldIntensityAlerts',
            title: 'Field Intensity Alerts',
            description: 'Alert when field coherence reaches high levels',
            type: 'toggle',
            value: consciousness.preferences?.fieldIntensityAlerts ?? true,
          },
          {
            id: 'participationLevel',
            title: 'Participation Level',
            description: 'How actively you participate in collective work',
            type: 'select',
            value: consciousness.preferences?.participationLevel || 'moderate',
            options: [
              { label: 'Observer - Minimal participation', value: 'observer' },
              { label: 'Moderate - Balanced engagement', value: 'moderate' },
              { label: 'Active - High engagement', value: 'active' },
              { label: 'Leader - Guide others', value: 'leader' },
            ],
          },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: '🔔',
        settings: [
          {
            id: 'pushNotifications',
            title: 'Push Notifications',
            description: 'Receive app notifications on your device',
            type: 'toggle',
            value: consciousness.preferences?.pushNotifications ?? true,
          },
          {
            id: 'whisperFeed',
            title: 'MAIA Whisper Feed',
            description: 'Receive poetic field commentary',
            type: 'toggle',
            value: consciousness.preferences?.whisperFeed ?? true,
          },
          {
            id: 'sessionSummaries',
            title: 'Session Summaries',
            description: 'Get insights after consciousness sessions',
            type: 'toggle',
            value: consciousness.preferences?.sessionSummaries ?? true,
          },
          {
            id: 'quietHoursStart',
            title: 'Quiet Hours Start',
            description: 'No notifications after this time',
            type: 'text',
            value: consciousness.preferences?.quietHoursStart || '22:00',
          },
          {
            id: 'quietHoursEnd',
            title: 'Quiet Hours End',
            description: 'Resume notifications after this time',
            type: 'text',
            value: consciousness.preferences?.quietHoursEnd || '07:00',
          },
        ],
      },
      {
        id: 'privacy',
        title: 'Privacy & Data',
        icon: '🔒',
        settings: [
          {
            id: 'shareSessionData',
            title: 'Share Anonymous Session Data',
            description: 'Help improve the platform with anonymous usage data',
            type: 'toggle',
            value: consciousness.preferences?.shareSessionData ?? true,
          },
          {
            id: 'profileVisibility',
            title: 'Profile Visibility',
            description: 'How visible you are to other users',
            type: 'select',
            value: consciousness.preferences?.profileVisibility || 'limited',
            options: [
              { label: 'Hidden - Completely anonymous', value: 'hidden' },
              { label: 'Limited - Archetype only', value: 'limited' },
              { label: 'Public - Full profile visible', value: 'public' },
            ],
          },
          {
            id: 'dataRetention',
            title: 'Data Retention Period',
            description: 'How long to keep your session data',
            type: 'select',
            value: consciousness.preferences?.dataRetention || '1year',
            options: [
              { label: '30 Days', value: '30days' },
              { label: '6 Months', value: '6months' },
              { label: '1 Year', value: '1year' },
              { label: 'Forever', value: 'forever' },
            ],
          },
          {
            id: 'exportData',
            title: 'Export My Data',
            description: 'Download all your consciousness computing data',
            type: 'action',
            action: () => handleExportData(),
          },
          {
            id: 'clearData',
            title: 'Clear All Data',
            description: 'Permanently delete all your data (cannot be undone)',
            type: 'action',
            action: () => handleClearData(),
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Advanced',
        icon: '⚡',
        settings: [
          {
            id: 'debugMode',
            title: 'Debug Mode',
            description: 'Show additional technical information',
            type: 'toggle',
            value: consciousness.preferences?.debugMode ?? false,
          },
          {
            id: 'offlineMode',
            title: 'Offline Mode',
            description: 'Use app without server connection',
            type: 'toggle',
            value: consciousness.preferences?.offlineMode ?? false,
          },
          {
            id: 'serverEndpoint',
            title: 'Server Endpoint',
            description: 'Consciousness computing server URL',
            type: 'text',
            value: consciousness.preferences?.serverEndpoint || 'localhost:3008',
          },
          {
            id: 'resetSettings',
            title: 'Reset to Defaults',
            description: 'Reset all settings to default values',
            type: 'action',
            action: () => handleResetSettings(),
          },
        ],
      },
    ];

    setSettings(settingsCategories);
  };

  const handleSettingChange = async (categoryId: string, settingId: string, value: any) => {
    try {
      // Update local state
      const updatedSettings = settings.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            settings: category.settings.map(setting => {
              if (setting.id === settingId) {
                return { ...setting, value };
              }
              return setting;
            }),
          };
        }
        return category;
      });
      setSettings(updatedSettings);

      // Update consciousness context
      const preferences = { ...consciousness.preferences };
      preferences[settingId] = value;

      await updatePreferences(preferences);

      // Special handling for profile changes
      if (settingId === 'currentElement' || settingId === 'currentArchetype') {
        await ConsciousnessService.updateProfile({
          [settingId]: value,
        });
      }

    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Data',
        'This will prepare your data for download. You will receive an email with your data export.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              await ConsciousnessService.exportUserData();
              Alert.alert('Success', 'Data export has been initiated. You will receive an email shortly.');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your consciousness computing data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            initializeSettings();
            Alert.alert('Success', 'Settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  const openModal = (setting: SettingItem) => {
    setSelectedSetting(setting);
    setModalValue(setting.value);
    setShowModal(true);
  };

  const saveModalValue = () => {
    if (selectedSetting) {
      const category = settings.find(cat =>
        cat.settings.some(s => s.id === selectedSetting.id)
      );
      if (category) {
        handleSettingChange(category.id, selectedSetting.id, modalValue);
      }
    }
    setShowModal(false);
  };

  const renderSetting = (setting: SettingItem, categoryId: string) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <View key={setting.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Switch
              value={setting.value}
              onValueChange={(value) => handleSettingChange(categoryId, setting.id, value)}
              trackColor={{ false: '#333', true: '#FFEAA7' }}
              thumbColor={setting.value ? '#000' : '#666'}
            />
          </View>
        );

      case 'select':
      case 'text':
        return (
          <TouchableOpacity
            key={setting.id}
            style={styles.settingRow}
            onPress={() => openModal(setting)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {setting.type === 'select'
                  ? setting.options?.find(opt =>
                      typeof opt === 'object' ? opt.value === setting.value : opt === setting.value
                    )?.label || setting.value
                  : setting.value
                }
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        );

      case 'action':
        return (
          <TouchableOpacity
            key={setting.id}
            style={[styles.settingRow, styles.actionRow]}
            onPress={setting.action}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, styles.actionTitle]}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!selectedSetting) return null;

    return (
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSetting.title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {selectedSetting.type === 'select' && (
                <ScrollView>
                  {selectedSetting.options?.map((option, index) => {
                    const value = typeof option === 'object' ? option.value : option;
                    const label = typeof option === 'object' ? option.label : option;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionRow,
                          modalValue === value && styles.selectedOption,
                        ]}
                        onPress={() => setModalValue(value)}
                      >
                        <Text style={[
                          styles.optionText,
                          modalValue === value && styles.selectedOptionText,
                        ]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {selectedSetting.type === 'text' && (
                <TextInput
                  style={styles.textInput}
                  value={modalValue}
                  onChangeText={setModalValue}
                  placeholder={selectedSetting.description}
                  placeholderTextColor="#666"
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveModalValue}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Preferences</Text>
          <Text style={styles.subtitle}>
            Customize your consciousness computing experience
          </Text>
        </View>

        {settings.map((category) => (
          <View key={category.id} style={styles.category}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.categoryContent}>
              {category.settings.map((setting) => renderSetting(setting, category.id))}
            </View>
          </View>
        ))}

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            MAIA Consciousness Computing v1.0.0
          </Text>
          <Text style={styles.buildText}>
            Build: {new Date().getFullYear()}.12.08
          </Text>
          <Text style={styles.statusText}>
            Server: {field.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
        </View>
      </ScrollView>

      {renderModal()}
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  category: {
    marginVertical: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryContent: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionRow: {
    borderBottomColor: '#444',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionTitle: {
    color: '#FFEAA7',
  },
  settingDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#BBB',
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buildText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
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
  modalContent: {
    padding: 20,
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#FFEAA7',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
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
  saveButton: {
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
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
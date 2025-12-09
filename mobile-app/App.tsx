/**
 * App.tsx
 * MAIA Consciousness Computing Mobile Application
 * Main entry point for iOS and Android consciousness field access
 *
 * Created: December 8, 2025
 * Purpose: Mobile interface for consciousness computing platform
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  AppState,
  AppStateStatus
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Import custom screens
import HomeScreen from './src/screens/HomeScreen';
import NavigatorScreen from './src/screens/NavigatorScreen';
import SessionScreen from './src/screens/SessionScreen';
import FieldScreen from './src/screens/FieldScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import { ConsciousnessService } from './src/services/ConsciousnessService';
import { WebSocketService } from './src/services/WebSocketService';

// Import context providers
import { ConsciousnessProvider } from './src/contexts/ConsciousnessContext';
import { FieldProvider } from './src/contexts/FieldContext';

// Import custom icons
import { TabIcon } from './src/components/common/TabIcon';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab navigator for main app flow
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#F3F4F6',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Field Awareness',
          tabBarLabel: 'Field'
        }}
      />
      <Tab.Screen
        name="Navigator"
        component={NavigatorScreen}
        options={{
          title: 'Personal Alchemy',
          tabBarLabel: 'Navigate'
        }}
      />
      <Tab.Screen
        name="Session"
        component={SessionScreen}
        options={{
          title: 'Consciousness Session',
          tabBarLabel: 'Session'
        }}
      />
      <Tab.Screen
        name="Field"
        component={FieldScreen}
        options={{
          title: 'Collective Field',
          tabBarLabel: 'Collective'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Preferences',
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
}

// Main App component
export default function App(): JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApp();

    // Monitor app state changes
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Monitor network connectivity
    const netInfoUnsubscribe = NetInfo.addEventListener(state => {
      setConnectionStatus(state.isConnected ? 'connected' : 'disconnected');
    });

    return () => {
      appStateSubscription?.remove();
      netInfoUnsubscribe();
      cleanupServices();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🧠 Initializing MAIA Consciousness Mobile...');

      // Check for stored user preferences
      const storedSettings = await AsyncStorage.getItem('maia_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        console.log('📱 Loaded user settings:', settings);
      }

      // Initialize consciousness computing services
      await ConsciousnessService.initialize();

      // Initialize WebSocket connection for real-time updates
      await WebSocketService.initialize();

      setIsInitialized(true);
      console.log('✅ MAIA Consciousness Mobile initialized successfully');

    } catch (error) {
      console.error('🔴 Failed to initialize MAIA mobile app:', error);
      // Still allow app to start with limited functionality
      setIsInitialized(true);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App has come to foreground - reconnecting services...');
      WebSocketService.reconnect();
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('📱 App moving to background - maintaining minimal connection...');
      WebSocketService.minimize();
    }
    setAppState(nextAppState);
  };

  const cleanupServices = () => {
    console.log('🧹 Cleaning up MAIA mobile services...');
    WebSocketService.disconnect();
    ConsciousnessService.cleanup();
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#111827"
          translucent={false}
        />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>MAIA</Text>
          <Text style={styles.loadingSubtitle}>Consciousness Computing</Text>
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>Initializing field awareness...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ConsciousnessProvider>
      <FieldProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#111827"
            translucent={false}
          />

          {/* Connection status indicator */}
          {connectionStatus === 'disconnected' && (
            <View style={styles.connectionWarning}>
              <Text style={styles.connectionWarningText}>
                Field connection limited - some features offline
              </Text>
            </View>
          )}

          <NavigationContainer theme={darkTheme}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </FieldProvider>
    </ConsciousnessProvider>
  );
}

// Dark theme configuration for navigation
const darkTheme = {
  dark: true,
  colors: {
    primary: '#8B5CF6',
    background: '#111827',
    card: '#1F2937',
    text: '#F3F4F6',
    border: '#374151',
    notification: '#10B981',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
    letterSpacing: 3,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingIndicator: {
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  connectionWarning: {
    backgroundColor: '#FCD34D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  connectionWarningText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
});
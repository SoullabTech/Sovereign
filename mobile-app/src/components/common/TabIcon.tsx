/**
 * TabIcon.tsx
 * Custom tab icons for MAIA consciousness mobile navigation
 *
 * Created: December 8, 2025
 * Purpose: Element-themed navigation icons
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

export function TabIcon({ name, focused, color, size }: TabIconProps): JSX.Element {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return focused ? '🏠' : '🏡';
      case 'Navigator':
        return focused ? '🧭' : '⚡';
      case 'Session':
        return focused ? '🧘‍♀️' : '🧘';
      case 'Field':
        return focused ? '🌐' : '🌍';
      case 'Settings':
        return focused ? '⚙️' : '🔧';
      default:
        return '⭕';
    }
  };

  const getElementalColor = () => {
    switch (name) {
      case 'Home': return '#8B5CF6'; // Purple - Aether
      case 'Navigator': return '#F59E0B'; // Amber - Air
      case 'Session': return '#EF4444'; // Red - Fire
      case 'Field': return '#10B981'; // Emerald - Water
      case 'Settings': return '#6B7280'; // Gray - Earth
      default: return color;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: focused ? getElementalColor() : color, fontSize: size }]}>
        {getIcon()}
      </Text>
      {focused && <View style={[styles.indicator, { backgroundColor: getElementalColor() }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
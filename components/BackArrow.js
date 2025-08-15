import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BackArrow({ onPress, style, variant = 'plain' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
      style={[
        styles.base,
        variant === 'filled' ? styles.filled : styles.ghost,
        style,
      ]}
    >
      <Ionicons
        name="arrow-back"
        size={20}
        color={variant === 'filled' ? '#fff' : '#111'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  filled: {
    backgroundColor: '#10b981',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  ghost: { backgroundColor: 'transparent' },
});

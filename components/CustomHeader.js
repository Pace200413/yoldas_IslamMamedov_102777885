import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackArrow from './BackArrow';

export default function CustomHeader({ title, onBack, rightLabel, onRightPress }) {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 56; // keep your visual

  return (
    <View
      // important: let only children receive touches; avoids sibling views stealing taps
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: headerHeight,
        backgroundColor: '#fff',
        zIndex: 100,
        elevation: 10,
      }}
    >
      <View
        pointerEvents="auto"
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <BackArrow onPress={onBack} variant="filled" style={{ marginRight: 6 }} />

        <Text
          numberOfLines={1}
          style={{
            flex: 1, textAlign: 'center',
            fontSize: 17, fontWeight: '800', color: '#111827',
          }}
        >
          {title}
        </Text>

        {rightLabel ? (
          <TouchableOpacity
            hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
            onPress={onRightPress}
          >
            <Text style={{ color: '#10b981', fontWeight: '800' }}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>
    </View>
  );
}

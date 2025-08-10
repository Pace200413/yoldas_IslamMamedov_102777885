// components/BackHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackHeader({ title }) {
  const navigation = useNavigation();
  const { top }    = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: top + 6 }]}>
      <TouchableOpacity hitSlop={10} onPress={navigation.goBack} style={styles.icon}>
        <Ionicons name="arrow-back" size={24} />
      </TouchableOpacity>
      {!!title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  icon:  { marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700' },
});

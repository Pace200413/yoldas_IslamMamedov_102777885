// components/BottomNav.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Ionicons name="people" size={24} color="black" />
        <Text style={styles.label}>Activity</Text>
      </View>
      <View style={styles.item}>
        <Ionicons name="wallet" size={24} color="black" />
        <Text style={styles.label}>Finance</Text>
      </View>
      <View style={styles.item}>
        <Ionicons name="chatbubbles" size={24} color="black" />
        <Text style={styles.label}>Messages</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  item: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});

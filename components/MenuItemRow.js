// components/MenuItemRow.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';

export default function MenuItemRow({ item, onPress, onDelete }) {
  const right = () => (
    <TouchableOpacity style={styles.delete} onPress={onDelete}>
      <Feather name="trash-2" size={20} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={right}>
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.name}
            {!item.available && ' (❌)'}
          </Text>
          <Text style={styles.desc}>{item.description || ' '}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {item.discount > 0 && (
            <Text style={styles.discount}>-{item.discount}%</Text>
          )}
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  name: { fontWeight: '600', fontSize: 16 },
  desc: { color: '#666', fontSize: 12 },
  price: { fontWeight: '600', marginTop: 4 },
  discount: { color: '#10b981', fontSize: 12 },
  delete: {
    width: 70,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

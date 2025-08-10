import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';

export default function SwipeableCartItem({ data, onQtyPlus, onQtyMinus, onDelete }) {
  /* right swipe actions */
  const renderRightActions = (_, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.deleteBox} onPress={onDelete}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <AntDesign name="delete" size={24} color="#fff" />
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.row}>
        <Text style={{ flex: 1 }} numberOfLines={1}>
          {data.name}
        </Text>
        <Text style={styles.price}>RM {(data.price * data.qty).toFixed(2)}</Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', padding: 14 },
  deleteBox: { backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', width: 80 },
  price:  { minWidth: 80, textAlign: 'right', fontWeight: '500' },
});

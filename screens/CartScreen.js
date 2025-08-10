// screens/CartScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';

import BackHeader from '../components/BackHeader';
import CartItem   from '../components/CartItem';
import { useCart }  from '../context/CartContext';
import { useOrder } from '../context/OrderContext';

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://192.168.0.5:4000';

export default function CartScreen({ route }) {
  const navigation                       = useNavigation();
  const { items, total, add, remove, clear } = useCart();
  const { dispatch }                     = useOrder();
  const [blast, setBlast]                = useState(false);

  // Swipe-to-delete renderer
  const renderRight = useCallback(
    (line) => (_progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });
      return (
        <RectButton style={styles.deleteBox} onPress={() => remove(line.id, line.customizations)}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <AntDesign name="delete" size={22} color="#fff" />
          </Animated.View>
        </RectButton>
      );
    },
    [remove]
  );

  // Render each cart row
  const renderItem = useCallback(
    ({ item }) => (
      <Swipeable renderRightActions={renderRight(item.id)}>
        <CartItem
          dealName={item.name}
          dealPrice={Number(item.price)}
          quantity={item.qty}
          image={item.photo}
          addQuantity={() => add(item)}
          removeQuantity={() => remove(item.id, item.customizations)}
        />
      </Swipeable>
    ),
    [add, remove, renderRight]
  );

  // Checkout handler: POST to /api/orders then clear
  const handleCheckout = async () => {
    console.log('Checkout pressed', { items, total, restaurantId: route.params.restaurantId });
    if (items.length === 0) return;

    const payload = {
    restaurantId: route.params.restaurantId,
    items: items.map(i => ({
      id:   i.id,
      qty:  i.qty ?? 1,   // ← fall back to 1 if undefined
      price: Number(i.price),
      customizations: i.customizations || []
    })),
    totalAmount:    total,
    customerName:   'Test User',
    customerAddress:'Test Address',
  };

    try {
      await axios.post(`${API_BASE}/api/orders`, payload);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error || 'Could not place order';
      console.error('Checkout failed:', status, message);
      return Alert.alert('Error', message);
    }

    dispatch({ type: 'PLACE', payload: { items, total } });
    clear();
    setBlast(true);
    setTimeout(() => {
      setBlast(false);
      navigation.navigate('OrderStatus');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackHeader title="Cart" />
      <View style={styles.listWrapper}>
        <FlatList
          data={items}
          keyExtractor={(i, idx) => i.lineKey ?? `${i.id}-${idx}`}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Cart is empty.</Text>
          }
          ListFooterComponent={() =>
            items.length > 0 && (
              <RectButton
                style={styles.tipRow}
                onPress={() => Alert.alert('Tip selector coming soon!')}
              >
                <Text style={{ flex: 1 }}>💖  Add a tip</Text>
                <AntDesign name="right" size={16} />
              </RectButton>
            )
          }
          contentContainerStyle={{ 
            paddingHorizontal: 20,
            paddingBottom: styles.footer.height + 20 // ensure list scrolls above footer
          }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: RM {total.toFixed(2)}</Text>
        <TouchableOpacity
          disabled={items.length === 0}
          style={[
            styles.checkout,
            { opacity: items.length === 0 ? 0.4 : 1 },
          ]}
          onPress={handleCheckout}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {items.length === 0 ? 'Cart is empty' : 'Checkout'}
          </Text>
        </TouchableOpacity>
      </View>

      {blast && <ConfettiCannon count={70} origin={{ x: 200, y: 0 }} fadeOut />}
    </SafeAreaView>
  );
}

const FOOTER_HEIGHT = 100;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  listWrapper: { flex: 1 },

  separator: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
  empty:     { textAlign: 'center', marginTop: 40, color: '#9ca3af' },

  deleteBox: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },

  tipRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    height: FOOTER_HEIGHT,
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  total:  { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  checkout:{
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});

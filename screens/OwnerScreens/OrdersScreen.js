// screens/OwnerScreens/OrdersScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://192.168.0.5:4000';

export default function OrdersScreen({ route }) {
  const { restaurantId } = route.params;
  const navigation       = useNavigation();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/orders/restaurant/${restaurantId}`
        );
        setOrders(data);
      } catch (err) {
        console.warn('Menu fetch error:', err.message, err.config?.url, err.code);
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <Text style={styles.title}>Order #{item.id}</Text>
      <Text>
        { /* use either a count field or length of items array */ }
        {item.itemsCount != null
          ? item.itemsCount
          : Array.isArray(item.items)
          ? item.items.length
          : '—'}{' '}
        item(s) – TMT {Number(item.total ?? 0).toFixed(2)}
      </Text>
      <Text>Status: {item.status || '—'}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => String(o.id)}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>No orders yet.</Text>
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9ca3af',
  },
});

// screens/TestScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:4000'
  : 'http://192.168.0.27:4000';

export default function TestScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/owners/restaurants`);
        console.log('Fetched restaurants:', data);
        setRestaurants(data);
      } catch (error) {
        console.error('TestScreen fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading restaurants…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={restaurants}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.rName}</Text>
          <Text style={styles.subtitle}>{item.loc} • {item.cuisine}</Text>
          <Text style={styles.subtitle}>Approved: {item.approved ? 'Yes' : 'No'}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No restaurants found</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#ddd' },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { color: '#555' },
  empty: { padding: 16, textAlign: 'center' },
});

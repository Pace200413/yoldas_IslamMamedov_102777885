// screens/OwnerScreens/StockScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://172.17.0.48:4000';

export default function StockScreen({ route }) {
  const { restaurantId } = route.params;
  const [meals, setMeals] = useState(null);

  /** fetch once */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/menu/restaurants/${restaurantId}/meals`
        );
        setMeals(data.flatMap((s) => s.items));
      } catch {
        Alert.alert('Error', 'Could not load stock list');
        setMeals([]);
      }
    })();
  }, [restaurantId]);

  /** toggle out-of-stock on the server */
  const toggle = async (id) => {
    // find current and invert
    const current = meals.find((m) => m.id === id)?.outOfStock ?? false;
    const nextVal = !current;

    try {
      await axios.patch(
        `${API_BASE}/api/menu/meals/${id}`,
        { outOfStock: nextVal }
      );
      setMeals((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, outOfStock: nextVal } : m
        )
      );
    } catch {
      Alert.alert('Error', 'Could not update stock status');
    }
  };

  if (meals === null) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={meals}
      keyExtractor={(m) => String(m.id)}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{item.name}</Text>
          <Switch
            value={!item.outOfStock}
            onValueChange={() => toggle(item.id)}
            thumbColor="#fff"
            trackColor={{ false: '#ef4444', true: '#10b981' }}
          />
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          No items yet.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

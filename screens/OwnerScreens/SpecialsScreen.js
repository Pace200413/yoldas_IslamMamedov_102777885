// screens/OwnerScreens/SpecialsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Platform
} from 'react-native';
import axios from 'axios';

const API =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.5:4000';

export default function SpecialsScreen({ route }) {
  const [meals, setMeals] = useState(null);
  const { restaurantId } = route.params;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/menu/restaurants/${restaurantId}/meals`);
        setMeals(data.flatMap((s) => s.items));
      } catch {
        setMeals([]);
      }
    })();
  }, [restaurantId]);

  const setDiscount = async (id, discount) => {
    try {
      await axios.patch(`${API}/api/menu/meals/${id}`, { discount });
      setMeals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, discount } : m))
      );
    } catch {
      Alert.alert('Error', 'Could not save discount');
    }
  };

  if (meals === null) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={meals}
      keyExtractor={(m) => String(m.id)}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{item.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="%"
            keyboardType="number-pad"
            defaultValue={item.discount ? String(item.discount) : ''}
            onEndEditing={({ nativeEvent }) =>
              setDiscount(item.id, Number(nativeEvent.text) || 0)
            }
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection:'row', alignItems:'center', marginBottom:12 },
  input: { width:60, borderWidth:1, borderColor:'#ddd', borderRadius:6, padding:6, textAlign:'center' },
});

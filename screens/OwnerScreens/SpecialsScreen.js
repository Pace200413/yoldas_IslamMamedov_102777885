// screens/OwnerScreens/SpecialsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Platform
} from 'react-native';
import axios from 'axios';

const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function SpecialsScreen({ route }) {
  const { restaurantId } = route.params;
  const [meals, setMeals] = useState(null); // flat list of items

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/menu/restaurants/${restaurantId}/meals`);
      setMeals(data.flatMap(s => s.items));
    } catch (e) {
      console.warn('Specials load error', e.message);
      setMeals([]);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const setDiscount = async (id, discount) => {
    try {
      await axios.patch(`${API_BASE}/api/menu/meals/${id}`, { discount });
      setMeals(prev => prev.map(m => (m.id === id ? { ...m, discount } : m)));
    } catch (e) {
      Alert.alert('Error', 'Could not save discount');
    }
  };

  if (meals === null) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const render = ({ item }) => {
    const raw = Number(item.price) || 0;
    const d   = Number(item.discount) || 0;
    const newPrice = d > 0 ? raw * (1 - d / 100) : raw;

    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.preview}>
            {d > 0
              ? `TMT ${raw.toFixed(2)} → TMT ${newPrice.toFixed(2)} (-${d}%)`
              : `TMT ${raw.toFixed(2)}`}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="%"
          keyboardType="number-pad"
          defaultValue={d ? String(d) : ''}
          onEndEditing={({ nativeEvent }) => {
            const clamp = Math.max(0, Math.min(90, Math.round(Number(nativeEvent.text) || 0)));
            setDiscount(item.id, clamp);
          }}
        />

        <TouchableOpacity
          style={[styles.clearBtn, { opacity: d ? 1 : 0.4 }]}
          disabled={!d}
          onPress={() => setDiscount(item.id, 0)}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={meals}
      keyExtractor={(m) => String(m.id)}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderItem={render}
      ListEmptyComponent={<Text style={{ textAlign:'center', marginTop:20, color:'#9ca3af' }}>No items yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff', padding:12, borderRadius:10 },
  name:{ fontWeight:'600', fontSize:15 },
  preview:{ marginTop:4, color:'#6b7280', fontSize:12 },
  input:{ width:64, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, textAlign:'center', marginHorizontal:8 },
  clearBtn:{ backgroundColor:'#ef4444', paddingVertical:10, paddingHorizontal:12, borderRadius:8 },
});

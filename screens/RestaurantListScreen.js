import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { useDebounce } from 'use-debounce';   //  ➜  npm i use-debounce

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'      // Android emulator bridge
    : 'http://192.168.0.5:4000';  // iOS / device-LAN

export default function RestaurantListScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [searchRaw,   setSearchRaw]   = useState('');
  const [search]                    = useDebounce(searchRaw, 250);
  const [loading,      setLoading]     = useState(true);

  /* ── fetch once ────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/restaurants`);
        setRestaurants(data);
      } catch (err) {
        console.error('Fetch restaurants failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} />;

  /* ── filter by name ────────────────────────────── */
  const filtered = restaurants.filter(r =>
    r.rName.toLowerCase().includes(search.trim().toLowerCase())
  );

  /* ── row renderer ──────────────────────────────── */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RestaurantProfile', { restaurant: item })}
      activeOpacity={0.85}
    >
      <Text style={styles.name}>{item.rName}</Text>

      {/* hours */}
      <Text style={styles.hours}>
        {item.opens ?? '—'} – {item.closes ?? '—'}
      </Text>

      {/* rating */}
      <View style={styles.ratingRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <AntDesign
            key={i}
            name={i < Math.round(item.rating ?? 0) ? 'star' : 'staro'}
            size={12}
            color="#facc15"
          />
        ))}
        <Text style={styles.ratingTxt}>
          {item.rating != null ? Number(item.rating).toFixed(1) : '—'}
        </Text>
      </View>

      {/* distance – only when API sends it */}
      {item.distance_km != null && (
        <Text style={styles.distance}>{item.distance_km.toFixed(1)} km</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search restaurants…"
        value={searchRaw}
        onChangeText={setSearchRaw}
        style={styles.searchInput}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No restaurants found.</Text>}
      />
    </View>
  );
}

/* ── styles ─────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  searchInput: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    elevation: 2,
  },
  name:   { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  hours:  { fontSize: 12, color: '#555', marginBottom: 6 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingTxt: { fontSize: 11, color: '#555', marginLeft: 4 },

  distance: { fontSize: 12, color: '#555' },
  empty:    { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
});

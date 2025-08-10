import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function OwnerHomeScreen() {
  const nav = useNavigation();
  const { ownerId, restaurantName } = useRoute().params;

  const [myRestaurants, setMyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://192.168.0.5:4000'; // <-- Update to match your backend IP

  // Fetch owner's restaurants
  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/owners/${ownerId}/restaurants`
      );
      setMyRestaurants(data);
    } catch (err) {
      console.error('Owner fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [ownerId]);

  // Update restaurant image
  const updateRestaurantPhoto = async (restaurantId) => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return alert('Permission to access gallery is required!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true,
      quality: 0.3,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

      await axios.put(`${API_BASE}/api/restaurants/${restaurantId}/photo`, {
        photo: base64Image,
      });

      fetchRestaurants(); // Refresh list
    }
  } catch (err) {
    console.error('Photo update error:', err);
    alert('Failed to update photo.');
  }
};

  const renderStore = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => nav.navigate('StoreDetail', { store: item })}
    >
      <Image
        source={
          item.photo ? { uri: item.photo } : require('../../assets/icons/all.jpg')
        }
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.rName}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.loc}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterText}>{item.cuisine}</Text>
          <Text style={styles.cardFooterText}>
            {item.approved ? 'Live' : 'Pending'}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => updateRestaurantPhoto(item.id)}>
        <Feather name="edit-2" size={18} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.openDrawer()}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.greeting}>Hello, {restaurantName}</Text>

        <TouchableOpacity style={styles.switchBtn} onPress={() => nav.navigate('NewHome')}>
          <Ionicons name="eye" size={24} color="#000" />
        </TouchableOpacity>

        <Image
          source={require('../../assets/icons/profile.jpeg')}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.sectionTitle}>My Restaurants</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={myRestaurants}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderStore}
          ListEmptyComponent={
            <Text style={styles.empty}>No restaurants yet.</Text>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* add button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          nav.navigate('OwnerRestaurantSetup', {
            owner: { ownerId, restaurantName },
          })
        }
      >
        <Feather name="plus-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Restaurant</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  greeting: { fontSize: 20, fontWeight: '700' },
  switchBtn: { padding: 8, marginHorizontal: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },

  sectionTitle: { marginLeft: 16, marginTop: 12, fontSize: 18, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#666', marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFooterText: { fontSize: 12, color: '#999' },

  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  addButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});

// screens/OwnerScreens/RestaurantMenuScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

import { useCart } from '../../context/CartContext';
import MealItem from '../../components/MealItem';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function RestaurantMenuScreen({ route }) {
  const nav    = useNavigation();
  const insets = useSafeAreaInsets();
  const { total, items: cartItems } = useCart();

  // Accept either { restaurant } or { restaurantId }
  const { restaurant: initialRestaurant, restaurantId: initialId } = route?.params ?? {};

  const [restaurant, setRestaurant] = useState(initialRestaurant || null);
  const [sections, setSections]     = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(!initialRestaurant && !!initialId);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [active, setActive] = useState('Food');

  // If only an id was provided, fetch the restaurant details first
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (restaurant || !initialId) return;       // already have object or no id
      try {
        setLoadingInfo(true);
        const { data } = await axios.get(`${API_BASE}/api/restaurants/${initialId}`);
        if (!cancelled) setRestaurant(data);
      } catch (e) {
        if (!cancelled) setRestaurant(null);
      } finally {
        if (!cancelled) setLoadingInfo(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initialId, restaurant]);

  // Load menu once we know the id (from object or param)
  useEffect(() => {
    let cancelled = false;
    const id = restaurant?.id || initialId;
    if (!id) return;
    (async () => {
      try {
        setLoadingMenu(true);
        const { data } = await axios.get(`${API_BASE}/api/menu/restaurants/${id}/meals`);
        if (!cancelled) setSections(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setSections([]);
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    })();
    return () => { cancelled = true; };
  }, [restaurant?.id, initialId]);

  // Loading / empty states
  if (loadingInfo) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!restaurant && !initialId) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Restaurant data missing.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* hero */}
        <View style={styles.heroWrap}>
          <Image
            source={restaurant?.photo ? { uri: restaurant.photo } : require('../../assets/icons/la-casa-logo.jpg')}
            style={styles.heroImg}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.heroFade} />
          <TouchableOpacity onPress={nav.goBack} style={[styles.iconCircle, { left: 16, top: insets.top + 6 }]}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* info */}
        <View style={styles.infoCard}>
          <Image
            source={restaurant?.photo ? { uri: restaurant.photo } : require('../../assets/icons/la-casa-logo.jpg')}
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.nameTxt}>{restaurant?.rName ?? 'Restaurant'}</Text>
            <Text style={styles.infoTxt}>⭐ {restaurant?.rating ?? '—'} • {restaurant?.cuisine ?? ''}</Text>
          </View>
        </View>

        {/* chips */}
        <View style={styles.chipRow}>
          {['Food', 'Drinks'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, active === opt && styles.chipActive]}
              onPress={() => setActive(opt)}
            >
              <Text style={[styles.chipTxt, active === opt && styles.chipTxtActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* menu */}
        {loadingMenu ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : sections.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="fast-food-outline" size={50} color="#9ca3af" />
            <Text style={styles.emptyTxt}>Menu coming soon…</Text>
          </View>
        ) : (
          sections
            .filter(s => s.title === active)
            .map(({ title, items }) => (
              <View key={title} style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {items?.map(item => (
                  <MealItem key={item.id} item={item} restaurantId={restaurant?.id || initialId} />
                ))}
              </View>
            ))
        )}
      </ScrollView>

      {/* cart badge */}
      {cartItems?.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => nav.navigate('Cart', { restaurantId: restaurant?.id || initialId })}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.fabTxt}>TMT {total.toFixed(2)} ▸</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  container: { paddingBottom: 80 },
  heroWrap: { width: '100%', height: 160 },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroFade: { ...StyleSheet.absoluteFillObject },
  iconCircle: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
  },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, padding: 14, borderRadius: 16, marginTop: -40,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 5,
  },
  logo: { width: 56, height: 56, borderRadius: 12, marginRight: 12 },
  nameTxt: { fontSize: 20, fontWeight: '700' },
  infoTxt: { color: '#444', marginTop: 2 },

  chipRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 24, marginHorizontal: 6, borderRadius: 18, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#10b981' },
  chipTxt: { fontSize: 13, color: '#374151' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  section: { paddingHorizontal: 16, marginTop: 26 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { color: '#9ca3af', marginTop: 8 },

  fab: {
    position: 'absolute', left: 16, right: 16, bottom: 20,
    backgroundColor: '#10b981', borderRadius: 28, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  fabTxt: { color: '#fff', fontWeight: '700' },
});

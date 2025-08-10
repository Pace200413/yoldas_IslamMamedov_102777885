import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import CategoryGrid from '../components/CategoryGrid';
import BottomNav from '../components/BottomNav';

const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.5:4000';

/* ───────────────────────── CARD ───────────────────────── */
const RestaurantCard = memo(({ item, onPress, cardWidth }) => (
  <TouchableOpacity
    style={[styles.card, { width: cardWidth }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Image
      source={
        item.photo
          ? { uri: item.photo }
          : require('../assets/icons/la-casa-logo.jpg')
      }
      style={styles.cardImg}
    />

    <Text style={styles.cardName} numberOfLines={1}>
      {item.rName}
    </Text>

    {!!item.mealsPreview?.length && (
      <View style={styles.previewRow}>
        {item.mealsPreview.map((m) => (
          <Text key={m.id} style={styles.previewTxt} numberOfLines={1}>
            • {m.name}
          </Text>
        ))}
      </View>
    )}

    <View style={styles.cardMeta}>
      <Text style={styles.metaTxt}>
        {item.distance_km ? `${item.distance_km} km` : '— km'}
      </Text>
      <Ionicons
        name="star"
        size={11}
        color="#facc15"
        style={{ marginHorizontal: 3 }}
      />
      <Text style={styles.metaTxt}>{item.rating ?? '—'}</Text>
    </View>

    {!!item.dailySpecial && (
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>{item.dailySpecial}% off</Text>
      </View>
    )}
  </TouchableOpacity>
));

/* ───────────────────────── SHIMMER ───────────────────────── */
const Shimmer = ({ width, height }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <View style={[styles.shimmerCard, { width, height }]}>
      <Animated.View
        style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}
      />
    </View>
  );
};

/* ───────────────────────── MAIN SCREEN ───────────────────────── */
export default function NewHomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const longPressFired = useRef(false);

  const COL_GAP = 14;
  const COLS = 2;
  const CARD_W =
    (Dimensions.get('window').width - COL_GAP * (COLS + 1)) / COLS;
  const CARD_H = 150;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/owners/restaurants`);
        const approved = data.filter((r) => Number(r.approved) === 1);

        const withPreviews = await Promise.all(
          approved.map(async (r) => {
            try {
              const { data: sections } = await axios.get(
                `${API_BASE}/api/menu/restaurants/${r.id}/meals`
              );
              const flat = sections.flatMap((s) => s.items);
              return { ...r, mealsPreview: flat.slice(0, 2) };
            } catch {
              return { ...r, mealsPreview: [] };
            }
          })
        );

        setRestaurants(withPreviews);
      } catch (e) {
        console.error('Failed to fetch restaurants:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>Deliver to</Text>
          <Text style={styles.location}>Ashgabat, Turkmenistan</Text>
        </View>
        <TouchableOpacity
          onPressIn={() => (longPressFired.current = false)}
          onLongPress={() => {
            longPressFired.current = true;
            navigation.navigate('AdminPanel', { screen: 'Approval' });
          }}
          delayLongPress={600}
          onPressOut={() =>
            !longPressFired.current && navigation.navigate('AccountHub')
          }
        >
          <Image
            source={require('../assets/icons/profile.jpeg')}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          placeholder="Search for food or restaurant"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {/* Categories */}
      <CategoryGrid />

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Approved restaurants</Text>

      {loading ? (
        <View style={{ flexDirection: 'row', paddingHorizontal: COL_GAP }}>
          {[...Array(COLS)].map((_, i) => (
            <Shimmer key={i} width={CARD_W} height={CARD_H} />
          ))}
        </View>
      ) : (
        <FlatList
          data={restaurants}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={{
            paddingHorizontal: COL_GAP,
            marginBottom: COL_GAP,
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <RestaurantCard
              item={item}
              onPress={() =>
                navigation.navigate('RestaurantMenu', { restaurant: item })
              }
              cardWidth={CARD_W}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyTxt}>No approved restaurants found.</Text>
          }
        />
      )}

      <BottomNav />
    </View>
  );
}

/* ───────────────────────── STYLES ───────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: { fontSize: 12, color: '#6b7280' },
  location: { fontSize: 16, fontWeight: '700' },
  profileIcon: { width: 34, height: 34, borderRadius: 17 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 42,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
    marginVertical: 10,
  },

  card: {
    marginRight: 14,
  },
  cardImg: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  cardName: { marginTop: 6, fontSize: 14, fontWeight: '600' },

  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    paddingHorizontal: 6,
  },
  previewTxt: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },

  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaTxt: { fontSize: 11, color: '#6b7280' },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#fef3c7',
  },
  badgeTxt: { fontSize: 10, color: '#b45309', fontWeight: '600' },

  emptyTxt: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },

  shimmerCard: {
    height: 150,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#e7e7e7',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

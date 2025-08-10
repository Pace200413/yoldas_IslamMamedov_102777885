import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RestaurantCard({ restaurant, onPress, width }) {
  const ratingVal = Number(restaurant.rating) || 0;

  /* simple “open now” check */
  const now = new Date();
  const [oh, om] = String(restaurant.opens ).split(':').map(Number);
  const [ch, cm] = String(restaurant.closes).split(':').map(Number);
  const isOpen =
    !isNaN(oh) && !isNaN(ch) &&
    now >= new Date(now.setHours(oh, om, 0, 0)) &&
    now <= new Date(now.setHours(ch, cm, 0, 0));

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={
          restaurant.photo
            ? { uri: restaurant.photo }
            : require('../assets/icons/la-casa-logo.jpg')
        }
        style={styles.cardImg}
      />

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {restaurant.rName}
        </Text>

        {/* hours */}
        <Text style={styles.hoursTxt}>
          {restaurant.opens ?? '—'} – {restaurant.closes ?? '—'}
        </Text>

        <View style={styles.metaRow}>
          {/* distance */}
          {restaurant.distance_km != null && (
            <Text style={styles.metaTxt}>{restaurant.distance_km.toFixed(1)} km</Text>
          )}

          {/* rating */}
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(ratingVal) ? 'star' : 'star-outline'}
                size={12}
                color="#facc15"
              />
            ))}
            <Text style={styles.ratingTxt}>
              {restaurant.rating != null ? ratingVal.toFixed(1) : '—'}
            </Text>
          </View>
        </View>

        {/* open badge */}
        {isOpen && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>Open now</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    margin: 8,
  },
  cardImg: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  cardBody: { padding: 8 },
  cardName: { fontSize: 14, fontWeight: '600' },

  hoursTxt: {
    fontSize : 11,
    color    : '#6b7280',
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaTxt: { fontSize: 11, color: '#6b7280' },

  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingTxt: { fontSize: 11, color: '#6b7280', marginLeft: 4 },

  badge: {
    alignSelf       : 'flex-start',
    marginTop       : 4,
    paddingHorizontal: 6,
    paddingVertical : 2,
    backgroundColor : '#10b981',
    borderRadius    : 4,
  },
  badgeTxt: { fontSize: 10, color: '#fff', fontWeight: '600' },
});

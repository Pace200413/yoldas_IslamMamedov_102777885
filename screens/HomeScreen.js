import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Platform } from 'react-native';

import { useRestaurants } from '../context/RestaurantContext';
import CategoryGrid from '../components/CategoryGrid';
import RestaurantCard from '../components/RestaurantCard';
import BottomNav from '../components/BottomNav';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.27:4000';

export default function HomeScreen({ navigation }) {
  const { restaurants, mergeRestaurants } = useRestaurants();
  const longPressFired = useRef(false);

  const visible = restaurants.filter(r => r.approved === 1 || r.approved === true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/restaurants`);

        mergeRestaurants(data);
      } catch (e) {
        console.log('Failed to fetch restaurants from API:', e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
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
                  navigation.navigate('AdminPanel', {
                    screen: 'Approval',
                  });
                }}
                delayLongPress={600}
                onPressOut={() => {
                  if (!longPressFired.current) {
                    navigation.navigate('AccountHub');
                  }
                }}
              >
                <Image
                  source={require('../assets/icons/profile.jpeg')}
                  style={styles.profileIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="gray"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food or restaurant"
                placeholderTextColor="#888"
              />
            </View>

            {/* Categories */}
            <CategoryGrid />

            {/* Restaurants */}
            <Text style={styles.sectionTitle}>Restaurants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 15, paddingBottom: 10 }}
            >
              {visible.map((r) => (
                <RestaurantCard
                  key={r.id}
                  id={r.id}
                  name={r.rName}
                  rating={r.rating ?? 0}
                  distance={r.loc}
                  discount={r.dailySpecial ?? 0}
                  image={
                    r.photo
                      ? { uri: r.photo }
                      : require('../assets/icons/la-casa-logo.jpg')
                  }
                  onPress={() =>
                    navigation.navigate('RestaurantMenu', { restaurant: r })
                  }
                />
              ))}
            </ScrollView>
          </>
        }
        data={[]}
        keyExtractor={() => 'key'}
        renderItem={null}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 15,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: { fontSize: 12, color: 'gray' },
  location: { fontSize: 16, fontWeight: 'bold' },
  profileIcon: { width: 35, height: 35, borderRadius: 20 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    marginHorizontal: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    height: 45,
  },
  searchInput: { flex: 1, fontSize: 14 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginVertical: 10,
  },
});

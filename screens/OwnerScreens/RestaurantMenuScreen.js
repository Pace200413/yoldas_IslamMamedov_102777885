// screens/OwnerScreens/RestaurantMenuScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

import { useCart } from '../../context/CartContext';
import MealItem from '../../components/MealItem'; // ★ NEW

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://192.168.0.5:4000';   // ← your LAN IP

export default function RestaurantMenuScreen({ route }) {
  /* ───────── defensive check ───────── */
  const { restaurant } = route?.params ?? {};
  if (!restaurant) {
    return (
      <View style={styles.missingWrap}>
        <Text style={{ fontSize: 16, color: 'red' }}>Restaurant data missing.</Text>
      </View>
    );
  }

  /* ───────── hooks & state ───────── */
  const nav          = useNavigation();
  const insets       = useSafeAreaInsets();
  const { total, items: cartItems } = useCart(); // no direct add here now

  const [sections, setSections] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState('Food');   // ★ category chip

  /* ───────── fetch once ───────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/menu/restaurants/${restaurant.id}/meals`,
          { timeout: 5000 }
        );
        setSections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Menu fetch error:', err.message);
        setSections([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurant.id]);

  /* ───────── helpers ───────── */
  const renderSection = ({ title, items }) => (
    <View key={title} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items?.map(item => (
        <MealItem
          key={item.id}
          item={item}
          restaurantId={restaurant.id}
        />
      ))}
    </View>
  );

  /* ───────── render ───────── */
  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* hero banner */}
        <View style={styles.heroWrap}>
          <Image
            source={restaurant.photo ? { uri: restaurant.photo } : require('../../assets/icons/la-casa-logo.jpg')}
            style={styles.heroImg}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.heroFade} />
          <TouchableOpacity onPress={nav.goBack} style={[styles.iconCircle, { left: 16, top: insets.top + 6 }]}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* info card */}
        <View style={styles.infoCard}>
          <Image
            source={restaurant.photo ? { uri: restaurant.photo } : require('../../assets/icons/la-casa-logo.jpg')}
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.nameTxt}>{restaurant.rName}</Text>
            <Text style={styles.infoTxt}>⭐ {restaurant.rating ?? '—'} • {restaurant.cuisine}</Text>
          </View>
        </View>

        {/* category chips */}
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
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : sections.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="fast-food-outline" size={50} color="#9ca3af" />
            <Text style={styles.emptyTxt}>Menu coming soon…</Text>
          </View>
        ) : (
          sections
            .filter(s => s.title === active)   // ★ show only chosen cat
            .map(renderSection)
        )}
      </ScrollView>

      {/* cart badge */}
      {cartItems?.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => nav.navigate('Cart', { restaurantId: restaurant.id })}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.fabTxt}>TMT {total.toFixed(2)} ▸</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  flex:{ flex:1, backgroundColor:'#fff' },
  missingWrap:{ flex:1, justifyContent:'center', alignItems:'center' },

  heroWrap:{ width:'100%', height:160 },
  heroImg:{ width:'100%', height:'100%', resizeMode:'cover' },
  heroFade:{ ...StyleSheet.absoluteFillObject },

  iconCircle:{
    position:'absolute', width:36, height:36, borderRadius:18,
    backgroundColor:'#fff', justifyContent:'center', alignItems:'center',
    shadowColor:'#000', shadowOpacity:0.12, shadowRadius:4, elevation:4,
  },

  infoCard:{
    flexDirection:'row', alignItems:'center', backgroundColor:'#fff',
    marginHorizontal:16, padding:14, borderRadius:16, marginTop:-40,
    shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, elevation:5,
  },
  logo:{ width:56, height:56, borderRadius:12, marginRight:12 },
  nameTxt:{ fontSize:20, fontWeight:'700' },
  infoTxt:{ color:'#444', marginTop:2 },

  chipRow:{ flexDirection:'row', justifyContent:'center', marginTop:16 },
  chip:{
    paddingVertical:6, paddingHorizontal:24, marginHorizontal:6,
    borderRadius:18, backgroundColor:'#e5e7eb',
  },
  chipActive:{ backgroundColor:'#10b981' },
  chipTxt:{ fontSize:13, color:'#374151' },
  chipTxtActive:{ color:'#fff', fontWeight:'600' },

  container:{ paddingBottom:80 },
  section:{ paddingHorizontal:16, marginTop:26 },
  sectionTitle:{ fontSize:18, fontWeight:'bold', marginBottom:12 },
});

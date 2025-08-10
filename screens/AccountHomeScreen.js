import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── dummy activity items ── */
const pastOrders = [
  { id: 'o1', title: 'Tip to driver',    price: 'RM1.00',  date: '24 Jun 2025, 10:51 PM' },
  { id: 'o2', title: 'New Atmosferah …', price: 'RM16.00', date: '24 Jun 2025, 10:23 PM' },
];

/* ───────────────── Dashboard TAB ───────────────── */
function DashboardTab() {
  const navigation = useNavigation();

  return (
    <FlatList
      ListHeaderComponent={
        <>
          {/* cards row */}
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Image source={require('../assets/icons/visa.png')} style={styles.cardIcon}/>
              <Text style={styles.cardTitle}>Visa</Text>
              <Text style={styles.cardSub}>••1936</Text>
            </View>

            <TouchableOpacity style={[styles.card, styles.highlight]}>
              <Text style={[styles.cardTitle, { color: '#fff' }]}>GX Account</Text>
              <Text style={[styles.cardSub, { color: '#fff' }]}>Set up now</Text>
            </TouchableOpacity>
          </View>

          {/* business centre row */}
          <View style={styles.smallRow}>
            <TouchableOpacity
              style={styles.smallItem}
              onPress={() => navigation.navigate('BusinessCentre')}
            >
              <Image source={require('../assets/icons/business.jpeg')} style={styles.smallIcon}/>
              <Text style={styles.smallText}>Business Centre</Text>
            </TouchableOpacity>

            <View style={styles.smallItem}>
              <Image source={require('../assets/icons/family.png')} style={styles.smallIcon}/>
              <Text style={styles.smallText}>Create Family Account</Text>
            </View>
          </View>

          <Text style={styles.sectionH}>For more value</Text>
        </>
      }
      data={[
        { id: 'loyal',      label: 'Partner loyalty programmes' },
        { id: 'rewards',    label: 'GrabRewards', value: '0 points' },
        { id: 'subs',       label: 'Subscriptions' },
        { id: 'challenges', label: 'Challenges' },
        { id: 'fav',        label: 'Favourites', badge: 'New' },
        { id: 'diet',       label: 'Dietary preferences', badge: 'New' },
        { id: 'settings',   label: 'Settings' },
        { id: 'safety',     label: 'Safety settings', badge: 'New' },
        { id: 'language',   label: 'Language' },
      ]}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.label}</Text>
          {item.value  && <Text style={styles.dim}>{item.value}</Text>}
          {item.badge  && <Text style={styles.badge}>{item.badge}</Text>}
        </View>
      )}
      keyExtractor={i => i.id}
      ItemSeparatorComponent={() => <View style={styles.divider}/> }
    />
  );
}

/* ───────────────── Activity TAB ───────────────── */
function ActivityTab() {
  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>You seem to enjoy using GrabFood!</Text>
          <Text style={styles.dim}>You made 4 orders in the last 30 days.</Text>
        </View>
      }
      data={pastOrders}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.title}</Text>
          <Text>{item.price}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.divider}/> }
    />
  );
}

/* ───────────────── Main component ───────────────── */
const Tab = createMaterialTopTabNavigator();

export default function AccountHomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();              // safe-area info

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* banner strip */}
      <View style={styles.banner} />

      {/* back arrow */}
      <TouchableOpacity
        onPress={navigation.goBack}
        style={[styles.backBtn, { top: insets.top + 6 }]}   // 6-px gap below notch
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      {/* profile card */}
      <View style={styles.profileCard}>
        <Image
          source={require('../assets/icons/profile_placeholder.webp')}
          style={styles.avatar}
        />
        <Text style={{ fontSize: 18, flex: 1 }}>Islam</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Text style={{ color: '#0d9488', fontWeight: '600' }}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* top-tab navigator */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#059669',
          tabBarIndicatorStyle: { backgroundColor: '#059669' },
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardTab} />
        <Tab.Screen name="Activity"  component={ActivityTab}  />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

/* ───── styles ───── */
const styles = StyleSheet.create({
  banner:      { height: 90, backgroundColor: '#d1fae5' },

  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    padding: 6,
  },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    marginTop: -40,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#93c5fd' },
  profileBtn: { backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },

  cardRow:  { flexDirection: 'row', marginTop: 16, paddingHorizontal: 16 },
  card:     { flex: 1, height: 120, borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 12, justifyContent: 'center', alignItems: 'center',
              marginRight: 10 },
  highlight:{ backgroundColor: '#5b21b6', borderColor: '#5b21b6' },
  cardIcon: { width: 32, height: 32, marginBottom: 6 },
  cardTitle:{ fontWeight: '600' },
  cardSub:  { fontSize: 12, color: '#6b7280' },

  smallRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 },
  smallItem:{ flex: 1, alignItems: 'center', marginRight: 10 },
  smallIcon:{ width: 40, height: 40, marginBottom: 4 },
  smallText:{ fontSize: 12, textAlign: 'center' },

  sectionH: { fontSize: 18, fontWeight: '700', margin: 16, marginBottom: 8 },

  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 16, paddingVertical: 14 },
  divider:  { height: 1, backgroundColor: '#e5e7eb' },
  dim:      { color: '#6b7280' },
  badge:    { color: '#dc2626', marginLeft: 6 },

  tipCard:  { backgroundColor: '#fff7ed', margin: 16, borderRadius: 12, padding: 16 },
  tipTitle: { fontWeight: '600', marginBottom: 4 },
});

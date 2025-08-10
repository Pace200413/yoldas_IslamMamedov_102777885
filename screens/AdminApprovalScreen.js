// screens/AdminApprovalScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRestaurants } from '../context/RestaurantContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminApprovalScreen({ navigation }) {
  const { restaurants, approveRestaurant } = useRestaurants();
  const pending = restaurants.filter(r => !r.approved);

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rowText}>{item.rName}</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity onPress={() => approveRestaurant(item.id, true)}>
          <Ionicons name="checkmark-circle" size={26} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => approveRestaurant(item.id, false)}>
          <Ionicons name="close-circle" size={26} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Restaurants</Text>
        {/* Spacer to keep title centered */}
        <View style={styles.backBtn} />
      </View>

      {/* List */}
      <FlatList
        data={pending}
        keyExtractor={i => i.id.toString()}
        renderItem={renderRow}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending restaurants.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: '#fff' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   '#fff',
    shadowColor:   '#000',
    shadowOpacity: 0.08,
    shadowRadius:  4,
    elevation:     4,
  },
  backBtn:      { width: 30, alignItems: 'flex-start' },
  headerTitle:  { fontSize: 18, fontWeight: '700' },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent:'space-between',
    backgroundColor:'#f9fafb',
    marginHorizontal:16,
    marginVertical: 6,
    padding:        14,
    borderRadius:   10,
    shadowColor:   '#000',
    shadowOpacity: 0.05,
    shadowRadius:  3,
    elevation:     2,
  },
  rowText: { flex: 1, fontSize: 15 },
  rowBtns:{ flexDirection:'row', alignItems:'center' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#666' },
});

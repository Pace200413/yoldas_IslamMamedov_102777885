// replace file contents
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function AdminApprovalScreen({ navigation }) {
  const [pending, setPending] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/restaurants/pending`);
      setPending(data);
    } catch (e) {
      console.error('Pending fetch failed:', e.message);
      setPending([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id, approved) => {
    try {
      await axios.patch(`${API_BASE}/api/restaurants/${id}/approve`, { approved });
      setPending(list => list.filter(r => r.id !== id));
      if (approved) Alert.alert('Approved', 'Owner will be notified by email.');
    } catch (e) {
      Alert.alert('Error', 'Could not update approval');
    }
  };

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex:1 }}>
        <Text style={styles.rowTitle}>{item.rName}</Text>
        <Text style={styles.rowSub}>{item.ownerName} • {item.ownerEmail}</Text>
      </View>
      <View style={styles.rowBtns}>
        <TouchableOpacity onPress={() => approve(item.id, 1)}>
          <Ionicons name="checkmark-circle" size={26} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => approve(item.id, 0)}>
          <Ionicons name="close-circle" size={26} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Restaurants</Text>
        <View style={styles.backBtn} />
      </View>

      {pending === null ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={i => String(i.id)}
          renderItem={renderRow}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending restaurants.</Text>}
          refreshing={false}
          onRefresh={load}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:{ flex:1, backgroundColor:'#fff' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12 },
  backBtn:{ width:30 },
  headerTitle:{ fontSize:18, fontWeight:'700' },

  row:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#f9fafb', marginHorizontal:16, marginVertical:6, padding:14, borderRadius:10 },
  rowTitle:{ fontSize:15, fontWeight:'600' },
  rowSub:{ marginTop:2, color:'#6b7280', fontSize:12 },
  rowBtns:{ flexDirection:'row', alignItems:'center' },
  emptyText:{ textAlign:'center', marginTop:40, color:'#666' },
});

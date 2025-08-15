// src/screens/OwnerScreens/OptionsScreen.js
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackArrow from '../../components/BackArrow';
import { api } from '../../utils/api';

export default function OptionsScreen() {
  const navigation = useNavigation();
  const { restaurantId } = useRoute().params || {};
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Option Groups',
      headerLeft: () => <BackArrow onPress={() => navigation.goBack()} />,
    });
  }, [navigation]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/modifiers/restaurants/${restaurantId}/groups`);
      setGroups(res.data || []);
    } catch {
      Alert.alert('Error', 'Could not load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = (id) => {
    Alert.alert('Delete group?', 'This removes the group and its options.', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/modifiers/groups/${id}`);
            load();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={screenStyles.center}><ActivityIndicator /></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {groups.map(g => (
        <View key={g.id} style={screenStyles.card}>
          <View style={{ flex: 1 }}>
            <Text style={screenStyles.title}>{g.name}</Text>
            <Text style={screenStyles.meta}>
              {g.required ? 'Required' : 'Optional'} • min {g.min_select} • max {g.max_select || '∞'} • scope {g.scope}
            </Text>
          </View>
          <TouchableOpacity onPress={() => del(g.id)} style={screenStyles.del}>
            <Text style={{ color:'#b91c1c', fontWeight:'700' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {groups.length === 0 && (
        <Text style={{ textAlign:'center', color:'#6b7280' }}>No groups yet.</Text>
      )}
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
  center:{ flex:1, justifyContent:'center', alignItems:'center' },
  card:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:12, padding:12, marginBottom:10, borderWidth:1, borderColor:'#eef2f7' },
  title:{ fontWeight:'800', color:'#0f172a' },
  meta:{ color:'#64748b', fontSize:12, marginTop:2, fontWeight:'600' },
  del:{ paddingVertical:6, paddingHorizontal:10, borderRadius:8, backgroundColor:'#fee2e2', borderWidth:1, borderColor:'#fecaca' },
});


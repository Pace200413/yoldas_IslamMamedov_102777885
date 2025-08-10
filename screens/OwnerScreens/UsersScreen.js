import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Image, Platform, Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage                  from '@react-native-async-storage/async-storage';
import { Ionicons, Feather }         from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UsersScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const store      = route.params?.store;

  const [activeTab, setActiveTab] = useState('Users');
  const [search, setSearch]       = useState('');

  const [users, setUsers] = useState([
    {
      id:'u1', name:'Restaurant Owner', email:'me@mail.com',
      role:'Super Admin', status:'Online', note:'Working',
      avatar: require('../../assets/icons/profile.jpeg'),
    },
  ]);
  const [invitations] = useState([]);
  const [requests]    = useState([]);

  const filtered = () => {
    const list = activeTab==='Users'
      ? users
      : activeTab==='Invitations' ? invitations : requests;
    return list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.small}>{item.status} · {item.note}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{store?.rName || 'Store'} Users</Text>
      </View>

      <View style={styles.tabs}>
        {['Users','Invitations','Requests'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab===tab&&styles.tabActive]}
            onPress={()=>setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab===tab&&styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888" style={{ marginRight:8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered()}
        keyExtractor={i=>i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No {activeTab.toLowerCase()}.</Text>}
        contentContainerStyle={{ paddingBottom:120 }}
      />

      {activeTab==='Users' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={()=>navigation.navigate('AddUser',{ store })}
        >
          <Feather name="plus" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex:1, backgroundColor:'#fff' },
  header:     { flexDirection:'row', alignItems:'center', padding:16 },
  iconBtn:    { padding:8 },
  title:      { fontSize:18, fontWeight:'600', marginLeft:8 },

  tabs:       { flexDirection:'row', paddingHorizontal:16 },
  tabItem:    { marginRight:24, paddingBottom:8 },
  tabActive:  { borderBottomWidth:2, borderColor:'#000' },
  tabText:    { fontSize:14, color:'#666' },
  tabTextActive:{ color:'#000', fontWeight:'600' },

  searchBox:  {
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#f1f1f1', margin:16,
    paddingHorizontal:12, borderRadius:8, height:40
  },
  searchInput:{ flex:1, fontSize:14 },

  card:       {
    flexDirection:'row', alignItems:'center',
    padding:12, marginHorizontal:16, marginBottom:12,
    backgroundColor:'#f9fafb', borderRadius:10,
    ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4 }, android:{ elevation:2 } }),
  },
  avatar:     { width:40, height:40, borderRadius:20, marginRight:12 },
  info:       { flex:1 },
  name:       { fontSize:16, fontWeight:'600' },
  email:      { fontSize:12, color:'#666', marginVertical:2 },
  small:      { fontSize:12, color:'#999' },

  empty:      { textAlign:'center', marginTop:40, color:'#999' },

  fab:        {
    position:'absolute', bottom:20, right:20,
    backgroundColor:'#ffeb3b', width:56, height:56,
    borderRadius:28, justifyContent:'center', alignItems:'center',
    ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6 }, android:{ elevation:5 } }),
  },
});

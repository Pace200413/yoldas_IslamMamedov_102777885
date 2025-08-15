// screens/OwnerScreens/ModifiersScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Modal, ActivityIndicator, Alert, Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function ModifiersScreen({ route }) {
  const { restaurantId } = route.params;

  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);

  // new-group modal
  const [gOpen, setGOpen] = useState(false);
  const [gName, setGName] = useState('');
  const [gMin, setGMin] = useState('0');
  const [gMax, setGMax] = useState('0');
  const [gReq, setGReq] = useState(false);

  // new-option modal
  const [oOpen, setOOpen] = useState(false);
  const [oGroupId, setOGroupId] = useState(null);
  const [oName, setOName] = useState('');
  const [oDelta, setODelta] = useState('0');
  const [oDefault, setODefault] = useState(false);

  // attach modal
  const [aOpen, setAOpen] = useState(false);
  const [aGroup, setAGroup] = useState(null);
  const [meals, setMeals] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/modifiers/restaurants/${restaurantId}/groups`);
      setGroups(data || []);
    } catch (e) {
      console.warn('groups load failed', e.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMeals = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/menu/restaurants/${restaurantId}/meals`);
      const items = (data || []).flatMap(s => s.items.map(m => ({ id: m.id, name: m.name, section: s.title })));
      setMeals(items);
    } catch (e) {
      console.warn('meals load failed', e.message);
      setMeals([]);
    }
  };

  useEffect(() => { load(); }, [restaurantId]);

  // ─── actions ─────────────────────────────────────────────
  const createGroup = async () => {
    if (!gName.trim()) return Alert.alert('Name required');
    try {
      await axios.post(`${API_BASE}/api/modifiers/restaurants/${restaurantId}/groups`, {
        name: gName.trim(),
        min_select: Number(gMin) || 0,
        max_select: Number(gMax) || 0,
        required: gReq ? 1 : 0,
      });
      setGOpen(false); setGName(''); setGMin('0'); setGMax('0'); setGReq(false);
      load();
    } catch { Alert.alert('Error', 'Could not create group'); }
  };

  const addOption = async () => {
    if (!oName.trim() || !oGroupId) return;
    try {
      await axios.post(`${API_BASE}/api/modifiers/groups/${oGroupId}/options`, {
        name: oName.trim(),
        price_delta: Number(oDelta) || 0,
        is_default: oDefault ? 1 : 0,
      });
      setOOpen(false); setOGroupId(null); setOName(''); setODelta('0'); setODefault(false);
      load();
    } catch { Alert.alert('Error', 'Could not add option'); }
  };

  const toggleOption = async (optId, field, value) => {
    try {
      await axios.patch(`${API_BASE}/api/modifiers/options/${optId}`, { [field]: value });
      load();
    } catch { Alert.alert('Error', 'Update failed'); }
  };

  const removeOption = async (optId) => {
    try {
      await axios.delete(`${API_BASE}/api/modifiers/options/${optId}`);
      load();
    } catch { Alert.alert('Error', 'Delete failed'); }
  };

  const openAttach = async (group) => {
    setAGroup(group);
    await loadMeals();
    setAOpen(true);
  };

  const attachToMeal = async (mealId) => {
    try {
      await axios.post(`${API_BASE}/api/modifiers/meals/${mealId}/groups/${aGroup.id}`);
      Alert.alert('Attached', `"${aGroup.name}" attached.`);
    } catch { Alert.alert('Error', 'Attach failed'); }
  };

  const detachFromMeal = async (mealId) => {
    try {
      await axios.delete(`${API_BASE}/api/modifiers/meals/${mealId}/groups/${aGroup.id}`);
      Alert.alert('Detached', `"${aGroup.name}" detached.`);
    } catch { Alert.alert('Error', 'Detach failed'); }
  };

  // ─── render ──────────────────────────────────────────────
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      {/* header row */}
      <View style={styles.header}>
        <Text style={styles.title}>Options & Add-ons</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setGOpen(true)}>
          <Feather name="plus" size={18} color="#fff" /><Text style={styles.addTxt}> New group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={g => String(g.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={<Text style={{ textAlign:'center', color:'#777', marginTop:40 }}>No groups yet.</Text>}
        renderItem={({ item: g }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{g.name}</Text>
              <TouchableOpacity onPress={() => { setOGroupId(g.id); setOOpen(true); }}>
                <Feather name="plus-circle" size={18} color="#10b981" />
              </TouchableOpacity>
            </View>

            <Text style={styles.meta}>
              required: {g.required ? 'yes' : 'no'} • min {g.min_select} • max {g.max_select || '∞'}
            </Text>

            {(g.options || []).map(o => (
              <View key={o.id} style={styles.optRow}>
                <Text style={{ flex:1 }}>{o.name}  <Text style={styles.delta}>({Number(o.price_delta).toFixed(2)})</Text></Text>

                <TouchableOpacity
                  style={[styles.pill, o.is_default ? styles.on : styles.off]}
                  onPress={() => toggleOption(o.id, 'is_default', o.is_default ? 0 : 1)}
                >
                  <Text style={styles.pillTxt}>Default</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, o.in_stock ? styles.on : styles.off]}
                  onPress={() => toggleOption(o.id, 'in_stock', o.in_stock ? 0 : 1)}
                >
                  <Text style={styles.pillTxt}>In stock</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeOption(o.id)} style={{ paddingHorizontal:8 }}>
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.attach} onPress={() => openAttach(g)}>
                <Ionicons name="link" size={16} color="#10b981" /><Text style={styles.linkTxt}> Attach / Detach to meals</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* New Group Modal */}
      <Modal visible={gOpen} animationType="slide" onRequestClose={() => setGOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.mTitle}>New group</Text>
          <TextInput placeholder="Name" style={styles.input} value={gName} onChangeText={setGName} />
          <TextInput placeholder="Min select (0)" style={styles.input} keyboardType="number-pad" value={gMin} onChangeText={setGMin} />
          <TextInput placeholder="Max select (0 = unlimited)" style={styles.input} keyboardType="number-pad" value={gMax} onChangeText={setGMax} />
          <TouchableOpacity style={[styles.pill, gReq ? styles.on : styles.off]} onPress={() => setGReq(!gReq)}>
            <Text style={styles.pillTxt}>Required</Text>
          </TouchableOpacity>
          <View style={styles.rowBtn}>
            <TouchableOpacity style={styles.cancel} onPress={() => setGOpen(false)}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={createGroup}><Text style={{ color:'#fff', fontWeight:'700' }}>Create</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Option Modal */}
      <Modal visible={oOpen} animationType="slide" onRequestClose={() => setOOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.mTitle}>New option</Text>
          <TextInput placeholder="Name" style={styles.input} value={oName} onChangeText={setOName} />
          <TextInput placeholder="Price delta (e.g. 1.50 or -0.50)" style={styles.input} keyboardType="numbers-and-punctuation" value={oDelta} onChangeText={setODelta} />
          <TouchableOpacity style={[styles.pill, oDefault ? styles.on : styles.off]} onPress={() => setODefault(!oDefault)}>
            <Text style={styles.pillTxt}>Default</Text>
          </TouchableOpacity>
          <View style={styles.rowBtn}>
            <TouchableOpacity style={styles.cancel} onPress={() => setOOpen(false)}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={addOption}><Text style={{ color:'#fff', fontWeight:'700' }}>Add</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Attach Modal */}
      <Modal visible={aOpen} animationType="slide" onRequestClose={() => setAOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.mTitle}>Attach “{aGroup?.name}”</Text>
          <FlatList
            data={meals}
            keyExtractor={m => String(m.id)}
            ItemSeparatorComponent={() => <View style={{ height:8 }} />}
            renderItem={({ item:m }) => (
              <View style={styles.attachRow}>
                <Text style={{ flex:1 }}>{m.name} <Text style={{ color:'#6b7280' }}>({m.section})</Text></Text>
                <TouchableOpacity onPress={() => attachToMeal(m.id)} style={{ paddingHorizontal:6 }}>
                  <Feather name="link" size={18} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => detachFromMeal(m.id)} style={{ paddingHorizontal:6 }}>
                  <Feather name="unlink" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<ActivityIndicator style={{ marginTop: 20 }} />}
          />
          <View style={styles.rowBtn}>
            <TouchableOpacity style={styles.cancel} onPress={() => setAOpen(false)}><Text>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f9fafb' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
  title:{ fontSize:18, fontWeight:'700' },
  addBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#10b981', paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  addTxt:{ color:'#fff', fontWeight:'700', marginLeft:6 },

  card:{ backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:12 },
  cardHead:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  cardTitle:{ fontSize:16, fontWeight:'700' },
  meta:{ color:'#6b7280', marginTop:4 },

  optRow:{ flexDirection:'row', alignItems:'center', paddingVertical:6 },
  delta:{ color:'#6b7280' },
  pill:{ paddingVertical:4, paddingHorizontal:8, borderRadius:12, marginHorizontal:4 },
  on:{ backgroundColor:'#ecfdf5' },
  off:{ backgroundColor:'#f3f4f6' },
  pillTxt:{ fontSize:12, color:'#111' },
  actions:{ marginTop:8, flexDirection:'row' },
  attach:{ flexDirection:'row', alignItems:'center' },
  linkTxt:{ color:'#10b981', fontWeight:'600' },

  modal:{ flex:1, padding:16, backgroundColor:'#fff' },
  mTitle:{ fontSize:18, fontWeight:'700', marginBottom:12 },
  input:{ backgroundColor:'#f3f4f6', borderRadius:8, padding:10, marginVertical:6 },
  rowBtn:{ flexDirection:'row', justifyContent:'space-between', marginTop:12 },
  cancel:{ backgroundColor:'#e5e7eb', paddingVertical:10, paddingHorizontal:16, borderRadius:8 },
  primary:{ backgroundColor:'#10b981', paddingVertical:10, paddingHorizontal:16, borderRadius:8 },

  attachRow:{ flexDirection:'row', alignItems:'center', paddingVertical:8 },
});

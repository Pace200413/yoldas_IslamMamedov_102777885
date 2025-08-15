// components/MealItem.js
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, Modal,
  ScrollView, StyleSheet, ActivityIndicator, Alert, Platform,
  Pressable, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function MealItem({ item, restaurantId }) {
  const { add } = useCart();

  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState(Array.isArray(item.groups) ? item.groups : null);
  const [picked, setPicked] = useState({});
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  const basePrice = () => {
    const p = Number(item.price) || 0;
    const d = Number(item.discount) || 0;
    return d > 0 ? p * (1 - d / 100) : p;
  };

  const ensureLoaded = async () => {
    if (item.outOfStock || item.out_of_stock) {
      return Alert.alert('Out of stock', `${item.name} is currently unavailable.`);
    }
    if (Array.isArray(groups)) {
      prepDefaults(groups);
      setOpen(true);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/modifiers/meals/${item.id}`);
      const list = Array.isArray(data) ? data.filter(g => (g.options?.length || 0) > 0) : [];
      setGroups(list);
      if (list.length === 0) {
        add({
          id: item.id,
          name: item.name,
          price: +basePrice().toFixed(2),
          restaurantId,
          customizations: [],
          note: ''
        });
        return;
      }
      prepDefaults(list);
      setOpen(true);
    } catch (e) {
      console.warn('modifier fetch failed', e.message);
      Alert.alert('Error', 'Could not load options');
    } finally {
      setLoading(false);
    }
  };

  const prepDefaults = (list) => {
    const init = {};
    list.forEach(g => {
      const def = (g.options || []).filter(o => o.is_default).map(o => o.id);
      init[g.id] = new Set(def);
    });
    setPicked(init);
  };

  const togglePick = (g, optId) => {
    const maxSel = Number(g.max_select) || 0; // 0 = ∞
    const current = new Set(picked[g.id] || []);
    if (maxSel === 1) {
      picked[g.id] = new Set([optId]);
    } else {
      if (current.has(optId)) current.delete(optId);
      else if (maxSel === 0 || current.size < maxSel) current.add(optId);
      picked[g.id] = current;
    }
    setPicked({ ...picked });
  };

  const deltaTotal = () => {
    if (!groups) return 0;
    let sum = 0;
    groups.forEach(g => {
      const sel = picked[g.id] ? Array.from(picked[g.id]) : [];
      (g.options || []).forEach(o => {
        if (sel.includes(o.id)) sum += Number(o.price_delta || 0);
      });
    });
    return sum;
  };

  const confirm = () => {
    for (const g of groups || []) {
      const need = g.required ? Math.max(1, Number(g.min_select) || 0) : 0;
      const has = (picked[g.id]?.size) || 0;
      if (need > 0 && has < need) {
        return Alert.alert('Choose options', `Please select at least ${need} in “${g.name}”.`);
      }
    }
    const lines = [];
    (groups || []).forEach(g => {
      (picked[g.id] || new Set()).forEach(optId => {
        const o = (g.options || []).find(x => x.id === optId);
        if (o) lines.push({
          groupId: g.id, group: g.name,
          optionId: o.id, option: o.name,
          delta: Number(o.price_delta || 0)
        });
      });
    });
    const price = +((basePrice()) + deltaTotal()).toFixed(2);
    add({
      id: item.id,
      name: item.name,
      price,
      restaurantId,
      customizations: lines,
      note: note.trim()
    });
    setOpen(false);
    setNote('');
  };

  const priceText =
    Number(item.discount) > 0
      ? `TMT ${basePrice().toFixed(2)}  (−${Number(item.discount)}%)`
      : `TMT ${(Number(item.price) || 0).toFixed(2)}`;

  const OptionChip = ({ on, children }) => (
    <View style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{children}</Text>
      <Ionicons
        name={on ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={on ? '#065f46' : '#9ca3af'}
        style={{ marginLeft: 6 }}
      />
    </View>
  );

  return (
    <>
      <View style={styles.row}>
        <Image
          source={item.photo ? { uri: item.photo } : require('../assets/icons/la-casa-logo.jpg')}
          style={styles.img}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{priceText}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={ensureLoaded} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="add" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      {/* CUSTOMER CUSTOMIZE SHEET */}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Customize {item.name}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ marginBottom: 8, color: '#4b5563' }}>{priceText}</Text>

            {(groups || []).map((g) => {
              const max = Number(g.max_select) || 0;
              const pickedSet = picked[g.id] || new Set();
              const pickedCount = pickedSet.size;

              return (
                <View key={g.id} style={styles.groupBox}>
                  <View style={styles.groupHead}>
                    <Text style={styles.groupTitle}>
                      {g.name}{g.required ? ' *' : ''}
                    </Text>
                    <Text style={styles.groupMeta}>
                      {max === 1 ? 'choose 1' : max > 1 ? `up to ${max}` : 'choose any'}
                      {pickedCount ? ` • ${pickedCount} selected` : ''}
                    </Text>
                  </View>

                  <View style={styles.chipsWrap}>
                    {(g.options || []).map((o) => {
                      const on = pickedSet.has(o.id);
                      const label = o.price_delta
                        ? `${o.name}  (+${Number(o.price_delta).toFixed(2)})`
                        : o.name;
                      return (
                        <Pressable
                          key={o.id}
                          onPress={() => togglePick(g, o.id)}
                          android_ripple={{ color: '#e5e7eb' }}
                          style={({ pressed }) => [styles.chipPress, pressed && { opacity: 0.9 }]}
                        >
                          <OptionChip on={on}>{label}</OptionChip>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Special instructions */}
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Special instructions (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g., no onions / light ice / extra napkins"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.total}>Total: TMT {((basePrice()) + deltaTotal()).toFixed(2)}</Text>
            <TouchableOpacity style={styles.confirm} onPress={confirm}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add to cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, backgroundColor:'#fff', padding:12, borderRadius:12 },
  img: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600', color:'#111' },
  price: { fontSize: 14, marginTop: 4, color:'#4b5563' },
  addBtn: { backgroundColor: '#10b981', padding: 10, borderRadius: 18, minWidth: 40, alignItems: 'center' },

  // customize sheet
  sheet: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '700', fontSize: 16 },

  groupBox: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12 },
  groupHead: { flexDirection:'row', alignItems:'baseline', justifyContent:'space-between' },
  groupTitle: { fontWeight: '700', fontSize: 15 },
  groupMeta: { color: '#6b7280', fontSize: 12 },

  chipsWrap: { flexDirection:'row', flexWrap:'wrap', marginTop: 8 },
  chipPress: { marginRight: 8, marginBottom: 8 },
  chip: { flexDirection:'row', alignItems:'center', paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:999 },
  chipOn: { backgroundColor:'#ecfdf5', borderColor:'#10b981' },
  chipTxt: { fontSize:13, color:'#111' },
  chipTxtOn: { color:'#065f46', fontWeight:'700' },

  // special note
  noteBox: { marginTop: 12, backgroundColor:'#f9fafb', padding:12, borderRadius:12 },
  noteLabel: { fontWeight:'600', marginBottom:6 },
  noteInput: { minHeight: 60, backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, padding:10, textAlignVertical:'top' },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  total: { fontSize: 16, fontWeight: '700' },
  confirm: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
});

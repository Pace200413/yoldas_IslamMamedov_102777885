import React, { useMemo, useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Alert,
} from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../CustomHeader';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function CreateGroupSheet({ visible, onClose, restaurantId, meal, onCreated }) {
  const insets = useSafeAreaInsets();
  const headerH = insets.top + 56;

  const initialRow = { key: 1, name: '', delta: '0', isDefault: false };
  const [name, setName] = useState('');
  const [required, setRequired] = useState(true);
  const [single, setSingle] = useState(true);
  const [minSel, setMinSel] = useState(1);
  const [maxSel, setMaxSel] = useState(1);
  const [rows, setRows] = useState([initialRow]);

  // scope picker (Food / Drink / Both) – user controllable now
  const [scope, setScope] = useState(() => {
    const isDrink = String(meal?.section || '').toLowerCase() === 'drinks';
    return isDrink ? 'drink' : 'food';
  });

  const addRow = () => setRows((p) => [...p, { key: Date.now(), name: '', delta: '0', isDefault: false }]);
  const removeRow = (k) => setRows((p) => (p.length > 1 ? p.filter((r) => r.key !== k) : p));
  const updateRow = (k, patch) => setRows((p) => p.map((r) => (r.key === k ? { ...r, ...patch } : r)));
  const toggleDefault = (k) => setRows((p) =>
    p.map((r) => (single ? { ...r, isDefault: r.key === k ? !r.isDefault : false }
                         : r.key === k ? { ...r, isDefault: !r.isDefault } : r)));

  const reset = () => {
    setName(''); setRequired(true); setSingle(true); setMinSel(1); setMaxSel(1);
    setRows([initialRow]);
    const isDrink = String(meal?.section || '').toLowerCase() === 'drinks';
    setScope(isDrink ? 'drink' : 'food');
  };

  const createGroup = async () => {
    const clean = rows
      .map((r) => ({ name: String(r.name || '').trim(), delta: String(r.delta || '0').trim(), isDefault: !!r.isDefault }))
      .filter((r) => r.name.length > 0);

    if (!name.trim()) return Alert.alert('Validation', 'Group name is required');
    if (clean.length === 0) return Alert.alert('Validation', 'Please add at least one option.');
    if (single && !clean.some((r) => r.isDefault)) clean[0].isDefault = true;

    const payload = {
      name: name.trim(),
      required: required ? 1 : 0,
      min_select: single ? 1 : Math.max(0, Number(minSel) || 0),
      max_select: single ? 1 : Math.max(0, Number(maxSel) || 0),
      scope, // <- from picker
    };

    try {
      const { data } = await axios.post(`${API_BASE}/api/modifiers/restaurants/${restaurantId}/groups`, payload);
      const gid = data.id;

      for (const r of clean) {
        await axios.post(`${API_BASE}/api/modifiers/groups/${gid}/options`, {
          name: r.name, price_delta: Number(r.delta) || 0, is_default: r.isDefault ? 1 : 0,
        });
      }
      await axios.post(`${API_BASE}/api/modifiers/meals/${meal.id}/groups/${gid}`);
      reset();
      onCreated && onCreated();
    } catch {
      Alert.alert('Error', 'Could not create group');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.sheet, { paddingTop: headerH }]}>
        {/* floating header (keeps location, restores taps) */}
        <CustomHeader title="New Option Group" onBack={onClose} />

        <ScrollView contentContainerStyle={s.body}>
          <View style={s.field}>
            <Text style={s.label}>Group name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g., Spiciness, Size, Milk type"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#a1a1aa"
            />
          </View>

          <View style={s.row2}>
            <TouchableOpacity onPress={() => setRequired(v => !v)} style={s.cardToggle}>
              <View style={s.cardHead}>
                <Text style={s.toggleTitle}>Required</Text>
                <Feather name={required ? 'toggle-right' : 'toggle-left'} size={28} color="#10b981" />
              </View>
              <Text style={s.hint}>Customers must choose at least one option.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSingle(v => !v)} style={s.cardToggle}>
              <View style={s.cardHead}>
                <Text style={s.toggleTitle}>Single choice</Text>
                <Feather name={single ? 'toggle-right' : 'toggle-left'} size={28} color="#10b981" />
              </View>
              <Text style={s.hint}>If off, customers may pick multiple options.</Text>
            </TouchableOpacity>
          </View>

          {!single && (
            <View style={s.row2}>
              <View style={s.field}>
                <Text style={s.label}>Min select</Text>
                <TextInput style={s.input} placeholder="0" keyboardType="number-pad" value={String(minSel)} onChangeText={setMinSel} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Max select (0 = ∞)</Text>
                <TextInput style={s.input} placeholder="0" keyboardType="number-pad" value={String(maxSel)} onChangeText={setMaxSel} />
              </View>
            </View>
          )}

          {/* scope picker */}
          <View style={s.field}>
            <Text style={s.label}>Applies to</Text>
            <View style={s.segment}>
              {['food', 'drink', 'both'].map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[s.segBtn, scope === sc && s.segOn]}
                  onPress={() => setScope(sc)}
                >
                  <Text style={[s.segTxt, scope === sc && s.segTxtOn]}>
                    {sc.charAt(0).toUpperCase() + sc.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[s.label, { marginTop: 8 }]}>Options</Text>
          {rows.map((r) => (
            <View key={r.key} style={s.optCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.smallLabel}>Option name</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g., No ice / Whole milk / Large"
                  value={r.name}
                  onChangeText={(t) => updateRow(r.key, { name: t })}
                  placeholderTextColor="#a1a1aa"
                />
              </View>

              <View style={{ width: 110, marginLeft: 10 }}>
                <Text style={s.smallLabel}>Price delta</Text>
                <TextInput
                  style={s.input}
                  placeholder="+0.00"
                  keyboardType="decimal-pad"
                  value={r.delta}
                  onChangeText={(t) => updateRow(r.key, { delta: t })}
                  placeholderTextColor="#a1a1aa"
                />
              </View>

              <View style={s.optActions}>
                <TouchableOpacity
                  onPress={() => toggleDefault(r.key)}
                  style={[s.defaultBadge, r.isDefault && s.defaultOn]}
                >
                  <Feather name="star" size={16} color={r.isDefault ? '#b45309' : '#9ca3af'} />
                  <Text style={[s.defaultTxt, r.isDefault && { color: '#b45309', fontWeight: '700' }]}>
                    Default
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeRow(r.key)} style={s.delBtn}>
                  <Feather name="trash-2" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={addRow} style={s.addBtn}>
            <Feather name="plus" size={16} />
            <Text style={s.addTxt}>Add option</Text>
          </TouchableOpacity>

          <View style={[s.footer, { paddingHorizontal: 16, paddingBottom: 24 }]}>
            <TouchableOpacity style={s.cancel} onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primary} onPress={createGroup}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 16, paddingBottom: 12 },

  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f7f8fa', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#eef1f4',
  },

  row2: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardToggle: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  toggleTitle: { fontWeight: '800', color: '#111' },
  hint: { color: '#6b7280', fontSize: 12 },

  segment: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 999, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e7eb' },
  segBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  segOn: { backgroundColor: '#fff', elevation: 1 },
  segTxt: { color: '#374151', fontWeight: '700', textTransform: 'capitalize' },
  segTxtOn: { color: '#065f46' },

  smallLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  optCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 12, marginBottom: 10 },
  optActions: { justifyContent: 'center', alignItems: 'flex-end', marginLeft: 10 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#f3f4f6', alignSelf: 'flex-end' },
  defaultOn: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a' },
  defaultTxt: { fontSize: 12, marginLeft: 6, color: '#6b7280', fontWeight: '700' },
  delBtn: { marginTop: 8, alignSelf: 'flex-end', padding: 6 },

  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#e0e7ff' },
  addTxt: { marginLeft: 8, color: '#3730a3', fontWeight: '800' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cancel: { backgroundColor: '#eef2f7', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e5eaf1' },
  primary: { backgroundColor: '#10b981', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
});

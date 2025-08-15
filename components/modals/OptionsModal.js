import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import axios from 'axios';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../CustomHeader';
import CreateGroupSheet from './CreateGroupSheet';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function OptionsModal({ visible, onClose, restaurantId, meal, navigation }) {
  const insets = useSafeAreaInsets();
  const headerH = insets.top + 56;

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [attached, setAttached] = useState(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const isDrink = useMemo(() => String(meal?.section || '').toLowerCase() === 'drinks', [meal?.section]);

  const refresh = useCallback(async () => {
    if (!visible || !restaurantId || !meal?.id) return;
    try {
      setLoading(true);
      const [grpRes, linkedRes] = await Promise.all([
        axios.get(`${API_BASE}/api/modifiers/restaurants/${restaurantId}/groups`),
        axios.get(`${API_BASE}/api/modifiers/meals/${meal.id}`),
      ]);
      const mealType = isDrink ? 'drink' : 'food';
      const eligible = (g) => g.scope === 'both' || (g.scope === 'food' && mealType === 'food') || (g.scope === 'drink' && mealType === 'drink');
      setGroups((grpRes.data || []).filter(eligible));
      setAttached(new Set((linkedRes.data || []).map((g) => g.id)));
    } finally {
      setLoading(false);
    }
  }, [visible, restaurantId, meal?.id, isDrink]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleAttach = async (groupId) => {
    if (!meal?.id) return;
    const isOn = attached.has(groupId);
    try {
      if (isOn) {
        await axios.delete(`${API_BASE}/api/modifiers/meals/${meal.id}/groups/${groupId}`);
        const copy = new Set(attached); copy.delete(groupId); setAttached(copy);
      } else {
        await axios.post(`${API_BASE}/api/modifiers/meals/${meal.id}/groups/${groupId}`);
        const copy = new Set(attached); copy.add(groupId); setAttached(copy);
      }
    } catch {}
  };

  const deleteGroup = async (groupId) => { try { await axios.delete(`${API_BASE}/api/modifiers/groups/${groupId}`); await refresh(); } catch {} };

  const createSpicinessPreset = async () => {
    if (isDrink || !meal?.id) return;
    try {
      const { data } = await axios.post(`${API_BASE}/api/modifiers/restaurants/${restaurantId}/groups`, { name: 'Spiciness', required: 1, min_select: 1, max_select: 1, scope: 'food' });
      const gid = data.id;
      const mk = (name, delta = 0, is_default = 0) => axios.post(`${API_BASE}/api/modifiers/groups/${gid}/options`, { name, price_delta: delta, is_default });
      await Promise.all([mk('Not spicy', 0, 1), mk('Mild'), mk('Hot'), mk('Extra hot')]);
      await axios.post(`${API_BASE}/api/modifiers/meals/${meal.id}/groups/${gid}`);
      await refresh();
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.sheet, { paddingTop: headerH }]}>
        {/* same floating/touchable header */}
        <CustomHeader
          title={`Options for ${meal?.name ?? ''}`}
          onBack={onClose}
          rightLabel="Full manager ▸"
          onRightPress={() => { onClose(); navigation.navigate('Options', { restaurantId }); }}
        />

        <View style={s.quickRow}>
          <TouchableOpacity style={[s.chip, s.chipBlue]} onPress={() => setCreateOpen(true)}>
            <Feather name="plus" size={14} />
            <Text style={[s.chipTxt, s.chipBlueTxt]}>Add Group</Text>
          </TouchableOpacity>

          {!isDrink && (
            <TouchableOpacity style={[s.chip, s.chipRose]} onPress={createSpicinessPreset}>
              <Ionicons name="flame" size={14} />
              <Text style={[s.chipTxt, s.chipRoseTxt]}>Spiciness preset</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {groups.length === 0 ? (
              <Text style={s.empty}>No option groups yet. Create one above.</Text>
            ) : (
              groups.map((g) => {
                const isOn = attached.has(g.id);
                return (
                  <View key={g.id} style={s.attachRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.gName}>{g.name}</Text>
                      <Text style={s.gMeta}>
                        {g.required ? 'Required' : 'Optional'} • min {g.min_select} • max {g.max_select || '∞'}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => deleteGroup(g.id)} style={{ padding: 8, marginRight: 6 }}>
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.attachBtn, isOn ? s.btnOn : s.btnOff]}
                      onPress={() => toggleAttach(g.id)}
                    >
                      <Text style={[s.attachTxt, isOn && { color: '#065f46' }]}>
                        {isOn ? 'Attached' : 'Attach'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        <View style={s.footer}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CreateGroupSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        restaurantId={restaurantId}
        meal={meal}
        onCreated={() => { setCreateOpen(false); refresh(); }}
      />
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, marginRight: 8, gap: 6 },
  chipTxt: { fontSize: 12, fontWeight: '800' },
  chipBlue: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  chipBlueTxt: { color: '#075985' },
  chipRose: { backgroundColor: '#ffe4e6', borderColor: '#fecdd3' },
  chipRoseTxt: { color: '#9f1239' },

  empty: { textAlign: 'center', marginTop: 24, color: '#6b7280' },
  attachRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#eef2f7' },
  gName: { fontWeight: '800', color: '#0f172a' },
  gMeta: { color: '#64748b', fontSize: 12, marginTop: 2, fontWeight: '600' },
  attachBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  btnOn: { backgroundColor: '#d1fae5', borderColor: '#a7f3d0' },
  btnOff: { backgroundColor: '#f1f5f9' },
  attachTxt: { fontWeight: '800', color: '#0f172a' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  closeBtn: { backgroundColor: '#eef2f7', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e5eaf1' },
});


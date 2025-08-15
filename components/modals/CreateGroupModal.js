// src/components/modals/CreateGroupModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BackArrow from '../../components/BackArrow';
import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://172.17.0.48:4000';

export default function CreateGroupModal({
  visible,
  onClose,
  restaurantId,
  meal,                   // { id, section, ... }
  styles,
  onCreated,              // callback to refresh parent list
}) {
  const [grpName, setGrpName] = useState('');
  const [grpRequired, setGrpRequired] = useState(true);
  const [grpSingle, setGrpSingle] = useState(true);
  const [grpMin, setGrpMin] = useState(1);
  const [grpMax, setGrpMax] = useState(1);
  const mealIsDrink = String(meal?.section || '').toLowerCase() === 'drinks';
  const [grpScope, setGrpScope] = useState(mealIsDrink ? 'drink' : 'food');

  const [optRows, setOptRows] = useState([{ key: 1, name: '', delta: '0', isDefault: false }]);
  const addOptRow = () => setOptRows(prev => [...prev, { key: Date.now(), name: '', delta: '0', isDefault: false }]);
  const removeOptRow = (key) => setOptRows(prev => (prev.length > 1 ? prev.filter(r => r.key !== key) : prev));
  const updateOptRow = (key, patch) => setOptRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
  const toggleDefault = (key) => {
    setOptRows(prev => {
      if (grpSingle) return prev.map(r => ({ ...r, isDefault: r.key === key ? !r.isDefault : false }));
      return prev.map(r => (r.key === key ? { ...r, isDefault: !r.isDefault } : r));
    });
  };

  const createGroup = async () => {
    if (!grpName.trim()) return Alert.alert('Validation', 'Group name is required');
    const cleanRows = optRows
      .map(r => ({ name: String(r.name || '').trim(), delta: String(r.delta || '0').trim(), isDefault: !!r.isDefault }))
      .filter(r => r.name.length > 0);

    if (cleanRows.length === 0) return Alert.alert('Validation', 'Please add at least one option.');
    if (grpSingle && !cleanRows.some(r => r.isDefault)) cleanRows[0].isDefault = true;

    const payload = {
      name: grpName.trim(),
      required: grpRequired ? 1 : 0,
      min_select: grpSingle ? 1 : Math.max(0, Number(grpMin) || 0),
      max_select: grpSingle ? 1 : Math.max(0, Number(grpMax) || 0),
      scope: grpScope,
    };

    try {
      const { data } = await api.post(`/api/modifiers/restaurants/${restaurantId}/groups`, payload);
      const groupId = data.id;

      for (const r of cleanRows) {
        await api.post(`/api/modifiers/groups/${groupId}/options`, {
          name: r.name,
          price_delta: Number(r.delta) || 0,
          is_default: r.isDefault ? 1 : 0,
        });
      }

      await api.post(`/api/modifiers/meals/${meal.id}/groups/${groupId}`);
      onCreated?.();
      onClose();
      // reset
      setGrpName(''); setGrpRequired(true); setGrpSingle(true); setGrpMin(1); setGrpMax(1);
      setGrpScope(mealIsDrink ? 'drink' : 'food');
      setOptRows([{ key: 1, name: '', delta: '0', isDefault: false }]);
    } catch {
      Alert.alert('Error', 'Could not create group');
    }
  };

  return (
    <Modal visible={grpOpen} animationType="slide" onRequestClose={() => setGrpOpen(false)}>
  <View style={[styles.sheet, { paddingTop: insets.top + 6 }]}>
    <View style={styles.grabber} />

    {/* header */}
    <View style={styles.modalHeadRow}>
      <BackArrow onPress={() => setGrpOpen(false)} variant="filled" style={{ marginRight: 6 }} />
      <Text style={styles.sheetTitle}>New Option Group</Text>
      <View style={{ width: 36 }} />
    </View>

        <ScrollView contentContainerStyle={styles.sheetBody}>
          {/* group name */}
          <View style={styles.field}>
            <Text style={styles.label}>Group name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Spiciness, Size, Milk type"
              placeholderTextColor="#a1a1aa"
              value={grpName}
              onChangeText={setGrpName}
            />
          </View>

          {/* toggles as cards */}
          <View style={styles.twoCol}>
            <TouchableOpacity onPress={() => setGrpRequired(v => !v)} style={styles.cardToggle}>
              <View style={styles.cardToggleHead}>
                <Text style={styles.toggleTitle}>Required</Text>
                <Feather name={grpRequired ? 'toggle-right' : 'toggle-left'} size={28} color="#10b981" />
              </View>
              <Text style={styles.hint}>Customers must choose at least one option.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setGrpSingle(v => !v)} style={styles.cardToggle}>
              <View style={styles.cardToggleHead}>
                <Text style={styles.toggleTitle}>Single choice</Text>
                <Feather name={grpSingle ? 'toggle-right' : 'toggle-left'} size={28} color="#10b981" />
              </View>
              <Text style={styles.hint}>If off, customers may pick multiple options.</Text>
            </TouchableOpacity>
          </View>

          {/* min/max only when multi-select */}
          {!grpSingle && (
            <View style={styles.twoCol}>
              <View style={styles.field}>
                <Text style={styles.label}>Min select</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="number-pad"
                  value={String(grpMin)}
                  onChangeText={setGrpMin}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Max select (0 = ∞)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="number-pad"
                  value={String(grpMax)}
                  onChangeText={setGrpMax}
                />
              </View>
            </View>
          )}

          {/* scope segmented control */}
          <View style={styles.field}>
            <Text style={styles.label}>Applies to</Text>
            <View style={styles.segment}>
              {['food','drink','both'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentBtn, grpScope === s && styles.segmentOn]}
                  onPress={() => setGrpScope(s)}
                >
                  <Text style={[styles.segmentTxt, grpScope === s && styles.segmentTxtOn]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* options editor as cards */}
          <Text style={[styles.label, { marginTop: 8 }]}>Options</Text>
          {optRows.map(r => (
            <View key={r.key} style={styles.optCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Option name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., No ice / Whole milk / Large"
                  placeholderTextColor="#a1a1aa"
                  value={r.name}
                  onChangeText={(t) => updateOptRow(r.key, { name: t })}
                />
              </View>

              <View style={{ width: 110, marginLeft: 10 }}>
                <Text style={styles.smallLabel}>Price delta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+0.00"
                  placeholderTextColor="#a1a1aa"
                  keyboardType="decimal-pad"
                  value={r.delta}
                  onChangeText={(t) => updateOptRow(r.key, { delta: t })}
                />
              </View>

              <View style={styles.optActions}>
                <TouchableOpacity
                  onPress={() => toggleDefault(r.key)}
                  style={[styles.defaultBadge, r.isDefault && styles.defaultBadgeOn]}
                >
                  <Feather name="star" size={16} color={r.isDefault ? '#b45309' : '#9ca3af'} />
                  <Text style={[styles.defaultTxt, r.isDefault && { color: '#b45309', fontWeight: '700' }]}>
                    Default
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeOptRow(r.key)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={addOptRow} style={styles.addOptBtn}>
            <Feather name="plus" size={16} />
            <Text style={styles.addOptTxt}>Add option</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.modalFooter, { paddingHorizontal: 16, paddingBottom: 24 }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={createGroup}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


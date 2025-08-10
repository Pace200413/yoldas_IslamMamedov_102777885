import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.5:4000';

export default function MealItem({ item, restaurantId }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState(null);
  const [picked, setPicked] = useState({}); // {groupId: Set(optionIds)}
  const [loading, setLoading] = useState(false);

  const ensureLoaded = async () => {
    setLoading(true);
    try {
       console.log('ensureLoaded for meal', item.id);

       // Block out-of-stock before anything
       if (item.outOfStock) {
         Alert.alert('Out of stock', `${item.name} is not available right now.`);
         return;
       }  
      const { data } = await axios.get(`${API_BASE}/api/modifiers/meals/${item.id}`);
      setGroups(data || []);
      if (!data || data.length === 0) {
        // No options → add straight away
        add({ id: item.id, name: item.name, price: Number(item.price), restaurantId, customizations: [] });
       const raw  = Number(item.price) || 0;
         const base = item.discount ? +(raw * (1 - item.discount/100)).toFixed(2) : raw;
        add({ id: item.id, name: item.name, price: base, restaurantId, customizations: [] });  
    }
       else {
        // init picked sets (defaults)
        const init = {};
        data.forEach(g => {
          const def = g.options.filter(o => o.is_default).map(o => o.id);
          init[g.id] = new Set(def);
        });
        setPicked(init);
        setOpen(true);
      }
    } catch (e) {
      console.warn('modifier fetch failed', e.message);
      Alert.alert('Error', 'Could not load options');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (g, optId) => {
    const current = new Set(picked[g.id] || []);
    if (g.max_select === 1) {
      // radio
      picked[g.id] = new Set([optId]);
    } else {
      // checkbox with max
      if (current.has(optId)) current.delete(optId);
      else {
        if (g.max_select === 0 || current.size < g.max_select) current.add(optId);
        else return; // ignore beyond max
      }
      picked[g.id] = current;
    }
    setPicked({ ...picked });
  };

  const deltaTotal = () => {
    if (!groups) return 0;
    let sum = 0;
    groups.forEach(g => {
      const sel = [...(picked[g.id] || [])];
      g.options.forEach(o => { if (sel.includes(o.id)) sum += Number(o.price_delta || 0); });
    });
    return sum;
  };

  const confirm = () => {
    // validate required/min
    for (const g of groups) {
      const n = (picked[g.id] || new Set()).size;
      if (g.required && n < Math.max(1, g.min_select || 0)) {
        return Alert.alert('Choose options', `Please select at least ${Math.max(1, g.min_select || 0)} in "${g.name}".`);
      }
    }
    const selections = [];
    groups.forEach(g => {
      (picked[g.id] || new Set()).forEach(optId => {
        const opt = g.options.find(o => o.id === optId);
        selections.push({
          groupId: g.id, group: g.name,
          optionId: opt.id, option: opt.name,
          delta: Number(opt.price_delta || 0),
        });
      });
    });

    const finalPrice = Number(item.price) + deltaTotal();
    add({
      id: item.id,
      name: item.name,
      price: finalPrice,
      restaurantId,
      customizations: selections,
    });
    setOpen(false);
  };

  return (
    <>
      <View style={styles.row}>
        <Image
          source={item.photo ? { uri: item.photo } : require('../assets/icons/la-casa-logo.jpg')}
          style={styles.img}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
       {Number(item.discount) > 0 ? (
         <Text style={styles.price}>
           <Text style={{ textDecorationLine:'line-through', color:'#9ca3af' }}>
             TMT {Number(item.price).toFixed(2)}
           </Text>
           {`  TMT ${(Number(item.price)*(1-item.discount/100)).toFixed(2)} (-${item.discount}%)`}
         </Text>
       ) : (
         <Text style={styles.price}>TMT {Number(item.price).toFixed(2)}</Text>
       )}
           </View>
        <TouchableOpacity style={styles.addBtn} onPress={ensureLoaded} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="add" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Customize {item.name}</Text>
          <ScrollView>
            {groups?.map(g => (
              <View key={g.id} style={styles.group}>
                <Text style={styles.groupTitle}>
                  {g.name}
                  {!!g.required && ' *'}
                  {g.max_select === 1 ? ' (choose 1)' :
                   g.max_select > 1 ? ` (up to ${g.max_select})` : ''}
                </Text>
                {g.options.map(o => {
                  const selected = (picked[g.id] || new Set()).has(o.id);
                  return (
                    <TouchableOpacity
                      key={o.id}
                      onPress={() => toggle(g, o.id)}
                      style={[styles.opt, selected && styles.optSelected]}
                    >
                      <Text style={styles.optName}>{o.name}</Text>
                      <Text style={styles.optDelta}>
                        {o.price_delta >= 0 ? '+' : ''}{Number(o.price_delta).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.total}>
              Total: TMT {(Number(item.price) + deltaTotal()).toFixed(2)}
            </Text>
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
  row:{ flexDirection:'row', alignItems:'center', marginBottom:18 },
  img:{ width:70, height:70, borderRadius:8, marginRight:10 },
  name:{ fontSize:16, fontWeight:'500' },
  price:{ fontSize:14, marginTop:4 },
  addBtn:{ backgroundColor:'#10b981', padding:8, borderRadius:18, minWidth:36, alignItems:'center' },

  modal:{ flex:1, padding:16, backgroundColor:'#fff' },
  modalTitle:{ fontSize:18, fontWeight:'700', marginBottom:12 },
  group:{ marginBottom:14 },
  groupTitle:{ fontWeight:'600', marginBottom:8 },
  opt:{ padding:12, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  optSelected:{ borderColor:'#10b981', backgroundColor:'#ecfdf5' },
  optName:{ fontSize:14 },
  optDelta:{ fontSize:14 },
  footer:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTopWidth:1, borderColor:'#eee' },
  total:{ fontSize:16, fontWeight:'700' },
  confirm:{ backgroundColor:'#10b981', paddingVertical:12, paddingHorizontal:16, borderRadius:10 },
});

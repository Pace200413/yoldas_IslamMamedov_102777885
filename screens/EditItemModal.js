import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditItemModal({ route, navigation }) {
  const { initial, onSave } = route.params;   // `initial` may be null for “add”
  const [name, setName]       = useState(initial?.name || '');
  const [price, setPrice]     = useState(String(initial?.price || ''));
  const [description, setDesc]= useState(initial?.description || '');
  const [available, setAvail] = useState(initial?.available ?? true);
  const [discount, setDisc]   = useState(String(initial?.discount || '0'));

  const save = () => {
    if (!name.trim()) return alert('Name required');
    onSave({
      id: initial?.id || Date.now().toString(),
      name: name.trim(),
      price: parseFloat(price) || 0,
      description,
      available,
      discount: parseInt(discount) || 0,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{initial ? 'Edit item' : 'Add new item'}</Text>

      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Price" style={styles.input} keyboardType="decimal-pad"
                 value={price} onChangeText={setPrice} />
      <TextInput placeholder="Description" style={[styles.input,{height:80}]}
                 multiline value={description} onChangeText={setDesc} />

      <View style={styles.row}>
        <Text>Available</Text>
        <Switch value={available} onValueChange={setAvail} />
      </View>

      <TextInput placeholder="Discount % (0-100)" style={styles.input}
                 keyboardType="number-pad" value={discount} onChangeText={setDisc} />

      <TouchableOpacity style={styles.save} onPress={save}>
        <Text style={{color:'#fff',fontWeight:'600'}}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#fff' },
  h1:{ fontSize:20, fontWeight:'700', marginBottom:20 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:8,
          padding:12, marginBottom:15 },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
        marginBottom:15 },
  save:{ backgroundColor:'#2563eb', padding:15, borderRadius:8, alignItems:'center' },
});

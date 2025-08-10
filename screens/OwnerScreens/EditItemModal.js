// screens/OwnerScreens/EditItemModal.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:4000'
  : 'http://192.168.0.5:4000';

export default function EditItemModal({ route, navigation }) {
  const { id, name: origName, price: origPrice, photo: origPhoto } = route.params;
  const [name, setName]   = useState(origName);
  const [price, setPrice] = useState(String(origPrice ?? ''));
  const [photo, setPhoto] = useState(origPhoto);
  const [busy,  setBusy]  = useState(false);
  const [outOfStock, setOutOfStock] = useState(route.params?.outOfStock ?? 0);
  const [discount, setDiscount] = useState(String(route.params?.discount ?? ''));
  // pick new image
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:    ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect:        [4,3],
      quality:       0.7,
    });
    if (!res.canceled && res.assets.length) {
      setPhoto(res.assets[0].uri);
    }
  };

  // save changes
  const save = async () => {
    if (!name.trim() || !price.trim()) {
      return Alert.alert('Validation', 'Name and price required');
    }
    const val = Number(price);
    if (isNaN(val)) {
      return Alert.alert('Validation', 'Price must be a number');
    }
    try {
      setBusy(true);
      await axios.patch(
        `${API_BASE}/api/menu/meals/${id}`,
        {
          name:  name.trim(),
          price: val,
          photo: photo || '',
          discount: Number(discount) || 0,
          outOfStock: outOfStock ? 1 : 0
        }
      );
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save changes');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ← Add this */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ padding: 8, marginBottom: 16 }}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Menu Item</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Photo</Text>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photoPreview} />
      ) : null}
      <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
        <Ionicons name="image" size={20} color="#fff" />
        <Text style={styles.photoBtnText}>Change Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, busy && styles.disabled]}
        onPress={save}
        disabled={busy}
      >
        {busy
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveText}>Save Changes</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:16, backgroundColor:'#f9fafb' },
  title:        { fontSize:20, fontWeight:'700', marginBottom:24 },
  label:        { marginTop:12, fontSize:14, fontWeight:'600' },
  input:        {
    backgroundColor:'#fff', padding:12, borderRadius:8,
    borderWidth:1, borderColor:'#ddd', marginTop:6
  },
  photoPreview: { width:120, height:90, borderRadius:8, marginTop:6 },
  photoBtn:     {
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#10b981', padding:10, borderRadius:8, marginTop:8
  },
  photoBtnText: { color:'#fff', marginLeft:6, fontWeight:'600' },
  saveBtn:      {
    marginTop:32, backgroundColor:'#10b981',
    padding:14, alignItems:'center', borderRadius:8
  },
  saveText:     { color:'#fff', fontWeight:'600' },
  disabled:     { opacity:0.6 }
});

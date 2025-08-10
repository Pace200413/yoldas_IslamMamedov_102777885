// screens/OwnerScreens/OwnerRestaurantSetupScreen.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  SafeAreaView, ScrollView, View, Text, TextInput,
  TouchableOpacity, Image, Alert, StyleSheet, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRestaurants } from '../../context/RestaurantContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../../backend/config/api';

export default function OwnerRestaurantSetupScreen() {
  const nav = useNavigation();
  const { owner }      = useRoute().params;      // { ownerId, restaurantName }
  const { addRestaurant } = useRestaurants();

  /* form state */
  const [rName,   setRName]   = useState('');
  const [loc,     setLoc]     = useState('');
  const [cuisine, setCuisine] = useState('');
  const [desc,    setDesc]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [opens,   setOpens]   = useState('');
  const [closes,  setCloses]  = useState('');
  const [photoUri,setPhotoUri]= useState(null);
  const [loading, setLoading] = useState(false);

  /* ask for gallery permission */
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required',
            'Camera roll permission is needed to select an image.');
        }
      }
    })();
  }, []);

  /* pick image */
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!res.canceled && res.assets?.length) {
        setPhotoUri(res.assets[0].uri);
      }
    } catch (e) { console.log('ImagePicker error:', e); }
  };

  /* create restaurant */
  const handleCreate = async () => {
    if (!rName.trim() || !loc.trim() || !cuisine.trim()) {
      return Alert.alert('Missing fields', 'Fill in name, location & cuisine.');
    }

    setLoading(true);
    try {
      const payload = {
        rName : rName.trim(),
        loc   : loc.trim(),
        cuisine,
        photo : photoUri ?? '',
        description: desc.trim(),
        phone : phone.trim(),
        opens : opens.trim(),
        closes: closes.trim(),
      };

      const { data: created } = await axios.post(
        `${API_BASE}/api/owners/${owner.ownerId}/restaurants`,
        payload
      );

      addRestaurant(created);
      nav.replace('NewHome');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'Could not create restaurant');
    } finally { setLoading(false); }
  };

  /* ------------------- UI ------------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={nav.goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Create a Restaurant</Text>

        <TextInput style={styles.input} placeholder="Restaurant Name"
          value={rName} onChangeText={setRName}/>
        <TextInput style={styles.input} placeholder="Location"
          value={loc} onChangeText={setLoc}/>
        <TextInput style={styles.input} placeholder="Cuisine"
          value={cuisine} onChangeText={setCuisine}/>

        <TextInput style={[styles.input,{height:80,textAlignVertical:'top'}]}
          placeholder="Short description" multiline
          value={desc} onChangeText={setDesc}/>

        <TextInput style={styles.input} placeholder="Phone"
          value={phone} onChangeText={setPhone}/>
        <TextInput style={styles.input} placeholder="Opens (e.g. 09:00)"
          value={opens} onChangeText={setOpens}/>
        <TextInput style={styles.input} placeholder="Closes (e.g. 22:00)"
          value={closes} onChangeText={setCloses}/>

        <View style={styles.photoSection}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.photoPreview}/>
            : <View style={styles.photoPlaceholder}>
                <Feather name="image" size={40} color="#aaa"/>
                <Text style={{color:'#aaa',marginTop:8}}>No photo chosen</Text>
              </View>}
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Text style={styles.photoBtnText}>Select Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button,loading&&styles.buttonDisabled]}
          onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Creating…' : 'Create & View Public Home'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles (unchanged) ─── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoPlaceholder: {
    width: 120,
    height: 90,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  photoBtnText: { color: '#fff', fontWeight: '600' },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#a5d6a7' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

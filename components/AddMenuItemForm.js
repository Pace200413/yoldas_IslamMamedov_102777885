// src/components/AddMenuItemForm.js
import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddMenuItemForm = ({
  styles,
  name, setName,
  price, setPrice,
  description, setDescription,
  category, setCategory,
  photo, pickImage,
  busy, handleAdd,
}) => (
  <View style={styles.cardShell}>
    <LinearGradient colors={['#ffffff', '#fbfbfb']} start={[0, 0]} end={[1, 1]} style={styles.form}>
      <Text style={styles.heading}>Add Menu Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#a1a1aa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#a1a1aa"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Description (optional)"
        placeholderTextColor="#a1a1aa"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* category */}
      <View style={styles.pickRow}>
        {['Food', 'Drinks'].map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.catBtn, category === opt && styles.catBtnActive]}
            onPress={() => setCategory(opt)}
          >
            <Text style={[styles.catTxt, category === opt && styles.catTxtActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* photo */}
      <View style={styles.photoRow}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Feather name="image" size={28} color="#c7c7cc" />
          </View>
        )}
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Feather name="upload" size={18} color="#fff" />
          <Text style={styles.photoBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* submit */}
      <LinearGradient colors={['#34D399', '#059669']} style={styles.gradientBtn}>
        <TouchableOpacity onPress={handleAdd} style={[styles.btnInner, busy && { opacity: 0.6 }]} disabled={busy}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.btnText}>{busy ? 'Adding…' : 'Add Item'}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  </View>
);

export default memo(AddMenuItemForm);

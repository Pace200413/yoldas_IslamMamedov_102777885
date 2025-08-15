// screens/OwnerScreens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
export default function SignUpScreen() {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigation();
  const { signIn } = useAuth();
  const API_BASE = Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://172.17.0.48:4000';

  const handleSignUp = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        return alert(error || 'Could not register');
      }
        const { ownerId, restaurantName, token } = await res.json();
        await signIn({ token, ownerId, restaurantName });
      nav.replace('OwnerHome', { ownerId, restaurantName });
    } catch (err) {
      console.error(err);
      alert('Network error: ' + err.message);
    }
  };
console.log('⏩ signup URL =', `${API_BASE}/auth/signup`);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex:1, backgroundColor:'#fff' },
  container: { padding:20 },
  label:     { marginTop:16, fontWeight:'600' },
  input:     {
    borderWidth:1, borderColor:'#d1d5db',
    borderRadius:8, padding:10, marginTop:4
  },
  button:    {
    backgroundColor:'#10b981',
    padding:14, borderRadius:24,
    alignItems:'center', marginTop:24
  },
  buttonText:{ color:'#fff', fontWeight:'600' }
});

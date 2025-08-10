import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignInScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigation               = useNavigation();

  // Adjust these URLs as needed:
  const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:4000'          // Android emulator
  : 'http://192.168.0.5:4000'; 

  const handleSignIn = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // parse and show server-side error message
        const { error } = await res.json().catch(() => ({}));
        return alert(error || 'Invalid credentials');
      }

      const { ownerId, restaurantName } = await res.json();
      // Navigate into OwnerHome and prevent back
      navigation.replace('OwnerOnboarding', {
  screen: 'OwnerHome',
  params: { ownerId, restaurantName },
});
    } catch (err) {
      console.error('SignIn error:', err);
      alert(`Network error: could not reach ${API_BASE}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.caption}>Enter the email you registered with</Text>

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.caption}>Your password must be at least 8 characters</Text>

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex:1, backgroundColor:'#fff' },
  container: { padding:20 },
  label:     { fontSize:14, fontWeight:'600', color:'#1f2937', marginTop:16, marginBottom:6 },
  input:     {
    borderWidth:1,
    borderColor:'#d1d5db',
    borderRadius:8,
    paddingHorizontal:12,
    paddingVertical:10,
    fontSize:16,
    color:'#1f2937'
  },
  caption:   { fontSize:12, color:'#6b7280', marginTop:4, marginBottom:8 },
  button:    {
    backgroundColor:'#10b981',
    paddingVertical:14,
    borderRadius:24,
    alignItems:'center',
    marginTop:24
  },
  buttonText:{ color:'#fff', fontSize:16, fontWeight:'600' },
});

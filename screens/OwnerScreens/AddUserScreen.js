import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage                from '@react-native-async-storage/async-storage';

export default function AddUserScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const store      = route.params?.store;

  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('');

  const submit = async () => {
    if (!name.trim() || !email.trim() || !role.trim()) {
      return Alert.alert('Missing', 'All fields required.');
    }
    // in real app: persist to AsyncStorage or API
    Alert.alert('Added!', `${name.trim()} has been added.`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Text>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{store?.rName} Users</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Role (e.g. Staff)"
          value={role}
          onChangeText={setRole}
        />

        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Add User</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex:1, backgroundColor:'#fff' },
  header:    { flexDirection:'row', alignItems:'center', padding:16 },
  title:     { fontSize:18, fontWeight:'600', marginLeft:12 },

  form:      { padding:16 },
  input:     {
    borderWidth:1, borderColor:'#ddd', borderRadius:8,
    padding:12, marginBottom:16
  },
  button:    {
    backgroundColor:'#3b82f6', padding:16,
    borderRadius:8, alignItems:'center'
  },
  buttonText:{ color:'#fff', fontWeight:'600', fontSize:16 },
});

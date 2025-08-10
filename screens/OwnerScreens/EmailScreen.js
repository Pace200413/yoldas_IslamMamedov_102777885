// screens/OwnerScreens/EmailScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Platform
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const API =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.5:4000';

export default function EmailScreen({ route }) {
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');
  const [busy,    setBusy]    = useState(false);
  const { restaurantId } = route.params;  
  const send = async () => {
    if (!subject || !body) return Alert.alert('Fill subject & body');
    try {
      setBusy(true);
      await axios.post(`${API}/api/email/send`, {
        restaurantId,
        subject, body,
      });
      setSubject(''); setBody('');
      Alert.alert('Sent!', 'Your customers will receive the message shortly.');
    } catch {
      Alert.alert('Error', 'Could not send');
    } finally { setBusy(false); }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={styles.label}>Subject</Text>
      <TextInput
        value={subject} onChangeText={setSubject}
        style={styles.input} placeholder="Promo this weekend"
      />

      <Text style={styles.label}>Body</Text>
      <TextInput
        value={body} onChangeText={setBody}
        style={[styles.input,{ height:120, textAlignVertical:'top' }]}
        multiline
        placeholder="Write your message…"
      />

      <TouchableOpacity style={styles.btn} onPress={send} disabled={busy}>
        <Ionicons name="send" size={18} color="#fff"/>
        <Text style={styles.btnTxt}>{busy ? 'Sending…' : 'Send email blast'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label:{ fontSize:14, fontWeight:'600', marginTop:16, marginBottom:6 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:12 },
  btn:{ flexDirection:'row', alignItems:'center', justifyContent:'center',
        backgroundColor:'#10b981', padding:14, borderRadius:24, marginTop:24 },
  btnTxt:{ color:'#fff', fontWeight:'700', marginLeft:8 },
});

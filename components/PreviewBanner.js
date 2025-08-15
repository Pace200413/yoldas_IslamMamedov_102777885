// components/PreviewBanner.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export default function PreviewBanner({ onExit }) {
  return (
    <View style={s.wrap}>
      <Text style={s.txt}>Previewing as Customer</Text>
      <TouchableOpacity onPress={onExit}><Text style={s.btn}>Exit</Text></TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  wrap:{position:'absolute',top:0,left:0,right:0,backgroundColor:'#111827',padding:8,flexDirection:'row',justifyContent:'space-between',zIndex:1000},
  txt:{color:'#fff',fontWeight:'600'}, btn:{color:'#10b981',fontWeight:'700'}
});

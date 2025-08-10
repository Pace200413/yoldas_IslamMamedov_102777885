import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '../context/OrderContext';

export default function OrderStatusScreen() {
  const navigation        = useNavigation();
  const insets            = useSafeAreaInsets();
  const { order, stages, dispatch } = useOrder();

  /* demo: advance stage every 5 s */
  useEffect(() => {
    if (!order) return;
    if (order.stageIndex === stages.length - 1) return;
    const t = setTimeout(() => dispatch({ type: 'ADVANCE' }), 5000);
    return () => clearTimeout(t);
  }, [order]);

  /* back arrow */
  const BackArrow = () => (
    <TouchableOpacity
      onPress={() =>
        navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')
      }
      style={[styles.back, { top: insets.top + 6 }]}
      hitSlop={8}
    >
      <Ionicons name="arrow-back" size={28} color="#111" />
    </TouchableOpacity>
  );

  if (!order) {
    return (
      <View style={styles.center}>
        <BackArrow />
        <Text>No active order.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackArrow />

      <Text style={styles.title}>Order #{order.id}</Text>
      <Text style={styles.stage}>{stages[order.stageIndex]}</Text>

      <View style={{ marginTop: 30 }}>
        {order.items.map(i => (
          <Text key={i.id}>
            {i.name} × {i.qty}
          </Text>
        ))}
      </View>

      {order.stageIndex === stages.length - 1 && (
        <Text style={styles.finalTxt}>
          🎉 Enjoy your meal! Tap ← to go home.
        </Text>
      )}
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  container:{ flex:1, paddingTop:60, paddingHorizontal:24 },
  back:{ position:'absolute', left:16, zIndex:20, padding:6 },
  title:{ fontSize:22, fontWeight:'700' },
  stage:{ fontSize:28, fontWeight:'600', marginTop:20 },
  center:{ flex:1, justifyContent:'center', alignItems:'center' },
  finalTxt:{ marginTop:40, fontSize:16 },
});

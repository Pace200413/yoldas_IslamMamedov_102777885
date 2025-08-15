// success/screens/OwnerScreens/StoreDetailScreen.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';

/* real screens */
import MenuManagerScreen from './MenuManagerScreen';
import StockScreen       from './StockScreen';
import SpecialsScreen    from './SpecialsScreen';
import OrdersScreen      from './OrdersScreen';
import EmailScreen       from './EmailScreen';
import ModifiersScreen   from './ModifiersScreen';
const Tab = createMaterialTopTabNavigator();

/* ───────────────── COMPONENT ───────────────── */
export default function StoreDetailScreen() {
  const navigation = useNavigation();
  const { store }  = useRoute().params || {};
  if (!store) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>No store supplied 🤔</Text>
      </View>
    );
  }

  const { id: restaurantId, rName } = store;

  /* static header (no picker) */
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>{rName}</Text>
      </View>

      <TouchableOpacity onPress={navigation.openDrawer} style={styles.iconBtn}>
        <Feather name="menu" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.flex}>
      <Header />

      <Tab.Navigator
        // fixed toggle bar – no horizontal scroll
        screenOptions={{
          swipeEnabled        : false,
          tabBarScrollEnabled : false,
          tabBarIndicatorStyle: { backgroundColor: '#10b981', height: 3 },
          tabBarLabelStyle    : { fontWeight: '600', textTransform: 'none' },
          tabBarItemStyle     : { flex: 1 },               // equal width
          tabBarStyle         : { backgroundColor: '#fff', elevation: 3 },
        }}
      >
        <Tab.Screen name="Menus"    component={MenuManagerScreen} initialParams={{ restaurantId }} />
        <Tab.Screen name="Stock"    component={StockScreen}       initialParams={{ restaurantId }} />
        <Tab.Screen name="Specials" component={SpecialsScreen}    initialParams={{ restaurantId }} />
        <Tab.Screen name="Options"  component={ModifiersScreen}   initialParams={{ restaurantId }} />
        <Tab.Screen name="Orders"   component={OrdersScreen}      initialParams={{ restaurantId }} />
        <Tab.Screen name="Email"    component={EmailScreen}       initialParams={{ restaurantId }} />
      </Tab.Navigator>
    </View>
  );
}

/* ───────────────── styles ───────────────── */
const styles = StyleSheet.create({
  flex   : { flex: 1, backgroundColor: '#f9fafb' },
  center : { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header : {
    flexDirection     : 'row',
    alignItems        : 'center',
    paddingHorizontal : 16,
    paddingVertical   : 12,
    backgroundColor   : '#fff',
    ...Platform.select({
      android: { elevation: 4 },
      ios    : { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    }),
  },
  titleBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title   : { fontSize: 18, fontWeight: '700' },
  iconBtn : { padding: 6 },
});

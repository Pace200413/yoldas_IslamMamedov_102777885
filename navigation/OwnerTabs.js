import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ItemListScreen    from '../ItemListScreen';
import OrdersScreen      from '../OrdersScreen';
import AccountHomeScreen from '../AccountHomeScreen';

const Tab = createBottomTabNavigator();

export default function OwnerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Menu"    component={ItemListScreen} />
      <Tab.Screen name="Orders"  component={OrdersScreen}  />
      <Tab.Screen name="Profile" component={AccountHomeScreen} />
    </Tab.Navigator>
  );
}

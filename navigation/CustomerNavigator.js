// navigation/CustomerNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RestaurantListScreen from '../screens/RestaurantListScreen';
import RestaurantMenuScreen from '../screens/OwnerScreens/RestaurantMenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
    </Stack.Navigator>
  );
}

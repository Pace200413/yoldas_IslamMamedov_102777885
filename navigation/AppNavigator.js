// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import NewHomeScreen from '../screens/NewHomeScreen';
import HomeScreen from '../screens/HomeScreen';
import RestaurantMenuScreen from '../screens/OwnerScreens/RestaurantMenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import AdminNavigator from './AdminNavigator';
import OwnerNavigator from './OwnerNavigator';
import AccountNavigator from './AccountNavigator';
import SignInScreen from '../screens/OwnerScreens/SignInScreen';
import SignUpScreen from '../screens/OwnerScreens/SignUpScreen';
import TestScreen from '../screens/TestScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';

const Stack = createNativeStackNavigator();

// TEMP: if you suspect NewHomeScreen has the text warning, swap this in:
// const NewHomeScreen = () => (
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Home</Text>
//   </View>
// );

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="NewHome">
      <Stack.Screen name="NewHome" component={NewHomeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
      <Stack.Screen name="AdminPanel" component={AdminNavigator} />
      <Stack.Screen name="OwnerOnboarding" component={OwnerNavigator} />
      <Stack.Screen name="AccountHub" component={AccountNavigator} />
      <Stack.Screen name="SignInScreen" component={SignInScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="TestScreen" component={TestScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: 'Restaurants' }} />
    </Stack.Navigator>
  );
}

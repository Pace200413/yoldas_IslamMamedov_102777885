// navigation/OwnerNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens for owner under /screens/OwnerScreens
import OwnerHomeScreen    from '../screens/OwnerScreens/OwnerHomeScreen';
import StoreDetailScreen  from '../screens/OwnerScreens/StoreDetailScreen';
import UsersScreen        from '../screens/OwnerScreens/UsersScreen';
import AddUserScreen      from '../screens/OwnerScreens/AddUserScreen';
// ...any others like EditItemModal, OwnerRestaurantSetupScreen

const Stack = createNativeStackNavigator();

export default function OwnerNavigator() {
  return (
    <Stack.Navigator initialRouteName="OwnerHome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerHome"      component={OwnerHomeScreen} />
      <Stack.Screen name="StoreDetail"    component={StoreDetailScreen} />
      <Stack.Screen name="Users"          component={UsersScreen} />
      <Stack.Screen name="AddUser"        component={AddUserScreen} />
      {/* other Owner screens… */}
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountHomeScreen     from '../screens/AccountHomeScreen';
import BusinessCentreScreen  from '../screens/BusinessCentreScreen';
// (add other account-related screens as you create them)

const Stack = createNativeStackNavigator();

export default function AccountNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AccountHome"
        component={AccountHomeScreen}
      />
      <Stack.Screen
        name="BusinessCentre"
        component={BusinessCentreScreen}
      />
    </Stack.Navigator>
  );
}

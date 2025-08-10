// navigation/AdminNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// screens for admin under /screens
import AdminApprovalScreen   from '../screens/AdminApprovalScreen';
import BusinessCentreScreen  from '../screens/BusinessCentreScreen';
// ...and any others

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator initialRouteName="BusinessCentre" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessCentre"     component={BusinessCentreScreen} />
      <Stack.Screen name="Approval"      component={AdminApprovalScreen} />
      {/* add other Admin screens here */}
    </Stack.Navigator>
  );
}

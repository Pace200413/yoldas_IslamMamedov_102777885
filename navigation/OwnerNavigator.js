// navigation/OwnerNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* ───── 1) Auth screens ───── */
import SignInScreen               from '../screens/OwnerScreens/SignInScreen';
import SignUpScreen               from '../screens/OwnerScreens/SignUpScreen';

/* ───── 2) On-boarding screens ───── */
import OwnerRegistrationScreen    from '../screens/OwnerScreens/OwnerRegistrationScreen';
import OwnerRestaurantSetupScreen from '../screens/OwnerScreens/OwnerRestaurantSetupScreen';

/* ───── 3) Main owner flow ───── */
import OwnerHomeScreen            from '../screens/OwnerScreens/OwnerHomeScreen';
import StoreDetailScreen          from '../screens/OwnerScreens/StoreDetailScreen';
import MenuManagerScreen          from '../screens/OwnerScreens/MenuManagerScreen';
import ItemListScreen             from '../screens/OwnerScreens/ItemListScreen';
import EditItemModal              from '../screens/OwnerScreens/EditItemModal';

/* ───── 4) (Optional) Users flow ───── */
import UsersScreen                from '../screens/OwnerScreens/UsersScreen';
import AddUserScreen              from '../screens/OwnerScreens/AddUserScreen';

const Stack = createNativeStackNavigator();

export default function OwnerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      /* Hide the native header/arrow throughout the owner app;
         every screen that needs a header implements its own */
      screenOptions={{ headerShown: false }}
    >
      {/* 1️⃣ Authentication */}
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* 2️⃣ On-boarding */}
      <Stack.Screen name="OwnerRegistration"    component={OwnerRegistrationScreen} />
      <Stack.Screen name="OwnerRestaurantSetup" component={OwnerRestaurantSetupScreen} />

      {/* 3️⃣ Main owner flow */}
      <Stack.Screen name="OwnerHome"   component={OwnerHomeScreen} />
      <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <Stack.Screen name="MenuManager" component={MenuManagerScreen} />
      <Stack.Screen name="ItemList"    component={ItemListScreen} />
      <Stack.Screen
        name="EditItemModal"
        component={EditItemModal}
        options={{ presentation: 'modal', headerShown: false }}
      />

      {/* 4️⃣ Users management (optional) */}
      <Stack.Screen name="Users"   component={UsersScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      
    </Stack.Navigator>
  );
}

// App.js
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <OrderProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </OrderProvider>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

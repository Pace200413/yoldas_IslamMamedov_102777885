import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RestaurantProvider>
        <CartProvider>
          <OrderProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </OrderProvider>
        </CartProvider>
      </RestaurantProvider>
    </GestureHandlerRootView>
  );
}

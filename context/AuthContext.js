// context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/* Storage adapter: prefer SecureStore, fallback to AsyncStorage */
let Storage;
try {
  const SecureStore = require('expo-secure-store');
  Storage = {
    getItem:    (k) => SecureStore.getItemAsync(k),
    setItem:    (k, v) => SecureStore.setItemAsync(k, v),
    removeItem: (k) => SecureStore.deleteItemAsync(k),
  };
} catch {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  Storage = {
    getItem:    (k) => AsyncStorage.getItem(k),
    setItem:    (k, v) => AsyncStorage.setItem(k, v),
    removeItem: (k) => AsyncStorage.removeItem(k),
  };
}

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // { token?, ownerId, restaurantName }

  useEffect(() => {
    (async () => {
      try {
        const raw = await Storage.getItem('session');
        if (raw) setSession(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (payload) => {
    setSession(payload);
    await Storage.setItem('session', JSON.stringify(payload));
  };

  const signOut = async () => {
    setSession(null);
    await Storage.removeItem('session');
  };

  const value = useMemo(() => ({
  loading, signedIn: !!session, session,
  signIn, signOut,
  // preview flags kept only on client
  preview: session?.preview ?? false,
  setPreview: (v) => setSession(s => ({ ...(s||{}), preview: !!v })),
}), [loading, session]);

  // Never render raw strings here. Use null or a Splash component.
  if (loading) return null;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

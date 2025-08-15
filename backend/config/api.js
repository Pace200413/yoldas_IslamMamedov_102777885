// config/api.js  (used by your React Native app)
let host = '127.0.0.1';

try {
  // Only available inside the RN bundle
  const { Platform } = require('react-native');
  const Constants = require('expo-constants').default;

  if (Platform.OS === 'android') {
    host = '10.0.2.2'; // Android emulator loopback
  } else {
    // iOS simulator or physical device on LAN via Expo
    const uri = Constants?.expoConfig?.hostUri || Constants?.manifest?.debuggerHost;
    host = uri ? uri.split(':')[0] : host;
  }
} catch {
  // Running in Node (SSR/scripts) – keep default host
}

export const API_BASE = `http://${host}:4000`;
export default API_BASE;

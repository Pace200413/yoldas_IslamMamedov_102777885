// backend/routes/ownerRoutes.js
import express from 'express';
import {
  listOwnerRestaurants,   // GET (all or by owner)
  createRestaurant        // POST  /:ownerId/restaurants
} from '../controllers/ownerController.js';

const router = express.Router();

/* ─────────────────────────
   NOTE: Order matters!
   /restaurants must be
   declared BEFORE /:ownerId
   otherwise Express thinks
   the literal word “restaurants”
   is an :ownerId param.
   ───────────────────────── */
router.get('/restaurants',         listOwnerRestaurants);  // ← ALL restaurants
router.get('/:ownerId/restaurants', listOwnerRestaurants); // ← Owner-specific
router.post('/:ownerId/restaurants', createRestaurant);

export default router;
try {
  // -------- ONLY available inside the mobile bundle ----------
  const { Platform }        = require('react-native');
  const Constants           = require('expo-constants').default;

  // Pick correct host for emulator / device
  if (Platform.OS === 'android') {
    host = '10.0.2.2';             // Android emulator loop-back
  } else {
    // iOS simulator or physical device on LAN
    const debugHost =
      Constants.manifest?.debuggerHost ??
      Constants.expoConfig?.hostUri;       // Expo SDK ≥49

    host = debugHost ? debugHost.split(':')[0] : '127.0.0.1';
  }
} catch (_) {
  /* We’re in Node - keep default host */
}

export const API_BASE = 'http://192.168.0.5:4000';

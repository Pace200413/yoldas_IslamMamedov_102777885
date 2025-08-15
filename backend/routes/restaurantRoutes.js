// backend/routes/restaurantRoutes.js
import express from 'express';
import {
  listAllRestaurants,
  listRestaurantsForOwner,
  createRestaurant,
  approveRestaurant,
  updateRestaurantPhoto,
  listPendingRestaurants,
} from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', listAllRestaurants);
router.get('/pending', listPendingRestaurants);      // admin
router.get('/owner/:ownerId', listRestaurantsForOwner);
router.post('/owner/:ownerId', createRestaurant);
router.patch('/:id/approve', approveRestaurant);
router.put('/:id/photo', updateRestaurantPhoto);

export default router;

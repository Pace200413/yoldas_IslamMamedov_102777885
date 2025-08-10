// backend/routes/restaurantRoutes.js
import express from 'express';
import {
  listAllRestaurants,
  listRestaurantsForOwner,
  createRestaurant,
  approveRestaurant,
  updateRestaurantPhoto
} from '../controllers/restaurantController.js';

const router = express.Router();

// PUBLIC: every approved restaurant
// GET /api/restaurants
router.get('/', listAllRestaurants);

// OWNER: restaurants for one owner
// GET /api/restaurants/owner/:ownerId
router.get('/owner/:ownerId', listRestaurantsForOwner);

// OWNER: create a restaurant
// POST /api/restaurants/owner/:ownerId
router.post('/owner/:ownerId', createRestaurant);

// ADMIN: approve/unapprove
// PATCH /api/restaurants/:id/approve
router.patch('/:id/approve', approveRestaurant);
// PUT /api/restaurants/:id/photo
// DON'T use multer
router.put('/:id/photo', updateRestaurantPhoto);  // ✅ no upload middleware

export default router;
// backend/routes/mealRoutes.js
import express from 'express';
import {
  listMeals,
  addMeal,
  removeMeal,        // <— name must match the export above
} from '../controllers/menuController.js';

const router = express.Router({ mergeParams: true });

router
  .route('/restaurants/:restaurantId/meals')
  .get(listMeals)
  .post(addMeal);

router.delete('/meals/:mealId', removeMeal);

export default router;

// backend/routes/menuRoutes.js
import express from 'express';
import {
  listMeals,
  addMeal,
  updateMeal,
  removeMeal
} from '../controllers/menuController.js';

const router = express.Router();

router.get   ('/restaurants/:restaurantId/meals', listMeals);
router.post  ('/restaurants/:restaurantId/meals', addMeal);
router.patch ('/meals/:mealId',                   updateMeal);
router.delete('/meals/:mealId',                   removeMeal);

export default router;

import express from 'express';
import {
  listMeals,
  listSpecials,
  addMeal,
  updateMeal,   // alias of updateMealController
  removeMeal,
} from '../controllers/menuController.js';

const router = express.Router();

/** Sections with items; each item includes groups+options */
router.get   ('/restaurants/:restaurantId/meals',    listMeals);
router.get   ('/restaurants/:restaurantId/specials', listSpecials);

router.post  ('/restaurants/:restaurantId/meals',    addMeal);
router.patch ('/meals/:mealId',                      updateMeal);
router.delete('/meals/:mealId',                      removeMeal);

export default router;

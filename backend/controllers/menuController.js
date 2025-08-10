// backend/controllers/menuController.js
import {
  getMealsByRestaurant,
  createMeal,
  updateMeal as updateMealModel,
  deleteMeal
} from '../models/mealModel.js';

export const listMeals = async (req, res) => {
  // 1) parse & validate
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }

  try {
    const data = await getMealsByRestaurant(restaurantId);
    res.json(data);
  } catch (err) {
    console.error('🍔 listMeals error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

export const addMeal = async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }

  try {
    const insertId = await createMeal(restaurantId, req.body);
    res.status(201).json({ id: insertId });
  } catch (err) {
    console.error('🍔 addMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

// export updateMeal and removeMeal unchanged, but you can add similar validation if needed
export const updateMealController = async (req, res) => {
  const mealId = Number(req.params.mealId);
  if (!Number.isInteger(mealId) || mealId <= 0) {
    return res.status(400).json({ error: 'Invalid mealId' });
  }

  try {
    const updated = await updateMealModel(mealId, req.body);
    if (!updated) return res.status(400).json({ error: 'No valid fields to update' });
    res.json(updated);
  } catch (err) {
    console.error('🍔 updateMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

export const removeMeal = async (req, res) => {
  const mealId = Number(req.params.mealId);
  if (!Number.isInteger(mealId) || mealId <= 0) {
    return res.status(400).json({ error: 'Invalid mealId' });
  }

  try {
    await deleteMeal(mealId);
    res.status(204).end();
  } catch (err) {
    console.error('🍔 removeMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

export { updateMealController as updateMeal };

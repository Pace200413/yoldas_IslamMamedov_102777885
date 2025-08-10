// controllers/menuController.js
import {
  getMealsByRestaurant,
  createMeal,
  deleteMeal,
} from '../models/mealModel.js';   // <— point at the file above

export const listMeals = async (req, res) => {
  try {
    const data = await getMealsByRestaurant(req.params.restaurantId);
    res.json(data);
  } catch (err) {
    console.error('🍔 listMeals error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

export const addMeal = async (req, res) => {
  try {
    const id = await createMeal(req.params.restaurantId, req.body);
    res.status(201).json({ id });
  } catch (err) {
    console.error('🍔 addMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

export const removeMeal = async (req, res) => {
  try {
    await deleteMeal(req.params.mealId);
    res.status(204).end();
  } catch (err) {
    console.error('🍔 removeMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

import {
  createGroup, listGroupsForMeal, attachGroupToMeal,
  createOption, deleteOption
} from '../models/modifierModel.js';

export const getMealModifiers = async (req, res) => {
  try {
    const groups = await listGroupsForMeal(Number(req.params.mealId));
    res.json(groups);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const postGroup = async (req, res) => {
  try {
    const id = await createGroup(Number(req.params.restaurantId), req.body);
    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const linkGroupToMeal = async (req, res) => {
  try {
    await attachGroupToMeal(Number(req.params.mealId), Number(req.params.groupId));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const postOption = async (req, res) => {
  try {
    const id = await createOption(Number(req.params.groupId), req.body);
    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const removeOption = async (req, res) => {
  try {
    await deleteOption(Number(req.params.optionId));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

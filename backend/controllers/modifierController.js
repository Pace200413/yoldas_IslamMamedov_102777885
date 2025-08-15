import { pool } from '../config/db.js';
import {
  createGroup,
  listGroupsForMeal,
  listGroupsForRestaurant,
  attachGroupToMeal as attachGroupToMealModel,
  detachGroupFromMeal as detachGroupFromMealModel,
  createOption,
  deleteOption,
  deleteGroup as deleteGroupModel,
  updateGroup as updateGroupModel,
  updateOption as updateOptionModel,
} from '../models/modifierModel.js';

/* ── Query ──────────────────────────────────────────────── */
export const getMealModifiers = async (req, res) => {
  try {
    const mealId = Number(req.params.mealId);
    const groups = await listGroupsForMeal(mealId); // should include options
    res.json(groups);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const listGroups = async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);
    const groups = await listGroupsForRestaurant(restaurantId);
    res.json(groups);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Groups ─────────────────────────────────────────────── */
export const postGroup = async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);
    const body = req.body || {};

    const scope = ['food', 'drink', 'both'].includes(body.scope) ? body.scope : 'both';
    const required   = body.required ? 1 : 0;
    const min_select = Number(body.min_select) || 0;
    const max_select = Number(body.max_select) || 0;
    if (max_select && min_select > max_select) {
      return res.status(400).json({ error: 'min_select cannot exceed max_select' });
    }

    const id = await createGroup(restaurantId, {
      name: String(body.name || '').trim(),
      required,
      min_select,
      max_select,
      scope,
    });
    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const patchGroup = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const b = req.body || {};
    const payload = {};

    if (b.name !== undefined) payload.name = String(b.name).trim();
    if (b.required !== undefined) payload.required = b.required ? 1 : 0;
    if (b.min_select !== undefined) payload.min_select = Number(b.min_select) || 0;
    if (b.max_select !== undefined) payload.max_select = Number(b.max_select) || 0;
    if (b.scope !== undefined) {
      const s = String(b.scope);
      if (!['food', 'drink', 'both'].includes(s)) {
        return res.status(400).json({ error: 'invalid scope' });
      }
      payload.scope = s;
    }
    if (payload.max_select && payload.min_select > payload.max_select) {
      return res.status(400).json({ error: 'min_select cannot exceed max_select' });
    }

    const r = await updateGroupModel(groupId, payload);
    res.json(r);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const removeGroup = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    await deleteGroupModel(groupId); // cascade handled in model/DB
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Links ──────────────────────────────────────────────── */
export const linkGroupToMeal = async (req, res) => {
  try {
    const mealId  = Number(req.params.mealId);
    const groupId = Number(req.params.groupId);

    // tenancy & scope guard
    const [[meal]] = await pool.query(
      'SELECT id, restaurant_id, section FROM meals WHERE id=?',
      [mealId]
    );
    const [[group]] = await pool.query(
      'SELECT id, restaurant_id, COALESCE(scope,"both") AS scope FROM modifier_groups WHERE id=?',
      [groupId]
    );
    if (!meal || !group) return res.status(404).json({ error: 'Not found' });

    if (Number(meal.restaurant_id) !== Number(group.restaurant_id)) {
      return res.status(400).json({ error: 'Cross-restaurant attach not allowed' });
    }

    const mealType = String(meal.section || '').toLowerCase() === 'drinks' ? 'drink' : 'food';
    const scope = String(group.scope || 'both');
    if (!(scope === 'both' || scope === mealType)) {
      return res.status(400).json({ error: `Group not allowed for ${mealType}` });
    }

    await attachGroupToMealModel(mealId, groupId);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const unlinkGroupFromMeal = async (req, res) => {
  try {
    const mealId  = Number(req.params.mealId);
    const groupId = Number(req.params.groupId);
    await detachGroupFromMealModel(mealId, groupId);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Options ────────────────────────────────────────────── */
export const postOption = async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const id = await createOption(groupId, req.body || {});
    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const patchOption = async (req, res) => {
  try {
    const optionId = Number(req.params.optionId);
    const r = await updateOptionModel(optionId, req.body || {});
    res.json(r);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

export const removeOption = async (req, res) => {
  try {
    const optionId = Number(req.params.optionId);
    await deleteOption(optionId);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
};

// backend/controllers/menuController.js
import { pool } from '../config/db.js';
import {
  createMeal,
  updateMeal as updateMealModel,
  deleteMeal,
  getSpecialsByRestaurant,
} from '../models/mealModel.js';

/**
 * GET /api/menu/restaurants/:restaurantId/meals
 * Response: [{ title, items:[{ id, name, price, discount, outOfStock, groups:[{..., options:[]}] }]}]
 */
export const listMeals = async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }

  try {
    // 1) Meals
    const [meals] = await pool.query(
      `SELECT id, restaurant_id, name, price, photo, description, section,
              COALESCE(discount,0)     AS discount,
              COALESCE(out_of_stock,0) AS out_of_stock
         FROM meals
        WHERE restaurant_id = ?
        ORDER BY section, name`,
      [restaurantId]
    );

    if (!meals.length) return res.json([]);

    // 2) All attached groups (tolerant if the join table doesn't exist)
    const JOIN_TABLE = (process.env.MEAL_GROUP_TABLE || 'meal_group')
      .replace(/[^a-zA-Z0-9_]/g, '');
    const mealIds = meals.map(m => m.id);

    let mgRows = [];
    if (mealIds.length) {
      const placeholders = mealIds.map(() => '?').join(',');
      try {
        const [rows] = await pool.query(
          `SELECT mg.meal_id,
                  g.id, g.name,
                  COALESCE(g.required,0)   AS required,
                  COALESCE(g.min_select,0) AS min_select,
                  COALESCE(g.max_select,0) AS max_select,
                  COALESCE(g.scope,'both') AS scope
             FROM \`${JOIN_TABLE}\` mg
             JOIN modifier_groups g ON g.id = mg.group_id
            WHERE mg.meal_id IN (${placeholders})
            ORDER BY g.id`,
          mealIds
        );
        mgRows = rows;
      } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
          mgRows = [];
          console.warn(`[menu] join table "${JOIN_TABLE}" missing; returning meals without groups`);
        } else {
          throw e;
        }
      }
    }

    // 3) Options for all groups (batch)
    const groupIds = [...new Set(mgRows.map(r => r.id))];
    let optRows = [];
    if (groupIds.length) {
      const gph = groupIds.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT id, group_id, name,
                COALESCE(price_delta,0) AS price_delta,
                COALESCE(is_default,0)  AS is_default
           FROM modifier_options
          WHERE group_id IN (${gph})
          ORDER BY id`,
        groupIds
      );
      optRows = rows;
    }

    // 4) Assemble maps
    const optionsByGroup = new Map();
    for (const o of optRows) {
      if (!optionsByGroup.has(o.group_id)) optionsByGroup.set(o.group_id, []);
      optionsByGroup.get(o.group_id).push({
        id: o.id,
        name: o.name,
        price_delta: Number(o.price_delta) || 0,
        is_default: !!o.is_default,
      });
    }

    const groupsByMeal = new Map();
    for (const g of mgRows) {
      const dto = {
        id: g.id,
        name: g.name,
        required: !!g.required,
        min_select: g.min_select || 0,
        max_select: g.max_select || 0, // 0 = ∞
        scope: g.scope || 'both',
        options: optionsByGroup.get(g.id) || [],
      };
      if (!groupsByMeal.has(g.meal_id)) groupsByMeal.set(g.meal_id, []);
      groupsByMeal.get(g.meal_id).push(dto);
    }

    // 5) Normalize sections
    const bySection = new Map(); // title -> items[]
    for (const m of meals) {
      const item = {
        id: m.id,
        name: m.name,
        price: Number(m.price),
        photo: m.photo || '',
        description: m.description || '',
        section: m.section || 'Main',
        discount: Number(m.discount) || 0,
        outOfStock: Number(m.out_of_stock) || 0,
        groups: groupsByMeal.get(m.id) || [],
      };
      const title = item.section || 'Main';
      if (!bySection.has(title)) bySection.set(title, []);
      bySection.get(title).push(item);
    }

    const sections = [...bySection.entries()]
      .map(([title, items]) => ({ title, items }))
      .sort((a, b) => a.title.localeCompare(b.title));

    res.json(sections);
  } catch (err) {
    console.error('🍔 listMeals error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Specials: only items with discount > 0 ─────────────── */
export const listSpecials = async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }
  try {
    const rows = await getSpecialsByRestaurant(restaurantId);
    res.json(rows);
  } catch (err) {
    console.error('🍔 listSpecials error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Create meal ────────────────────────────────────────── */
export const addMeal = async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return res.status(400).json({ error: 'Invalid restaurantId' });
  }
  try {
    const insertId = await createMeal(restaurantId, req.body || {});
    res.status(201).json({ id: insertId });
  } catch (err) {
    console.error('🍔 addMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Update meal (partial) ──────────────────────────────── */
export const updateMealController = async (req, res) => {
  const mealId = Number(req.params.mealId);
  if (!Number.isInteger(mealId) || mealId <= 0) {
    return res.status(400).json({ error: 'Invalid mealId' });
  }
  try {
    const b = req.body || {};
    const patch = {};

    if ('outOfStock' in b) patch.outOfStock = b.outOfStock ? 1 : 0;
    if ('discount' in b) {
      const d = Math.max(0, Math.min(90, Number(b.discount) || 0));
      patch.discount = d;
    }
    if ('name' in b) patch.name = String(b.name).trim();
    if ('price' in b) patch.price = Number(b.price) || 0;
    if ('photo' in b) patch.photo = b.photo || '';
    if ('description' in b) patch.description = b.description || '';
    if ('section' in b) patch.section = b.section;

    const updated = await updateMealModel(mealId, patch);
    if (!updated) return res.status(400).json({ error: 'No valid fields to update' });
    res.json(updated);
  } catch (err) {
    console.error('🍔 updateMeal error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

/* ── Delete meal ────────────────────────────────────────── */
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

/* Keep the alias some routes expect */
export { updateMealController as updateMeal };

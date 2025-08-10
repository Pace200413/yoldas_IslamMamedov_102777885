// backend/models/mealModel.js
import { pool } from '../config/db.js';

/** Safely trim strings */
const clean = s => (s ?? '').trim();

/**
 * Fetch & group meals by section
 */
export const getMealsByRestaurant = async restaurantId => {
  const [rows] = await pool.query(
    `SELECT
       id,
       section,
       name,
       price,
       photo,                       -- ← include photo here
       out_of_stock    AS outOfStock,
       discount,
       daily_special   AS dailySpecial
     FROM meals
     WHERE restaurant_id = ?
     ORDER BY section, id`,
    [restaurantId]
  );
  const grouped = rows.reduce((acc, r) => {
    (acc[r.section] ??= []).push(r);
    return acc;
  }, {});
  return Object.entries(grouped).map(([title, items]) => ({ title, items }));
};

/**
 * Insert a new meal **including** owner_id
 */
export const createMeal = async (
  restaurantId,
  { section = 'Main', name, price, photo = null }
) => {
  // 1) lookup owner_id for this restaurant
  const [restRows] = await pool.query(
    'SELECT owner_id FROM restaurants WHERE id = ?',
    [restaurantId]
  );
  if (!restRows.length) {
    throw new Error(`Restaurant ${restaurantId} not found`);
  }
  const ownerId = restRows[0].owner_id;

  // 2) insert meal with owner_id
  const [res] = await pool.query(
    `INSERT INTO meals
       (restaurant_id, owner_id, section, name, price, photo, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      restaurantId,
      ownerId,
      clean(section),
      clean(name),
      price,
      photo
    ]
  );
  return res.insertId;
};

/**
 * Update meal fields (discount, out_of_stock)
 */
export const updateMeal = async (mealId, fields) => {
  const dbFields = {};
  if (fields.name  !== undefined) dbFields.name     = clean(fields.name);
  if (fields.price !== undefined) dbFields.price    = fields.price;
  if (fields.photo !== undefined) dbFields.photo    = fields.photo;
  if (fields.discount    !== undefined) dbFields.discount     = fields.discount;
  if (fields.outOfStock  !== undefined) dbFields.out_of_stock = fields.outOfStock ? 1 : 0;

  const keys = Object.keys(dbFields);
  if (!keys.length) return null;

  const vals = Object.values(dbFields);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  await pool.query(`UPDATE meals SET ${setClause} WHERE id = ?`, [...vals, mealId]);

  const [rows] = await pool.query(
    `SELECT id, section, name, price,
            out_of_stock AS outOfStock,
            discount, daily_special AS dailySpecial
       FROM meals WHERE id = ?`,
    [mealId]
  );
  return rows[0] || null;
};

/**
 * Delete a meal by ID
 */
export const deleteMeal = async mealId => {
  await pool.query('DELETE FROM meals WHERE id = ?', [mealId]);
};

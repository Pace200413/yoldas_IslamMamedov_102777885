import { pool } from '../config/db.js';

const tidy = s => (s ?? '').toString().trim();

/* Read all meals grouped by section (includes discount & stock) */
export const getMealsByRestaurant = async (restaurantId) => {
  const [rows] = await pool.query(
    `SELECT id, section, name, price, photo,
            COALESCE(discount,0)     AS discount,
            COALESCE(out_of_stock,0) AS outOfStock
       FROM meals
      WHERE restaurant_id = ?
      ORDER BY section, id`,
    [restaurantId]
  );

  const grouped = rows.reduce((acc, r) => {
    acc[r.section] ??= [];
    acc[r.section].push({
      id: r.id,
      name: r.name,
      price: r.price,
      photo: r.photo,
      discount: Number(r.discount) || 0,
      outOfStock: Number(r.outOfStock) || 0,
    });
    return acc;
  }, {});

  return Object.entries(grouped).map(([title, items]) => ({ title, items }));
};

/* Specials only */
export const getSpecialsByRestaurant = async (restaurantId) => {
  const [rows] = await pool.query(
    `SELECT id, name, price, photo, COALESCE(discount,0) AS discount
       FROM meals
      WHERE restaurant_id = ? AND COALESCE(discount,0) > 0
      ORDER BY id DESC`,
    [restaurantId]
  );
  return rows;
};

/* Create */
export const createMeal = async (restaurantId, { section, name, price, photo = '', description = '' }) => {
  const [res] = await pool.query(
    `INSERT INTO meals (restaurant_id, section, name, price, photo, description, discount, out_of_stock)
           VALUES (?,?,?,?,?,?,0,0)`,
    [restaurantId, tidy(section), tidy(name), price, tidy(photo), tidy(description)]
  );
  return res.insertId;
};

/* Partial Update (supports discount & out_of_stock) */
export const updateMeal = async (mealId, body = {}) => {
  const ALLOWED = new Map([
    ['name',         v => tidy(v)],
    ['price',        v => Number(v)],
    ['photo',        v => tidy(v)],
    ['section',      v => tidy(v)],
    ['description',  v => tidy(v)],
    ['discount',     v => Math.max(0, Math.min(90, Number(v) || 0))],
    ['out_of_stock', v => (v ? 1 : 0)],
  ]);

  const sets = [];
  const vals = [];
  for (const [k, fn] of ALLOWED) {
    // accept both out_of_stock and outOfStock from client
    const has = k === 'out_of_stock' ? ('out_of_stock' in body || 'outOfStock' in body) : (k in body);
    if (has) {
      const key = k === 'out_of_stock' && 'outOfStock' in body ? 'outOfStock' : k;
      sets.push(`${k} = ?`);
      vals.push(fn(body[key]));
    }
  }
  if (!sets.length) return { changed: 0 };

  vals.push(mealId);
  const [r] = await pool.query(`UPDATE meals SET ${sets.join(', ')} WHERE id = ?`, vals);
  return { changed: r.affectedRows };
};

/* Delete */
export const deleteMeal = async (mealId) => {
  await pool.query('DELETE FROM meals WHERE id = ?', [mealId]);
};

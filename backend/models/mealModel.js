import { pool } from '../config/db.js';

const tidy = s => (s ?? '').toString().trim();

/* ── READ: meals grouped by section (now includes discount/stock) ── */
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

/* ── CREATE (keeps DB defaults for discount/stock) ── */
export const createMeal = async (
  restaurantId,
  { section = 'Main', name, price, photo = '', description = '' }
) => {
  // 1) Find the owner of this restaurant
  const [[rest]] = await pool.query(
    'SELECT owner_id FROM restaurants WHERE id = ?',
    [restaurantId]
  );
  if (!rest) {
    const err = new Error('Restaurant not found');
    err.status = 404;
    throw err;
  }

  // 2) Insert meal with owner_id
  const [res] = await pool.query(
    `INSERT INTO meals (restaurant_id, owner_id, section, name, price, photo, description)
     VALUES (?,?,?,?,?,?,?)`,
    [restaurantId, rest.owner_id, tidy(section), tidy(name), Number(price), tidy(photo), tidy(description)]
  );

  return res.insertId;
};

/* ── UPDATE (partial) ── */
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

  for (const [col, fn] of ALLOWED) {
    const has =
      col === 'out_of_stock'
        ? ('out_of_stock' in body || 'outOfStock' in body)
        : (col in body);

    if (has) {
      const key = col === 'out_of_stock' && 'outOfStock' in body ? 'outOfStock' : col;
      sets.push(`${col} = ?`);
      vals.push(fn(body[key]));
    }
  }

  if (!sets.length) return { changed: 0 };

  vals.push(mealId);
  const [r] = await pool.query(`UPDATE meals SET ${sets.join(', ')} WHERE id = ?`, vals);
  return { changed: r.affectedRows };
};

/* ── DELETE ── */
export const deleteMeal = async (mealId) => {
  await pool.query('DELETE FROM meals WHERE id = ?', [mealId]);
};

/* ── OPTIONAL: specials list (for “Deals” strip) ── */
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

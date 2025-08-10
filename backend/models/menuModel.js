import { pool } from '../config/db.js';

/* ----- helpers ---------------------------------------------------- */
const tidy = s => (s ?? '').trim();

/* ------------------------------------------------------------------ */
/*  All meals for one restaurant, grouped by section                  */
/* ------------------------------------------------------------------ */
export const getMealsByRestaurant = async restaurantId => {
  const [rows] = await pool.query(
    `SELECT id, section, name, price, photo
       FROM meals
      WHERE restaurant_id = ?
      ORDER BY section, id`,
    [restaurantId]
  );

  // Group rows →  [{ title:'Drinks', items:[ … ] }, … ]
  const grouped = rows.reduce((acc, r) => {
    acc[r.section] ??= [];
    acc[r.section].push({ id: r.id, name: r.name, price: r.price, photo: r.photo });
    return acc;
  }, {});

  return Object.entries(grouped).map(([title, items]) => ({ title, items }));
};

/* ------------------------------------------------------------------ */
/*  Insert a new meal                                                 */
/* ------------------------------------------------------------------ */
export const createMeal = async (restaurantId, { section, name, price, photo = '' }) => {
  const [res] = await pool.query(
    `INSERT INTO meals (restaurant_id, section, name, price, photo)
           VALUES (?,?,?,?,?)`,
    [restaurantId, tidy(section), tidy(name), price, tidy(photo)]
  );
  return res.insertId;
};

/* ------------------------------------------------------------------ */
/*  Delete a meal                                                     */
/* ------------------------------------------------------------------ */
export const deleteMeal = async mealId => {
  await pool.query('DELETE FROM meals WHERE id = ?', [mealId]);
};

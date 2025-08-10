import { pool } from '../config/db.js';

/**
 * Return every approved restaurant, with only the fields the customer needs.
 */
export const getAllRestaurantsFromDb = async () => {
  const [rows] = await pool.query(`
    SELECT
      id,
      rName,
      loc,
      cuisine,
      photo,
      rating,
      opens  AS openHours,
      closes AS closeHours,
      daily_special AS dailySpecial
    FROM restaurants
    WHERE approved = 1
    ORDER BY rName
  `);
  return rows;
};

export const getRestaurantsByOwner = async (ownerId) => {
  const [rows] = await pool.query(
    'SELECT * FROM restaurants WHERE owner_id = ?',
    [ownerId]
  );
  return rows;
};

export const createRestaurantInDb = async (
  ownerId, rName, loc, cuisine, photo,
  description, phone, opens, closes
) => {
  const [res] = await pool.query(
    `INSERT INTO restaurants
      (owner_id, rName, loc, cuisine, photo, approved,
       description, phone, opens, closes)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    [ownerId, rName, loc, cuisine, photo, description, phone, opens, closes]
  );

  const [rows] = await pool.query(
    'SELECT * FROM restaurants WHERE id = ?',
    [res.insertId]
  );
  return rows[0];
};

export const approveRestaurantInDb = async (id, approved) => {
  await pool.query(
    'UPDATE restaurants SET approved = ? WHERE id = ?',
    [approved, id]
  );

  const [rows] = await pool.query(
    'SELECT * FROM restaurants WHERE id = ?',
    [id]
  );
  return rows[0];
};

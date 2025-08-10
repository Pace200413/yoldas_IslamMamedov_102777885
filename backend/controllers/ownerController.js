// backend/controllers/ownerController.js
import { pool } from '../config/db.js';

/* ────────────────────────────────
   GET  /api/owners/restaurants        -> all
   GET  /api/owners/:ownerId/…         -> by owner
   ──────────────────────────────── */
export const listOwnerRestaurants = async (req, res) => {
  try {
    const { ownerId } = req.params;        // undefined for “all” route

    const sql    = ownerId
      ? 'SELECT * FROM restaurants WHERE owner_id = ?'
      : 'SELECT * FROM restaurants';
    const params = ownerId ? [ownerId] : [];

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

/* ────────────────────────────────
   POST /api/owners/:ownerId/restaurants
   ──────────────────────────────── */
export const createRestaurant = async (req, res) => {
  const { ownerId } = req.params;
  const {
    rName, loc, cuisine,
    description = '', phone = '',
    opens = '', closes = '',
    photo = ''
  } = req.body;

  if (!rName || !loc || !cuisine) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1) insert
    const [result] = await pool.query(
      `INSERT INTO restaurants
       (owner_id, rName, loc, cuisine, description,
        phone, opens, closes, photo, approved)
       VALUES (?,?,?,?,?,?,?,?,?,0)`,
      [
        ownerId, rName.trim(), loc.trim(), cuisine.trim(),
        description.trim(), phone.trim(),
        opens.trim(), closes.trim(), photo.trim()
      ]
    );

    // 2) return the newly-created row
    const [rows] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create restaurant error:', err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

// models/ownerModel.js
import { pool } from '../config/db.js';  // ← named import, not default

/**
 * Look up an owner by email.
 * @param {string} email
 * @returns {object|null}
 */
export async function findOwnerByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM owners WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

/**
 * Create a new owner with plain‐text password.
 * @param {{ name: string, email: string, password: string }} param0
 * @returns {Promise<object>}
 */
export function createOwner({ name, email, password }) {
  return pool.query(
    'INSERT INTO owners (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, password]
  );
}

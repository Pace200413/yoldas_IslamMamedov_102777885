// backend/models/modifierModel.js
import { pool } from '../config/db.js';

/**
 * Use MEAL_GROUP_TABLE to match your DB (default: meal_group).
 * Examples: meal_group  |  meal_groups
 */
const JOIN_TABLE = (process.env.MEAL_GROUP_TABLE || 'meal_group')
  .replace(/[^a-zA-Z0-9_]/g, ''); // basic hardening

/* ──────────────────────────────────────────────────────────
   READ: groups + options for a single meal
   Returns: [{ id, name, required, min_select, max_select, scope, options:[...] }]
   ────────────────────────────────────────────────────────── */
export async function listGroupsForMeal(mealId) {
  const [gRows] = await pool.query(
    `SELECT g.id, g.name,
            COALESCE(g.required,0)   AS required,
            COALESCE(g.min_select,0) AS min_select,
            COALESCE(g.max_select,0) AS max_select,
            COALESCE(g.scope,'both') AS scope
       FROM \`${JOIN_TABLE}\` mg
       JOIN modifier_groups g ON g.id = mg.group_id
      WHERE mg.meal_id = ?
      ORDER BY g.id`,
    [mealId]
  );

  if (!gRows.length) return [];

  const groupIds = gRows.map(g => g.id);
  const [oRows] = await pool.query(
    `SELECT id, group_id, name,
            COALESCE(price_delta,0) AS price_delta,
            COALESCE(is_default,0)  AS is_default
       FROM modifier_options
      WHERE group_id IN (${groupIds.map(() => '?').join(',')})
      ORDER BY id`,
    groupIds
  );

  const byGroup = new Map();
  for (const o of oRows) {
    if (!byGroup.has(o.group_id)) byGroup.set(o.group_id, []);
    byGroup.get(o.group_id).push({
      id: o.id,
      name: o.name,
      price_delta: Number(o.price_delta) || 0,
      is_default: !!o.is_default,
    });
  }

  return gRows.map(g => ({
    id: g.id,
    name: g.name,
    required: !!g.required,
    min_select: g.min_select || 0,
    max_select: g.max_select || 0, // 0 = ∞
    scope: g.scope || 'both',
    options: byGroup.get(g.id) || [],
  }));
}

/* ──────────────────────────────────────────────────────────
   READ: all groups for a restaurant (no options)
   ────────────────────────────────────────────────────────── */
export async function listGroupsForRestaurant(restaurantId) {
  const [rows] = await pool.query(
    `SELECT id, restaurant_id, name, required, min_select, max_select, scope
       FROM modifier_groups
      WHERE restaurant_id = ?
      ORDER BY id DESC`,
    [restaurantId]
  );
  return rows;
}

/* ──────────────────────────────────────────────────────────
   WRITE: attach / detach a group to a meal
   ────────────────────────────────────────────────────────── */
export async function attachGroupToMeal(mealId, groupId) {
  await pool.query(
    `INSERT IGNORE INTO \`${JOIN_TABLE}\` (meal_id, group_id) VALUES (?, ?)`,
    [mealId, groupId]
  );
}

export async function detachGroupFromMeal(mealId, groupId) {
  await pool.query(
    `DELETE FROM \`${JOIN_TABLE}\` WHERE meal_id = ? AND group_id = ?`,
    [mealId, groupId]
  );
}

/* ──────────────────────────────────────────────────────────
   WRITE: groups CRUD
   ────────────────────────────────────────────────────────── */
export async function createGroup(restaurantId, { name, required = 0, min_select = 0, max_select = 0, scope = 'both' }) {
  if (!String(name || '').trim()) throw new Error('name required');
  const [r] = await pool.query(
    `INSERT INTO modifier_groups (restaurant_id, name, required, min_select, max_select, scope)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [restaurantId, String(name).trim(), required ? 1 : 0, Number(min_select) || 0, Number(max_select) || 0, scope]
  );
  return r.insertId;
}

export async function updateGroup(groupId, payload = {}) {
  const sets = [];
  const vals = [];

  if (payload.name !== undefined) { sets.push('name = ?'); vals.push(String(payload.name).trim()); }
  if (payload.required !== undefined) { sets.push('required = ?'); vals.push(payload.required ? 1 : 0); }
  if (payload.min_select !== undefined) { sets.push('min_select = ?'); vals.push(Number(payload.min_select) || 0); }
  if (payload.max_select !== undefined) { sets.push('max_select = ?'); vals.push(Number(payload.max_select) || 0); }
  if (payload.scope !== undefined) { sets.push('scope = ?'); vals.push(String(payload.scope)); }

  if (!sets.length) return { ok: false };
  await pool.query(`UPDATE modifier_groups SET ${sets.join(', ')} WHERE id = ?`, [...vals, groupId]);
  return { ok: true };
}

export async function deleteGroup(groupId) {
  // In case FKs aren’t set to cascade, clean manually:
  await pool.query(`DELETE FROM modifier_options WHERE group_id = ?`, [groupId]);
  await pool.query(`DELETE FROM \`${JOIN_TABLE}\` WHERE group_id = ?`, [groupId]);
  await pool.query(`DELETE FROM modifier_groups WHERE id = ?`, [groupId]);
  return { ok: true };
}

/* ──────────────────────────────────────────────────────────
   WRITE: options CRUD
   ────────────────────────────────────────────────────────── */
export async function createOption(groupId, { name, price_delta = 0, is_default = 0 }) {
  if (!String(name || '').trim()) throw new Error('name required');
  const [r] = await pool.query(
    `INSERT INTO modifier_options (group_id, name, price_delta, is_default)
     VALUES (?, ?, ?, ?)`,
    [groupId, String(name).trim(), Number(price_delta) || 0, is_default ? 1 : 0]
  );
  return r.insertId;
}

export async function updateOption(optionId, payload = {}) {
  const sets = [];
  const vals = [];

  if (payload.name !== undefined) { sets.push('name = ?'); vals.push(String(payload.name).trim()); }
  if (payload.price_delta !== undefined) { sets.push('price_delta = ?'); vals.push(Number(payload.price_delta) || 0); }
  if (payload.is_default !== undefined) { sets.push('is_default = ?'); vals.push(payload.is_default ? 1 : 0); }

  if (!sets.length) return { ok: false };
  await pool.query(`UPDATE modifier_options SET ${sets.join(', ')} WHERE id = ?`, [...vals, optionId]);
  return { ok: true };
}

export async function deleteOption(optionId) {
  await pool.query(`DELETE FROM modifier_options WHERE id = ?`, [optionId]);
  return { ok: true };
}

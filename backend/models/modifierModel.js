import { pool } from '../config/db.js';

export const createGroup = async (restaurantId, { name, min_select=0, max_select=0, required=0 }) => {
  const [r] = await pool.query(
    `INSERT INTO modifier_groups (restaurant_id, name, min_select, max_select, required)
     VALUES (?,?,?,?,?)`,
    [restaurantId, name.trim(), min_select, max_select, required ? 1 : 0]
  );
  return r.insertId;
};

export const listGroupsForMeal = async (mealId) => {
  const [groups] = await pool.query(
    `SELECT g.* FROM meal_modifier_groups mg
      JOIN modifier_groups g ON g.id = mg.group_id
     WHERE mg.meal_id = ?`,
    [mealId]
  );
  const result = [];
  for (const g of groups) {
    const [opts] = await pool.query(
      `SELECT id, name, price_delta, is_default
         FROM modifiers
        WHERE group_id = ? AND in_stock = 1`,
      [g.id]
    );
    result.push({ ...g, options: opts });
  }
  return result;
};

export const attachGroupToMeal = async (mealId, groupId) => {
  await pool.query(
    `INSERT IGNORE INTO meal_modifier_groups (meal_id, group_id) VALUES (?,?)`,
    [mealId, groupId]
  );
};

export const createOption = async (groupId, { name, price_delta=0, is_default=0 }) => {
  const [r] = await pool.query(
    `INSERT INTO modifiers (group_id, name, price_delta, is_default)
     VALUES (?,?,?,?)`,
    [groupId, name.trim(), price_delta, is_default ? 1 : 0]
  );
  return r.insertId;
};

export const deleteOption = async (optionId) => {
  await pool.query(`DELETE FROM modifiers WHERE id=?`, [optionId]);
};

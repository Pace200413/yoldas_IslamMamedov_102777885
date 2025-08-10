// backend/models/orderModel.js
import { pool } from '../config/db.js';

/* ──────────────────────────────────────────────────────────
   1. Create a new order  +  line-items   (transactional)
   ────────────────────────────────────────────────────────── */
export const createOrder = async ({
  restaurant_id,
  customer_name,
  customer_address,
  total_amount,
  items,                         // [{ id, qty, price, customizations? }]
  status = 'pending',
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query(
      `INSERT INTO orders
         (restaurant_id, customer_name, customer_address,
          total_amount, items_count, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [restaurant_id, customer_name, customer_address, total_amount, items.length, status]
    );
    const orderId = res.insertId;

    // Prepare row tuples
    const rows = items.map(i => [
      orderId,
      i.id,                                        // meal_id
      i.qty ?? 1,
      Number(i.price),                             // final unit price incl. add-ons
      i.customizations ? JSON.stringify(i.customizations) : null,
    ]);

    await conn.query(
      'INSERT INTO order_items (order_id, meal_id, qty, price, customizations) VALUES ?',
      [rows]
    );

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ───────────────────────────────────────────
   2. All orders for a specific restaurant
   ─────────────────────────────────────────── */
export const ordersByRestaurant = async (restaurantId) => {
  const [rows] = await pool.query(
    `SELECT  id,
            status,
            total_amount   AS total,
            items_count    AS itemsCount,
            created_at
     FROM    orders
     WHERE   restaurant_id = ?
     ORDER BY created_at DESC`,
    [restaurantId],
  );
  return rows;
};

/* ───────────────────────────────────────────
   3. Update an order’s status
   ─────────────────────────────────────────── */
export const updateOrderStatus = async (orderId, status) => {
  const [r] = await pool.query(
    `UPDATE orders
       SET status = ?
     WHERE id = ?`,
    [status, orderId],
  );
  return r;
};

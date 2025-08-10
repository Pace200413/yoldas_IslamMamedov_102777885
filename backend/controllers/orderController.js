// backend/controllers/orderController.js
import {
  createOrder,
  ordersByRestaurant,
  updateOrderStatus,
} from '../models/orderModel.js';

/* ───────────────── CLIENT-SIDE (customer app) ───────────── */

export const placeOrder = async (req, res) => {
  // use let instead of const so we can reassign below
  let {
    restaurantId,
    items,
    customerName,
    customerAddress,
    totalAmount,
    total,
  } = req.body;

  // fall back to total if totalAmount was undefined
  totalAmount = totalAmount ?? total;

  // now your validation can include totalAmount
  if (!restaurantId || !items?.length || !customerName ||
      !customerAddress || totalAmount == null
  ) {
    return res.status(400).json({ error: 'Missing order data' });
  }

  try {
    const orderId = await createOrder({
      restaurant_id    : restaurantId,
      customer_name    : customerName,
      customer_address : customerAddress,
      total_amount     : totalAmount,
      items,
    });
    res.status(201).json({ orderId });
  } catch (err) {
    console.error('placeOrder error:', err);
    res.status(500).json({ error: 'Could not place order' });
  }
};

/* ───────────────── OWNER-SIDE – list via query (?restaurantId=) ─────────── */

export const listOrders = async (req, res) => {
  const { restaurantId } = req.query;
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId missing' });
  }
  try {
    const rows = await ordersByRestaurant(restaurantId);
    res.json(rows);
  } catch (err) {
    console.error('listOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

/* ───────────────── OWNER-SIDE – list via clean REST path /restaurant/:id ── */

export const listOrdersForRestaurant = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const rows = await ordersByRestaurant(restaurantId);
    res.json(rows);
  } catch (err) {
    console.error('listOrdersForRestaurant error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

/* ───────────────── OWNER-SIDE – update status ───────────── */

export const changeStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status }   = req.query;
  if (!status) {
    return res.status(400).json({ error: 'Missing status query parameter' });
  }
  try {
    await updateOrderStatus(orderId, status);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('changeStatus error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

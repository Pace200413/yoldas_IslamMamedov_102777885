// backend/routes/orderRoutes.js
import express from 'express';
import {
  placeOrder,
  listOrders,                // legacy (?restaurantId=...)
  listOrdersForRestaurant,   // clean path /restaurant/:id
  changeStatus,
} from '../controllers/orderController.js';

const router = express.Router();

/* ─── Customer-facing ───────────────────────── */
router.post('/', placeOrder);                         // POST /api/orders

/* ─── Owner-facing (two flavours) ─────────────── */
router.get('/', listOrders);                          // GET /api/orders?restaurantId=3
router.get('/restaurant/:restaurantId',
           listOrdersForRestaurant);                  // GET /api/orders/restaurant/3

router.patch('/:orderId', changeStatus);              // PATCH /api/orders/17?status=ready

export default router;

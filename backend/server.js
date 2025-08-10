// backend/app.js
import express from 'express';
import cors   from 'cors';
import morgan from 'morgan';

import authRoutes       from './routes/authRoutes.js';
import ownerRoutes      from './routes/ownerRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes       from './routes/menuRoutes.js';
import emailRoutes      from './routes/emailRoutes.js';
import orderRoutes      from './routes/orderRoutes.js';
import modifierRoutes from './routes/modifierRoutes.js';
const app = express();
app.use(cors());
app.use('/api/modifiers', modifierRoutes);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/auth',          authRoutes);
app.use('/api/owners',    ownerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu',      menuRoutes);
app.use('/api/email',     emailRoutes);
app.use('/api/orders',    orderRoutes);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

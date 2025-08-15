import {
  getAllRestaurantsFromDb,
  getRestaurantsByOwner,
  createRestaurantInDb,
  approveRestaurantInDb,
  getPendingRestaurantsFromDb,
  getOwnerContactForRestaurant,
} from '../models/restaurantModel.js';
import { notifyRestaurantApproved } from './emailController.js';
/* GET /api/restaurants */
export const listAllRestaurants = async (_req, res) => {
  try {
    const list = await getAllRestaurantsFromDb();
    res.json(list);
  } catch (err) {
    console.error('Restaurant fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

/* GET /api/restaurants/owner/:ownerId */
export const listRestaurantsForOwner = async (req, res) => {
  try {
    const rows = await getRestaurantsByOwner(req.params.ownerId);
    res.json(rows);
  } catch (err) {
    console.error('Owner-restaurants fetch error:', err);
    res.status(500).json({ error: 'Cannot fetch restaurants for owner' });
  }
};

/* POST /api/restaurants/owner/:ownerId */
export const createRestaurant = async (req, res) => {
  try {
    const {
      rName, loc, cuisine, photo,
      description, phone, opens, closes
    } = req.body;

    const row = await createRestaurantInDb(
      req.params.ownerId,
      rName, loc, cuisine, photo,
      description, phone, opens, closes
    );
    res.status(201).json(row);
  } catch (err) {
    console.error('Create-restaurant error:', err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

/* PATCH /api/restaurants/:id/approve */
export const approveRestaurant = async (req, res) => {
  try {
    const row = await approveRestaurantInDb(req.params.id, req.body.approved);

    // only notify when flipping to approved (truthy)
    if (+req.body.approved === 1) {
      const info = await getOwnerContactForRestaurant(req.params.id);
      if (info?.ownerEmail) {
        try {
          await notifyRestaurantApproved({
            to: info.ownerEmail,
            ownerName: info.ownerName,
            restaurantName: info.restaurantName,
          });
        } catch (e) {
          console.warn('Email notify failed (continuing):', e.message);
        }
      }
    }
    res.json(row);
  } catch (err) {
    console.error('Approve-restaurant error:', err);
    res.status(500).json({ error: 'Failed to approve restaurant' });
  }
};

export const updateRestaurantPhoto = async (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;

  if (!photo) {
    return res.status(400).json({ error: 'Photo URL is required' });
  }

  try {
    await pool.query('UPDATE restaurants SET photo = ? WHERE id = ?', [photo, id]);
    res.json({ success: true, photo });
  } catch (err) {
    console.error('Photo update failed:', err);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};

export const listPendingRestaurants = async (_req, res) => {
  try {
    const rows = await getPendingRestaurantsFromDb();
    res.json(rows);
  } catch (err) {
    console.error('Pending restaurants error:', err);
    res.status(500).json({ error: 'Failed to fetch pending restaurants' });
  }
};

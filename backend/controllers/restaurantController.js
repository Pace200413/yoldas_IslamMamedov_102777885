import {
  getAllRestaurantsFromDb,
  getRestaurantsByOwner,
  createRestaurantInDb,
  approveRestaurantInDb
} from '../models/restaurantModel.js';

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
    const row = await approveRestaurantInDb(
      req.params.id,
      req.body.approved
    );
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
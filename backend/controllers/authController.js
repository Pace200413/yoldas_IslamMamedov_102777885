import { findOwnerByEmail, createOwner } from '../models/ownerModel.js';

export const signup = async (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email & password required' });

  try {
    if (await findOwnerByEmail(email))
      return res.status(409).json({ error: 'Email already in use' });

    const [result] = await createOwner({ name, email, password });
    res.status(201).json({ ownerId: result.insertId, restaurantName: name });
  } catch (err) {
    console.error('[authController.signup] error:', err);   // ← keep this!
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email = '', password = '' } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const owner = await findOwnerByEmail(email);
    if (!owner || owner.password_hash !== password)
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ ownerId: owner.id, restaurantName: owner.name });
  } catch (err) {
    console.error('[authController.login] error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
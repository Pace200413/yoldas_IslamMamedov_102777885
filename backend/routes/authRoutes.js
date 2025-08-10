import express from 'express';
import { login, signup } from '../controllers/authController.js';

const router = express.Router();
router.post('/signin',  login);
router.post('/signup',  signup);         // <-- this path must match phone
export default router;
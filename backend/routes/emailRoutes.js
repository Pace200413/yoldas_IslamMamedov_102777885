import express from 'express';
import { sendEmail } from '../controllers/emailController.js';

const r = express.Router();

r.post('/restaurants/:id/email', sendEmail); // backend route for sending email

export default r;

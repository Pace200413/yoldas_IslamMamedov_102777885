// backend/controllers/emailController.js
import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = 'no-reply@yoldas.local',
} = process.env;

// Create transporter if creds exist; otherwise we simulate.
let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false otherwise
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Route handler used by /api/email/send
 * Body: { to, subject, text?, html? }
 */
export const sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body || {};
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'to, subject, and text or html are required' });
  }

  try {
    if (!transporter) {
      console.log('[EMAIL:simulate]', { to, subject, text: text ?? '(html provided)' });
      return res.json({ simulated: true });
    }

    await transporter.sendMail({ from: MAIL_FROM, to, subject, text, html });
    res.json({ sent: true });
  } catch (err) {
    console.error('sendEmail failed:', err);
    res.status(500).json({ error: 'Email failed to send' });
  }
};

/**
 * Helper (used by restaurant approval flow)
 */
export const notifyRestaurantApproved = async ({ to, ownerName, restaurantName }) => {
  const subject = `You're approved on Ýoldaş 🎉`;
  const text =
`Hi ${ownerName || 'there'},

Good news! Your restaurant "${restaurantName}" has been approved.
You can now sign in and start adding menu items and specials.

— Ýoldaş Team`;

  if (!transporter) {
    console.log('[EMAIL:simulate:approved]', { to, subject, text });
    return { simulated: true };
  }
  await transporter.sendMail({ from: MAIL_FROM, to, subject, text });
  return { sent: true };
};

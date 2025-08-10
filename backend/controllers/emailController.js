// controllers/emailController.js
import nodemailer from 'nodemailer';

/**
 * Send an email to a single recipient or list of recipients.
 * Expects: { to, subject, message } in the request body
 */
export async function sendEmail(req, res) {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Setup transporter (use your SMTP credentials here)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your.email@gmail.com',         // replace with your email
        pass: 'your-app-password-or-pass',    // use app password if using Gmail
      },
    });

    // Prepare email options
    const mailOptions = {
      from: '"Yoldaş" <your.email@gmail.com>', // sender name and address
      to,                                      // string or array of emails
      subject,
      text: message,
      html: `<p>${message}</p>`,               // optional: HTML version
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

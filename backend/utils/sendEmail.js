const transporter = require('../config/mailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message);
    return false;
  }
};

module.exports = sendEmail;
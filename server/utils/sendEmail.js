import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a real SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME || 'Auth System'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send the email
  const info = await transporter.sendMail(message);
  console.log('Real Email sent successfully: %s', info.messageId);
};

export default sendEmail;

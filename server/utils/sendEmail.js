import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a real SMTP transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
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

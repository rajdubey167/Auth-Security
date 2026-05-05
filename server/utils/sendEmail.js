import { Resend } from 'resend';

const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: `${process.env.FROM_NAME || 'AuthSystem'} <onboarding@resend.dev>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });

  console.log('Email sent via Resend to:', options.email);
};

export default sendEmail;


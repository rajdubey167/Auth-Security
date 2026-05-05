const sendEmail = async (options) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const payload = {
    sender: {
      name: process.env.FROM_NAME || 'AuthSystem',
      email: process.env.FROM_EMAIL || process.env.SMTP_EMAIL
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Brevo API Error:', errorData);
    throw new Error('Email failed to send via Brevo');
  }

  console.log('Email sent successfully via Brevo to:', options.email);
};

export default sendEmail;


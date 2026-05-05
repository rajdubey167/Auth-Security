const sendEmail = async (options) => {
  const url = 'https://api.mailjet.com/v3.1/send';
  
  const payload = {
    Messages: [
      {
        From: {
          Email: process.env.FROM_EMAIL || process.env.SMTP_EMAIL,
          Name: process.env.FROM_NAME || 'AuthSystem'
        },
        To: [
          {
            Email: options.email
          }
        ],
        Subject: options.subject,
        HTMLPart: options.html,
        TextPart: options.message
      }
    ]
  };

  const auth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Mailjet API Error:', JSON.stringify(errorData, null, 2));
    throw new Error('Email failed to send via Mailjet');
  }

  console.log('Email sent successfully via Mailjet to:', options.email);
};

export default sendEmail;


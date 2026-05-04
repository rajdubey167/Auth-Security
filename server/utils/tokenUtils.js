import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '15m', // Short expiry as requested (15 mins)
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS attacks by not allowing JS to access the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

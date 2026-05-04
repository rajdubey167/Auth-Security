import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgotpassword`, { email });
      setMessage(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f4f6', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '24px', padding: '48px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' }}>
          
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 32px' }}>
            Enter your email to receive a reset link.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}
            
            {message && (
              <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#059669', fontSize: '13px', fontWeight: 500 }}>
                {message}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                placeholder="you@example.com"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#111827', color: '#fff', fontSize: '14px', fontWeight: 500, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Remember your password? <a href="/login" style={{ color: '#111827', fontWeight: 600, textDecoration: 'none' }}>Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmailAndLogin } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await axios.get(`${API_URL}/auth/verifyemail/${token}`, { withCredentials: true });
        
        // Tell AuthContext to re-fetch the user session (now verified + logged in)
        await verifyEmailAndLogin();
        
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        body { margin: 0; background-color: #f3f4f6; }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          
          {status === 'loading' && (
            <>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Verifying your email...</h1>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Email Verified!</h1>
              <p style={{ color: '#059669', fontSize: '14px', margin: '0 0 20px', fontWeight: 500 }}>{message}</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Redirecting you to the dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Verification Failed</h1>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 24px', fontWeight: 500 }}>{message}</p>
              <a href="/login" style={{ display: 'inline-block', padding: '10px 24px', background: '#111827', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                Return to Login
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}

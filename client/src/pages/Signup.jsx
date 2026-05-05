import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          withCredentials: false,
        });
        const { email, name, sub: googleId } = userInfo.data;
        await googleLogin({ email, name, googleId });
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google signup failed.');
        setLoading(false);
      }
    },
    onError: () => setError('Google Signup Failed'),
  });

  const passwordRules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
    { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const passwordStrength = passwordRules.filter(r => r.test(password)).length;

  const validatePassword = (p) => passwordRules.every(r => r.test(p));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Full name is required.');
    if (!validatePassword(password)) return setError('Password does not meet all the requirements below.');
    setLoading(true);
    try {
      setError('');
      setSuccess('');
      await signup(name, email, password);
      setSuccess('Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
        body { margin: 0; background-color: #e5e7eb; overflow-x: hidden; overflow-y: auto; }
        * { box-sizing: border-box; }
        .input-field:focus { border-color: #a1a1aa !important; outline: none; box-shadow: 0 0 0 3px rgba(228, 228, 231, 0.5); }
        .btn-hover:hover { background-color: #27272a !important; }
        .google-btn:hover { background-color: #f4f4f5 !important; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        padding: '40px 16px',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{
            width: '28px', height: '28px', background: '#18181b', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px'
          }}>
            <svg viewBox="0 0 24 24" fill="#fff" width="100%" height="100%">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.5px', color: '#18181b' }}>AuthSystem</span>
        </div>

        {/* Main Card */}
        <div style={{
          width: '100%', maxWidth: '420px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '32px 40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
          border: '1px solid #d4d4d8',
        }}>
          {/* Headings */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', color: '#18181b', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Create <span style={{ fontStyle: 'italic', color: '#52525b', fontWeight: 600 }}>account</span>
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#71717a', fontWeight: 400 }}>
              Sign up to start using your workspace
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex', background: '#f4f4f5', borderRadius: '10px', padding: '3px', marginBottom: '20px'
          }}>
            <Link to="/login" style={{
              flex: 1, textAlign: 'center', padding: '8px',
              borderRadius: '8px', color: '#a1a1aa', textDecoration: 'none',
              fontSize: '13px', fontWeight: 500,
            }}>Sign in</Link>
            <div style={{
              flex: 1, textAlign: 'center', padding: '8px',
              borderRadius: '8px', background: '#ffffff', color: '#18181b',
              fontSize: '13px', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}>Create account</div>
          </div>

          {/* Google Button */}
          <button className="google-btn" type="button" onClick={() => handleGoogleLogin()} disabled={loading} style={{
            width: '100%', padding: '12px', background: '#ffffff',
            border: '1px solid #d1d5db', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '14px', fontWeight: 500, color: '#18181b', cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '24px', transition: 'background-color 0.2s', opacity: loading ? 0.8 : 1
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontSize: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', color: '#059669', fontSize: '14px', fontWeight: 500, textAlign: 'center', lineHeight: 1.5, marginBottom: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✉️</div>
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3f3f46', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    background: '#fafafa', fontSize: '13px', color: '#18181b',
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                  }}
                />
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3f3f46', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    background: '#fafafa', fontSize: '13px', color: '#18181b',
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3f3f46', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px 36px 10px 12px',
                      border: '1px solid #d1d5db', borderRadius: '8px',
                      background: '#fafafa', fontSize: '13px', color: '#18181b',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {showPass
                      ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Password Strength Bar + Rules */}
              {password.length > 0 && (
                <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
                  {/* Strength bar */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: passwordStrength >= level
                          ? passwordStrength <= 2 ? '#ef4444'
                            : passwordStrength <= 3 ? '#f59e0b'
                            : passwordStrength <= 4 ? '#3b82f6'
                            : '#22c55e'
                          : '#e4e4e7',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  {/* Rules checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: passed ? '#22c55e' : '#a1a1aa', fontWeight: 600 }}>
                            {passed ? '✓' : '○'}
                          </span>
                          <span style={{ fontSize: '11px', color: passed ? '#374151' : '#a1a1aa' }}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit */}
              <motion.button 
                type="submit" 
                disabled={loading} 
                whileHover={{ backgroundColor: '#27272a', scale: 1.01 }}
                whileTap={{ scale: 0.95 }}
                style={{
                width: '100%', padding: '11px',
                background: '#18181b', color: '#ffffff',
                border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.9 : 1,
                fontFamily: "'Inter', sans-serif", transition: 'background-color 0.2s',
              }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
                    </svg>
                    Creating account...
                  </div>
                ) : 'Create account'}
              </motion.button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#71717a' }}>
          Already have an account? <Link to="/login" style={{ color: '#18181b', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #d4d4d8', paddingBottom: '1px' }}>Sign in</Link>
        </div>
      </div>
    </>
  );
}

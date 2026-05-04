import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

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
    if (!validatePassword(password)) {
      return setError('Password does not meet all the requirements below.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/resetpassword/${token}`,
        { password }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => open
    ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        body { margin: 0; background-color: #f3f4f6; }
        * { box-sizing: border-box; }
        .input-field:focus { border-color: #a1a1aa !important; outline: none; box-shadow: 0 0 0 3px rgba(228,228,231,0.5); }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '28px', background: '#18181b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.5px', color: '#18181b' }}>AuthSystem</span>
          </div>

          <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '36px 40px', boxShadow: '0 10px 40px rgba(0,0,0,0.10)', border: '1px solid #d4d4d8' }}>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ margin: '0 0 4px', fontSize: '22px', color: '#18181b', fontWeight: 600 }}>Set new password</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#71717a' }}>Must meet all requirements below</p>
            </div>

            {message && (
              <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#059669', fontSize: '13px', fontWeight: 500, marginBottom: '20px', textAlign: 'center' }}>
                ✅ {message} — Redirecting to login...
              </div>
            )}

            {error && (
              <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3f3f46', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 36px 10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fafafa', fontSize: '13px', color: '#18181b', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0, display: 'flex' }}>
                      <EyeIcon open={showPass} />
                    </button>
                  </div>

                  {/* Strength bar + checklist */}
                  {password.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {passwordRules.map((rule) => {
                          const passed = rule.test(password);
                          return (
                            <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '10px', color: passed ? '#22c55e' : '#a1a1aa', fontWeight: 600 }}>{passed ? '✓' : '○'}</span>
                              <span style={{ fontSize: '11px', color: passed ? '#374151' : '#a1a1aa' }}>{rule.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#3f3f46', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 36px 10px 12px', border: `1px solid ${confirmPassword && password !== confirmPassword ? '#fca5a5' : '#e4e4e7'}`, borderRadius: '8px', background: '#fafafa', fontSize: '13px', color: '#18181b', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0, display: 'flex' }}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && validatePassword(password) && (
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#22c55e' }}>✓ Passwords match</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !validatePassword(password) || password !== confirmPassword}
                  whileHover={{ backgroundColor: '#27272a' }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%', padding: '11px', background: '#18181b', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                    cursor: (loading || !validatePassword(password) || password !== confirmPassword) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !validatePassword(password) || password !== confirmPassword) ? 0.6 : 1,
                    fontFamily: "'Inter', sans-serif", marginTop: '4px',
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.button>

              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <a href="/login" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>← Back to login</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

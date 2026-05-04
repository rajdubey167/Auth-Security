import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [publicMsg, setPublicMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const callPublic = async () => {
    setLoadingPublic(true);
    setPublicMsg('');
    try {
      const res = await axios.get(`${API_URL}/public`);
      setPublicMsg(res.data.message);
    } catch {
      setPublicMsg('Error reaching public endpoint');
    } finally {
      setLoadingPublic(false);
    }
  };

  const callProfile = async () => {
    setLoadingProfile(true);
    setProfileMsg('');
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, { withCredentials: true });
      setProfileMsg(`${res.data.name} · ${res.data.role}`);
    } catch {
      setProfileMsg('Not authorized or session expired');
    } finally {
      setLoadingProfile(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const emailDisplay = user?.email?.length > 22
    ? user.email.slice(0, 22) + '...'
    : user?.email;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e8eaed',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: '52px',
        position: 'sticky', top: 0, zIndex: 50,
        gap: '24px',
      }}>
        {/* Brand */}
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', marginRight: '8px' }}>
          AuthSystem
        </span>

        {/* Search - REMOVED */}

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '4px', flex: 1, marginLeft: '8px' }}>
          {[
            { label: 'Dashboard', active: true },
          ].map(({ label, active }) => (
            <button key={label} style={{
              padding: '6px 14px', borderRadius: '6px', border: 'none',
              background: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: active ? 600 : 400,
              color: active ? '#111827' : '#6b7280',
              borderBottom: active ? '2px solid #111827' : '2px solid transparent',
              borderRadius: 0,
            }}>{label}</button>
          ))}
        </nav>

        {/* Avatar dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', userSelect: 'none',
            }}
          >{initials}</div>

          {dropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
              <div style={{
                position: 'absolute', top: '42px', right: 0, zIndex: 100,
                background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '220px', overflow: 'hidden',
              }}>
                {/* User info */}
                <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                    </div>
                  </div>
                </div>
                {/* Role badge */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Role:</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', background: user?.role === 'admin' ? '#f0fdf4' : '#f8fafc', border: `1px solid ${user?.role === 'admin' ? '#bbf7d0' : '#e5e7eb'}`, color: user?.role === 'admin' ? '#16a34a' : '#6b7280', textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
                {/* Logout button */}
                <button
                  onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }}
                  style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#dc2626', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Logout Confirm Modal ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '360px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#111827' }}>Sign out?</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>You will be logged out of your account. You can log back in at any time.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151', fontFamily: "'Inter', sans-serif" }}
              >Cancel</button>
              <button
                onClick={handleLogout}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#fff', fontFamily: "'Inter', sans-serif" }}
              >Yes, sign out</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Verification Banner ── */}
      {user && !user.isVerified && (
        <div style={{
          background: '#fffbeb', borderBottom: '1px solid #fde68a',
          padding: '10px 32px', textAlign: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
            ⚠️ Your email is not verified. Please check your inbox and click the verification link to unlock full access.
          </span>
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '48px 32px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          {/* Welcome */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ margin: '0 0 6px', fontSize: '30px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
              Here is your security overview and quick actions for today.
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {/* Email */}
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#9ca3af', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Primary Email</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>{emailDisplay}</div>
              </div>
            </div>

            {/* Role */}
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#9ca3af', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Account Role</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#9ca3af', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Verification Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: user?.isVerified ? '#22c55e' : '#f59e0b' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin panel */}
          {user?.role === 'admin' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 22px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '18px' }}>👑</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Admin Access Enabled</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#4ade80' }}>You have elevated permissions. User management is available via the API.</p>
              </div>
            </motion.div>
          )}

          {/* ── Action Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

            {/* Public Card */}
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
              {/* Card preview area */}
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid #d1d5db', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '130px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '100px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} /> PUBLIC
                  </span>
                </div>
                {/* Mini graphic */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
                    {['#4285F4','#34A853','#FBBC05','#EA4335'].map((c, i) => (
                      <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Trusted by teams worldwide</div>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                    {['99.9%', '10k+', '50k'].map((val, i) => (
                      <div key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>{val}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: '22px 24px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>System Status</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                  Review real-time operational metrics and health indicators for all public-facing authentication services.
                </p>
                {publicMsg && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '12px', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#16a34a', fontFamily: 'monospace' }}>
                    ✓ {publicMsg}
                  </motion.div>
                )}
                <motion.button
                  id="test-public-api"
                  onClick={callPublic}
                  disabled={loadingPublic}
                  whileHover={{ background: '#374151' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '11px', border: 'none',
                    borderRadius: '8px', background: '#111827', cursor: loadingPublic ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 500, color: '#fff', fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: loadingPublic ? 0.7 : 1,
                  }}
                >
                  {loadingPublic ? 'Checking...' : (
                    <>
                      Check System Status
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Private Card */}
            <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
              {/* Card preview area */}
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid #d1d5db', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '130px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', background: '#111827', borderRadius: '100px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🔒 PRIVATE
                  </span>
                </div>
                {/* Mini dashboard preview */}
                <div style={{ background: '#fff', border: '1px solid #e8eaed', borderRadius: '8px', padding: '10px 14px', minWidth: '200px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    {[
                      { label: emailDisplay, sub: '#6b7280' },
                      { label: 'Standard User', sub: '#6b7280' },
                      { label: 'Verified', sub: '#22c55e' },
                    ].map(({ label, sub }, i) => (
                      <div key={i} style={{ fontSize: '9px', color: sub, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                      </div>
                    ))}
                  </div>
                  <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '8px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {['System Status', 'My Secure Data'].map((t, i) => (
                      <div key={i} style={{ background: '#f8f9fb', borderRadius: '4px', padding: '4px 6px', fontSize: '8px', fontWeight: 500, color: '#374151' }}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: '22px 24px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>My Secure Data</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                  Manage your encrypted personal information, access logs, and active session tokens securely.
                </p>
                {profileMsg && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '12px', padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', fontSize: '12px', color: '#c2410c', fontFamily: 'monospace' }}>
                    ✓ Data accessed for: {profileMsg}
                  </motion.div>
                )}
                <motion.button
                  id="test-profile-api"
                  onClick={callProfile}
                  disabled={loadingProfile}
                  whileHover={{ background: '#374151' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '11px', border: 'none',
                    borderRadius: '8px', background: '#111827', cursor: loadingProfile ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 500, color: '#fff', fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: loadingProfile ? 0.7 : 1,
                  }}
                >
                  {loadingProfile ? 'Syncing...' : (
                    <>
                      Sync Private Data
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '12px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              Your session is stored in an <strong style={{ color: '#374151', fontWeight: 500 }}>HTTP-only cookie</strong> — inaccessible to JavaScript, protecting you from XSS attacks.
              Token expires in <strong style={{ color: '#374151', fontWeight: 500 }}>15 minutes</strong>. The <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>SameSite=Strict</code> flag prevents CSRF attacks.
            </p>
          </div>

        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: '#fff', borderTop: '1px solid #d1d5db',
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>© 2024 AuthSystem Security. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Security Audit', 'Status'].map((link) => (
            <span key={link} style={{ fontSize: '12px', color: '#9ca3af', cursor: 'default' }}>{link}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

# 🔐 AuthSystem — Full-Stack Secure Authentication

A production-grade authentication system built with **React**, **Node.js/Express**, and **MongoDB Atlas**, featuring industry-standard security practices including HTTP-only JWT cookies, Google OAuth, email verification, role-based access control, and strong password enforcement.

---

## 📸 Project Overview

| Page | Description |
|---|---|
| `/login` | Secure login with email/password or Google OAuth |
| `/signup` | Registration with real-time password strength meter |
| `/forgot-password` | Request a password reset email |
| `/reset-password/:token` | Reset password via a secure time-limited token |
| `/verify-email/:token` | One-click email verification link |
| `/dashboard` | Protected user dashboard with session info & role display |

---

## 🚀 Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router v6** — client-side routing & protected routes
- **Axios** — HTTP client with global `withCredentials` for cookies
- **@react-oauth/google** — Google OAuth 2.0 flow
- **Framer Motion** — micro-animations & transitions
- **Google Fonts (Inter)** — clean, modern typography

### Backend
- **Node.js + Express 5** — REST API
- **MongoDB Atlas + Mongoose** — cloud database & schema modeling
- **bcryptjs** — password hashing (salted, never plain-text)
- **jsonwebtoken (JWT)** — session tokens
- **cookie-parser** — reading HTTP-only cookies
- **nodemailer** — transactional email (SMTP/Gmail)
- **express-rate-limit** — brute-force protection
- **helmet** — security HTTP headers

---

## 🔒 Security Architecture

### 1. HTTP-Only JWT Cookies (XSS Protection)
Tokens are stored in `httpOnly` cookies — JavaScript cannot read them, making the session immune to Cross-Site Scripting (XSS) attacks.

```
Traditional (Insecure)         This System (Secure)
localStorage.setItem(token)    res.cookie('jwt', token, { httpOnly: true, sameSite: 'strict' })
// ❌ Readable by any JS       // ✅ Invisible to JavaScript
```

### 2. bcrypt Password Hashing
Passwords are **never stored in plain text**. A Mongoose `pre('save')` hook automatically hashes every password before it touches the database.

```js
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12); // 12 salt rounds
});
```

### 3. Strong Password Enforcement (Frontend + Backend)
Both layers enforce the same rules — the backend check cannot be bypassed via tools like Postman:

- ✅ Minimum **8 characters**
- ✅ At least one **uppercase** letter (A-Z)
- ✅ At least one **lowercase** letter (a-z)
- ✅ At least one **number** (0-9)
- ✅ At least one **special character** (`!@#$%^&*...`)

### 4. Rate Limiting (Brute-Force Protection)
```js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Max 10 attempts per IP
});
router.post('/login', authLimiter, login);
router.post('/signup', authLimiter, signup);
```

### 5. Role-Based Access Control (RBAC)
Users are assigned a `role` field: `'user'` (default) or `'admin'`. Protected backend routes use the `admin` middleware to verify elevated permissions. The initial admin account is seeded securely from environment variables — no public signup path grants admin access.

---

## ✉️ Email Verification Flow

This system enforces a **verify-before-login** policy, identical to how production platforms like GitHub and Stripe work.

```
User Signs Up
     │
     ▼
Backend creates user (isVerified: false)
     │
     ▼
Secure token generated via crypto.randomBytes()
     │
     ▼
Token hashed (SHA-256) and saved to DB with 24h expiry
     │
     ▼
Real email sent via SMTP (Gmail) with styled HTML button
     │
     ▼
User clicks link → /verify-email/:token
     │
     ▼
Backend verifies token hash, sets isVerified = true
     │
     ▼
User is logged in and redirected to /dashboard
```

**If user tries to log in before verifying:**
```json
{ "message": "Please verify your email before logging in." }
```

---

## 🔑 Password Reset Flow

```
User visits /forgot-password → enters email
     │
     ▼
Backend generates secure reset token (crypto), stores hashed version, 10-min expiry
     │
     ▼
Email sent with reset link → /reset-password/:token
     │
     ▼
User enters new password
     │
     ▼
Backend verifies token hash + expiry, re-hashes new password, clears token
     │
     ▼
User is logged in automatically
```

---

## 🌐 Google OAuth Flow

Uses the `@react-oauth/google` library with the **implicit grant** flow. The frontend receives an access token, fetches the user's real profile from Google's API, then sends the profile to the backend which creates or finds the user account and sets an HTTP-only JWT cookie.

- **Why no verification email?** Google OAuth users are automatically marked as `isVerified: true`. Because they authenticated through Google, Google has *already* verified that they own the email address. Bypassing the extra email check provides a seamless user experience while maintaining security.
- No password is required or stored for OAuth accounts.

---

## 📁 Project Structure

```
assignment/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (user, login, signup, logout)
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page with Google OAuth
│   │   │   ├── Signup.jsx           # Signup with strength meter
│   │   │   ├── Dashboard.jsx        # Protected user dashboard
│   │   │   ├── ForgotPassword.jsx   # Request reset link page
│   │   │   ├── ResetPassword.jsx    # Enter new password page
│   │   │   └── VerifyEmail.jsx      # Email verification handler
│   │   └── App.jsx                  # Routes + ProtectedRoute / PublicRoute guards
│   └── .env
│
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection + admin seeder
│   ├── controllers/
│   │   └── authController.js        # login, signup, google, forgotPassword, resetPassword, verifyEmail
│   ├── middleware/
│   │   └── authMiddleware.js        # protect, admin middleware
│   ├── models/
│   │   └── User.js                  # Mongoose schema with bcrypt hooks + token methods
│   ├── routes/
│   │   └── authRoutes.js            # All auth API routes
│   ├── utils/
│   │   ├── sendEmail.js             # Nodemailer SMTP email utility
│   │   └── tokenUtils.js           # JWT cookie generator
│   └── .env
│
└── package.json                # Root scripts for deployment
```

---

## ⚙️ Environment Variables

### `server/.env`
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_jwt_secret
CLIENT_URL=http://localhost:5173

# Admin seeder (creates first admin on startup if not exists)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourAdminPassword123!

# SMTP Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FROM_NAME=AuthSystem
FROM_EMAIL=your_gmail@gmail.com
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate. Use this instead of your normal Gmail password.

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Google Client ID:** Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client → Add `http://localhost:5173` to Authorized JavaScript Origins.

---

## 🛠️ Local Development Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd assignment

# 2. Install all dependencies (root, client, server)
npm install

# 3. Configure environment variables
# Fill in server/.env and client/.env as shown above

# 4. Start the backend
cd server && npm run dev

# 5. Start the frontend (new terminal)
cd client && npm run dev

# 6. Open the app
# http://localhost:5173
```

---

## 📡 API Documentation

### Public Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & get HTTP-only cookie | No |
| `POST` | `/api/auth/google` | Google OAuth login/registration | No |
| `POST` | `/api/auth/logout` | Clear HTTP-only session cookie | No |
| `POST` | `/api/auth/forgotpassword` | Send password reset email | No |
| `PUT` | `/api/auth/resetpassword/:token` | Reset password using email token | No |
| `GET` | `/api/auth/verifyemail/:token` | Verify user's email address | No |
| `GET` | `/api/public` | Test public endpoint | No |

### Protected Routes (Requires JWT Cookie)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/auth/profile` | Get logged-in user's profile | Yes (User) |
| `GET` | `/api/auth/admin` | Test admin-only endpoint | Yes (Admin) |

---

## 🚢 Deployment (Render / Railway)

```bash
# Build command
npm run build

# Start command
npm start
```

The Express backend is configured to serve the React production build (`client/dist`) in production mode, so only **one server process** is needed.

---

## 🧪 Test the Features

| Feature | How to Test |
|---|---|
| **Signup** | Create account → check inbox → click Verify button → login |
| **Login block** | Try logging in before verifying → should show "Please verify" message |
| **Password rules** | Try weak passwords in signup form → see live checklist |
| **Forgot Password** | Click "Forgot password?" on login → enter email → check inbox → reset |
| **Google OAuth** | Click "Continue with Google" → select real account → lands on dashboard |
| **Admin role** | Login with `admin@authsystem.com` / `SecureAdmin123!` → see admin badge |
| **Protected Route** | Manually visit `/dashboard` without login → redirected to `/login` |
| **Rate Limiting** | Send >10 login requests in 15 minutes → blocked with error message |

---

## 🏗️ Bonus Features Implemented

- [x] **Role-Based Access Control** — `user` / `admin` roles with middleware enforcement
- [x] **Rate Limiting** — 10 requests per 15 minutes on auth routes
- [x] **Google OAuth** — Real OAuth 2.0 integration (not mocked)
- [x] **Email Verification** — Real SMTP email with styled HTML template
- [x] **Password Reset** — Cryptographically secure token flow with expiry
- [x] **HTTP-only Cookies** — XSS-safe session storage (explained in dashboard)
- [x] **Admin Auto-Seeder** — Secure first-admin creation from environment variables
- [x] **Password Strength Meter** — Real-time 5-point checklist with color-coded bar
- [x] **Server-side Validation** — All rules enforced at API level, not just frontend
- [x] **Production Static Serving** — Express serves React build for single-server deploy

---

## 📄 License

This project is for educational and evaluation purposes.

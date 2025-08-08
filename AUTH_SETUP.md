# EZLift Authentication Setup Guide

This guide will help you set up Firebase Authentication for the EZLift web application.

## Prerequisites

- Firebase project created
- Backend API with `/verify` endpoint
- Node.js and npm installed

## 1. Firebase Configuration

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console

### Enable Authentication Methods

In the Firebase console, go to Authentication > Sign-in method and enable:

- **Email/Password**
- **Google** (optional)
- **Apple** (optional)

**Apple Sign-In Notes:**
- The Apple button uses a popup flow on desktop browsers and automatically falls back to redirect on Safari/iOS when popups are blocked
- The redirect completion is handled automatically when users return from Apple's authentication page
- Account linking is supported - if a user tries to sign in with Apple using an email already associated with another provider, they'll receive guidance to sign in with the existing provider first

### Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and select Web
4. Register your app and copy the config

### Environment Variables

All Firebase config is sourced from environment variables. Nothing is hard-coded.

Create a `.env.local` file in your project root with:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
# Optional if using analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend Configuration (Server-side only)
BACKEND_BASE_URL=http://localhost:3001

# Optional: Firebase Admin SDK (server-only). Only set if used by API routes/functions
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

Production (Netlify): Set the same variables in Netlify Site settings → Build & Deploy → Environment variables. Do not rely on GitHub secrets at runtime.

## 2. Backend API Setup

Your backend needs to implement a `/verify` endpoint that:

- Accepts POST requests with Firebase ID tokens
- Verifies the token with Firebase Admin SDK
- Returns a session response

### Expected API Contract

**Endpoint:** `POST /verify`

**Request Body:**
```json
{
  "token": "firebase_id_token_here"
}
```

**Response:**
```json
{
  "token": "backend_jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "exp": 1720000000
}
```

## 3. Social Authentication Setup

### Google Sign-In

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains
4. Configure OAuth consent screen if needed

### Apple Sign-In

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Apple provider
3. Configure Apple Developer account settings
4. Add your domain to authorized domains

## 4. Installation

Install the required dependencies:

```bash
npm install firebase
```

## 5. Features Implemented

### ✅ Authentication Features

- **Email/Password Login & Signup**
- **Google Sign-In** (popup and redirect fallback)
- **Apple Sign-In** (popup and redirect fallback)
- **Password Reset**
- **Secure Session Management** (HttpOnly cookies)
- **Protected Routes** (middleware)
- **Auto Token Refresh**
- **Error Handling** (user-friendly messages)

### ✅ UI Components

- **Login Form** - Email/password with social options
- **Signup Form** - Email/password with validation
- **Forgot Password Form** - Email reset flow
- **Logout Button** - Session cleanup
- **Responsive Design** - Mobile-friendly forms

### ✅ Security Features

- **HttpOnly Cookies** - No localStorage tokens
- **Secure Cookie Settings** - SameSite=Lax, Secure in production
- **CSRF Protection** - Backend verification
- **Rate Limiting** - Firebase built-in protection
- **Input Validation** - Zod schemas
- **Error Mapping** - User-friendly error messages

## 6. Usage

### Login Flow

1. User enters email/password or clicks social button
2. Firebase authenticates user
3. Frontend gets ID token from Firebase
4. Frontend sends token to `/api/auth/session`
5. Backend verifies token with Firebase Admin
6. Backend returns session data
7. Frontend sets secure cookies
8. User is redirected to dashboard

### Protected Routes

Routes under `/app/*` require authentication. Unauthenticated users are redirected to `/login`.

### Logout Flow

1. User clicks logout
2. Frontend calls `DELETE /api/auth/session`
3. Backend clears session cookies
4. User is redirected to home page

## 7. File Structure

```
lib/
├── auth/
│   ├── firebaseClient.ts    # Firebase auth helpers
│   ├── errorMap.ts         # Error message mapping
│   ├── session.ts          # Session management
│   ├── guards.ts           # Server-side auth guards
│   └── schemas.ts          # Form validation schemas
├── config/
│   └── firebase.ts         # Firebase configuration
└── api.ts                  # API client with auth

app/
├── api/auth/session/
│   └── route.ts            # Session API endpoints
├── login/
│   └── page.tsx            # Login page
├── signup/
│   └── page.tsx            # Signup page
├── forgot-password/
│   └── page.tsx            # Password reset page
└── app/
    └── page.tsx            # Protected dashboard

components/
├── auth/
│   ├── LoginForm.tsx       # Login form component
│   ├── SignupForm.tsx      # Signup form component
│   ├── ForgotPasswordForm.tsx # Password reset form
│   └── LogoutButton.tsx    # Logout button component
└── layout/
    └── Header.tsx          # Updated with auth state

middleware.ts               # Route protection
```

## 8. Testing

### Test Scenarios

1. **Email Login Success**
   - Enter valid credentials
   - Should redirect to dashboard
   - Should show welcome toast

2. **Email Signup Success**
   - Enter valid email/password
   - Should create account and redirect
   - Should show welcome toast

3. **Password Reset**
   - Enter email address
   - Should send reset email
   - Should show success message

4. **Social Authentication**
   - Click Google/Apple button
   - Should open popup
   - Should handle popup blockers
   - Should redirect on success

5. **Protected Routes**
   - Try to access `/app` without auth
   - Should redirect to `/login`
   - Should preserve intended destination

6. **Logout**
   - Click logout button
   - Should clear session
   - Should redirect to home

## 9. Troubleshooting

### Common Issues

1. **Firebase Config Error**
   - Check environment variables
   - Ensure all required fields are set

2. **Backend Connection Error**
   - Verify `BACKEND_BASE_URL` is correct
   - Check backend is running
   - Verify `/verify` endpoint exists

3. **Social Auth Not Working**
   - Check domain is authorized in Firebase
   - Verify OAuth configuration
   - Check popup blockers

4. **Cookie Issues**
   - Ensure HTTPS in production
   - Check cookie settings
   - Verify domain configuration

### Debug Mode

Enable debug logging by adding to your environment:

```env
NEXT_PUBLIC_DEBUG=true
```

## 10. Production Deployment

### Environment Variables

Ensure all environment variables are set in your production environment:

- Firebase config (client-side)
- Backend URL (server-side)
- Any additional secrets

### Security Checklist

- [ ] HTTPS enabled
- [ ] Secure cookies configured
- [ ] Domain restrictions set
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring set up

## 11. Analytics Events

The system fires these events for tracking:

- `auth_login_success`
- `auth_signup_success`
- `auth_social_google`
- `auth_social_apple`
- `auth_reset_sent`
- `auth_error`

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Verify network requests in dev tools 
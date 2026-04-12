# Firebase Authentication Setup Guide

## Overview
This guide explains how to set up Firebase Authentication for the admin panel. The system now uses Firebase Authentication instead of a hardcoded password, providing secure email/password-based access control.

## Features
- ✅ Secure email/password authentication via Firebase
- ✅ Only specified admin email can access the admin panel
- ✅ Non-admin emails automatically logged out
- ✅ Persistent auth state across page refreshes
- ✅ Removed hardcoded password security vulnerability

## Setup Steps

### 1. Update .env.local with Admin Email

Edit `.env.local` and set your admin email:

```env
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

Replace `your-admin-email@example.com` with the email you want to use as admin.

**Example:**
```env
VITE_ADMIN_EMAIL=satya@groceries-farm.com
```

### 2. Create Firebase User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "groceries-farm" project
3. Navigate to **Authentication** → **Users** (left sidebar)
4. Click **Add User**
5. Enter the same email as `VITE_ADMIN_EMAIL`
6. Create a strong password
7. Click **Create User**

Example:
- Email: `satya@groceries-farm.com`
- Password: `YourSecurePassword123!`

### 3. Enable Authentication Method

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable the toggle if not already enabled
4. Click **Save**

### 4. Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin`
3. You should see the Firebase Authentication login form
4. Login with:
   - Email: Your `VITE_ADMIN_EMAIL` value
   - Password: The password you created in Firebase

5. If login is successful:
   - ✅ Admin dashboard loads
   - ✅ Shows "Logged in as: your-email@example.com"
   - ✅ Can manage products and categories

6. If you try to login with a different email:
   - ❌ You'll get "Only admin account can access this panel" error

### 5. Deploy to Vercel

1. In Vercel deployment settings, add environment variable:
   - Key: `VITE_ADMIN_EMAIL`
   - Value: Your admin email (same as local)

2. The Firebase credentials (API keys) are already in Vercel from previous deployment

3. Redeploy your site

### Connection Flow

```
User visits /admin
        ↓
onAuthChange listener starts
        ↓
User logs in with email/password
        ↓
Firebase validates credentials
        ↓
System checks if email === VITE_ADMIN_EMAIL
        ↓
If YES: Admin dashboard loading
If NO: Auto-logout with "Access Denied" message
```

## File Changes

### New Files Created
- `src/services/authService.ts` - Firebase authentication service
  - `loginWithEmail(email, password)` - Sign in with credentials
  - `logoutUser()` - Sign out
  - `onAuthChange(callback)` - Listen to auth state
  - `getCurrentUser()` - Get current user
  - `isCurrentUserAdmin()` - Check admin status
  - `getAdminEmail()` - Get admin email from env

### Modified Files
- `src/lib/firebase.ts` - Added Auth export
- `src/pages/AdminPage.tsx` - Complete Firebase Auth integration
- `.env.local` - Added `VITE_ADMIN_EMAIL` variable

### Removed
- ❌ `const ADMIN_PASSWORD = 'Satya@Dev10'` hardcoded password

## Environment Variables

### Required
```env
# Firebase (already set)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

# Admin Email (NEW - must be set)
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

## Troubleshooting

### "Access Denied - Only admin account can access this panel"
**Problem:** You logged in with a non-admin email
**Solution:** Use the email configured in `VITE_ADMIN_EMAIL`

### "Login failed: Error: Firebase: Error (auth/user-not-found)"
**Problem:** The user account doesn't exist in Firebase
**Solution:** Create a new user in Firebase Console with the same email

### "Login failed: Error: Firebase: Error (auth/wrong-password)"
**Problem:** You entered the wrong password
**Solution:** Check password or reset it in Firebase Console

### "Checking authentication..." spins forever
**Problem:** Firebase not properly initialized
**Solution:** Check that all Firebase environment variables are set correctly

### Auth state not persisting after refresh
**Problem:** Browser's localStorage might be disabled
**Solution:** Check browser settings allow localStorage for your domain

## Security Features

✅ **No hardcoded passwords** - Credentials managed by Firebase
✅ **Admin email validation** - Only specified email can access
✅ **Auth persistence** - Session survives page refreshes
✅ **Automatic logout** - Non-admins immediately logged out
✅ **Environment-based configuration** - Easy to change admin without code

## Adding More Admin Users (Future)

To support multiple admin users, modify `authService.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin1@groceries-farm.com',
  'admin2@groceries-farm.com'
];

export const isCurrentUserAdmin = (): boolean => {
  return ADMIN_EMAILS.includes(getCurrentUser()?.email || '');
};
```

Then create both users in Firebase Console.

## Switching Admin Email

1. Create new user in Firebase Console
2. Update `VITE_ADMIN_EMAIL` in `.env.local`
3. For production: Update in Vercel environment variables
4. Redeploy
5. Old admin email can no longer access the panel

## Reference

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)

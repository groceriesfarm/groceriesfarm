# Firebase Firestore Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `wholesale-hub` (or your choice)
4. Click "Create project"
5. Wait for the project to be created

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. **Location**: Choose the region closest to your users
4. **Security rules**: Select **"Start in test mode"** (for development)
   - Later you can change to production rules
5. Click **"Create"**

## Step 3: Get Your Firebase Config

1. Go to **Project Settings** (⚙️ icon at top)
2. Click **"General"** tab
3. Scroll down to **"Your apps"** section
4. If no app exists, click **"Add app"** → **"Web"**
5. Copy the config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "wholesale-hub-xxxxx.firebaseapp.com",
  projectId: "wholesale-hub-xxxxx",
  storageBucket: "wholesale-hub-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

## Step 4: Add Config to .env.local

Open `.env.local` in your project and update:

```env
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=wholesale-hub-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wholesale-hub-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=wholesale-hub-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

## Step 5: Create Firestore Collection (Optional - App Does This Automatically)

The app will automatically create the `categories` collection when you add the first category. But you can manually create it:

1. In Firestore, click **"Start collection"**
2. Collection ID: `categories`
3. Click **"Next"**
4. Click **"Save"** (you can add documents manually or through the app)

## Step 6: Security Rules (Development vs Production)

### Development (Current - Test Mode)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production (When Ready)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to everyone
    match /categories/{document=**} {
      allow read: if true;
    }
    // Only admin can write (add password protection in your app)
    match /categories/{document=**} {
      allow write: if request.auth.uid != null;
    }
  }
}
```

## Step 7: Test the Connection

1. Restart your dev server: `npm run dev`
2. Open admin panel (password: `Satya@Dev10`)
3. Add a new category in the admin panel
4. Go to **Firebase Console → Firestore**
5. You should see the new category appear in the `categories` collection

## Data Structure in Firestore

Each category is stored as a document with this structure:

```
categories/
  ├── spices/
  │   ├── name: "Spices"
  │   ├── description: "Premium quality whole and ground spices..."
  │   ├── image: "imported_image_object"
  │   ├── items: [
  │   │   { id: "1", name: "Turmeric", category: "spices", image: "..." },
  │   │   { id: "2", name: "Red Chili Powder", ... }
  │   │ ]
  │   └── updatedAt: "2024-04-12T10:30:00Z"
  │
  └── jars/  ← New category added by admin
      ├── name: "Jars"
      ├── description: "Glass and plastic containers..."
      ├── image: "user_uploaded_image"
      ├── items: []
      └── updatedAt: "2024-04-12T11:45:00Z"
```

## How Data Sync Works

1. **Admin adds category** → Saved to Firestore + localStorage
2. **Admin edits product** → Synced to Firestore + localStorage
3. **You deploy code** → Data stays in Firestore ✅
4. **User visits site** → Loads latest data from Firestore
5. **No internet?** → Falls back to localStorage

## Troubleshooting

### "Firestore sync error"
- Check that your Firebase credentials in `.env.local` are correct
- Check Firestore is enabled in Firebase Console
- Check security rules allow writes in test mode

### Categories not syncing
- Open DevTools (F12) → Console
- Look for error messages
- Check that `.env.local` is properly formatted (no spaces around `=`)

### Missing data after deploy
- If Firestore shows the data, but website doesn't load it:
  - Clear browser cache (Cmd+Shift+R on Mac)
  - Check that `.env.local` is deployed (if using Vercel, etc.)

## Next Steps

- [ ] Create Firebase project
- [ ] Enable Firestore
- [ ] Get Firebase config
- [ ] Update `.env.local`
- [ ] Restart dev server
- [ ] Test adding a category in admin
- [ ] Verify data appears in Firestore Console

---

**Questions?** Check the [Firebase Documentation](https://firebase.google.com/docs/firestore)

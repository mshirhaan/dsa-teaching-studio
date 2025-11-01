# Firebase Setup Guide

## Overview
DSA Studio now supports optional Firebase authentication for cloud backup of your progress. This allows you to:
- Backup your roadmap data to the cloud
- Backup your code files and canvas files to the cloud
- Restore your progress from any device
- Keep your data safe and synchronized

## Prerequisites
- A Google account
- A Firebase project

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Google Authentication
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Enable it and save

### 3. Create a Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development) or **production mode**
4. Choose your preferred location

### 4. Get Your Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click on the **Web** icon (`</>`) if you haven't created a web app yet
4. Register your app with a nickname (e.g., "DSA Studio")
5. Copy the configuration values

Note: Configuration is already set up in `src/lib/firebase.ts` for the DSA Studio Firebase project.

### 5. Set Up Firestore Security Rules
In Firebase Console, go to **Firestore Database** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own roadmap data
    match /roadmap/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own workspace data
    match /workspace/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures users can only access their own data.

## Usage

### Sign In
1. Click the **Backup** button (Cloud icon) in the toolbar
2. Click "Sign in with Google"
3. Authorize DSA Studio to access your Google account

### Backup Your Data
1. After signing in, you'll see two sections: **Roadmap** and **Workspace**
2. **Backup Roadmap**: Saves your DSA problem progress
3. **Backup Workspace**: Saves your code files and canvas drawings
4. Click the appropriate backup button
5. You'll see a success toast notification

### Restore Your Data
1. Sign in with the same Google account
2. Choose what to restore: **Roadmap** or **Workspace**
3. Click "Restore Roadmap" or "Restore Workspace"
4. Confirm the overwrite when prompted
5. Your data will be restored from the cloud

## Security & Privacy
- All authentication is handled by Firebase
- Data is encrypted in transit and at rest
- Users can only access their own data
- No personal information beyond your email is stored
- You can delete your account anytime from Firebase Console

## Troubleshooting

### "Missing Firebase configuration" Error
- Firebase configuration is built into the app - no setup needed!

### Authentication Not Working
- Verify Google sign-in is enabled in Firebase Console
- Check that your Firebase project is active
- Make sure Firestore is initialized

### Backup/Restore Fails
- Check Firestore rules allow authenticated users to write
- Verify you're signed in with the same Google account
- Check browser console for detailed error messages

## Deploy to Production
The Firebase configuration is already set up. Simply:
1. Build the app: `npm run build`
2. Deploy to your preferred platform (Vercel, Netlify, etc.)
3. No additional configuration needed!

## Support
For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs
- Check project README.md for general help
- Open an issue on GitHub


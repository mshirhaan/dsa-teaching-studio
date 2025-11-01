# Firestore Security Rules Setup

## Current Error
```
FirebaseError: Missing or insufficient permissions
```

This happens when Firestore security rules are not configured to allow authenticated users to write data.

## Setup Instructions

### 1. Go to Firebase Console
1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dsa-studio-67b89**

### 2. Open Firestore Database
1. Click on **Firestore Database** in the left sidebar
2. Go to the **Rules** tab

### 3. Update Security Rules
Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own roadmap data
    match /roadmap/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Publish Rules
1. Click **Publish** button
2. Rules will be deployed within a few seconds

## Rule Explanation
- **`request.auth != null`**: Only authenticated users can access
- **`request.auth.uid == userId`**: Users can only access their own data
- **`read, write`**: Permissions for both reading and writing

## Testing
After updating the rules:
1. Refresh your browser
2. Click Backup button
3. Sign in with Google if needed
4. Click "Backup to Cloud"
5. You should see "Roadmap data backed up successfully!"

## Troubleshooting

### Still getting permission errors?
1. Clear browser cache and reload
2. Make sure you're signed in with Google
3. Check that the rules were published (look for a green checkmark)
4. Wait 1-2 minutes for rules to propagate

### Want to allow read-only public access?
For development/testing only, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roadmap/{document=**} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

**⚠️ Warning**: This allows anyone to read your data. Only use for development!

## Production Best Practices
For production, use strict rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roadmap/{userId} {
      allow read, write: if request.auth != null 
                          && request.auth.uid == userId
                          && request.resource.data.keys().hasAll(['roadmap', 'lastBackup']);
    }
  }
}
```

This also validates the data structure to ensure only valid roadmap data is written.


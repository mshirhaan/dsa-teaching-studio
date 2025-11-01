import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCz7YRR10f6SxChQKC_nS8m6mFlc9GCGyo",
  authDomain: "dsa-studio-67b89.firebaseapp.com",
  projectId: "dsa-studio-67b89",
  storageBucket: "dsa-studio-67b89.firebasestorage.app",
  messagingSenderId: "21808759",
  appId: "1:21808759:web:9a50d5e231be4319f7e872",
  measurementId: "G-3J78QP8C20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };

// Firestore helpers for roadmap data
export const backupRoadmapData = async (userId: string, roadmapData: any) => {
  try {
    await setDoc(
      doc(db, 'roadmap', userId),
      {
        roadmap: roadmapData,
        lastBackup: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error: any) {
    console.error('Error backing up roadmap:', error);
    throw error;
  }
};

export const restoreRoadmapData = async (userId: string): Promise<any | null> => {
  try {
    const docRef = doc(db, 'roadmap', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().roadmap;
    }
    return null;
  } catch (error: any) {
    console.error('Error restoring roadmap:', error);
    throw error;
  }
};


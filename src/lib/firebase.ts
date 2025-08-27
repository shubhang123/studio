
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyDuYuO-5f7ERUdmnAdbLNC4ejWicxl_1u8",
    authDomain: "trickster-mma5y.firebaseapp.com",
    projectId: "trickster-mma5y",
    storageBucket: "trickster-mma5y.appspot.com",
    messagingSenderId: "802806168678",
    appId: "1:802806168678:web:11a77847f485cc03cf81a7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const signUp = async (email: string, password: string, name: string, age: number) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Prepare user document data
    const userEmail = user.email ? user.email.toLowerCase() : '';
    const userData = {
      uid: user.uid,
      email: userEmail,
      name: name.trim(), // Remove extra whitespace
      age: age,
      createdAt: new Date().toISOString(),
      emailVerified: user.emailVerified, // Track verification status
    };

    // Create document in Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    
    console.log("User document created successfully in Firestore");
    return userCredential;
    
  } catch (error: any) {
    // If Firestore fails after user creation, we should handle cleanup
    console.error("Error in signup process:", error);
    
    // Re-throw the error to be handled by the calling component
    throw new Error(error.message || "Failed to create account");
  }
};


export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

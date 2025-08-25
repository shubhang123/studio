
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';

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

// Connect to emulators if in development environment
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  try {
    // Make sure emulators are running
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    console.log("Connected to Firebase Emulators");
  } catch (error) {
    console.error("Error connecting to Firebase Emulators:", error);
  }
}


// Authentication functions
export const signUp = async (email: string, password: string, name: string, age: number) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      age: age,
    });
  } catch (error) {
    console.error("Error creating user document in Firestore:", error);
    // Even if this fails, the user is already created in Firebase Auth.
    // In a production app, you might want to handle this more robustly, e.g., with a retry mechanism or logging.
  }
  
  return userCredential;
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

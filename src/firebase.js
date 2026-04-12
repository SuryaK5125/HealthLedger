// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDmlQlZXd3dCGezW1pv3SXjznM0e_pevV8",
  authDomain: "healthledger-6a053.firebaseapp.com",
  projectId: "healthledger-6a053",
  storageBucket: "healthledger-6a053.appspot.com", // FIXED THIS LINE
  messagingSenderId: "341081214441",
  appId: "1:341081214441:web:80353c8c01b03c7bdc8f78",
  measurementId: "G-M1WG50RMZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore & Storage
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Export them for use in your components
export { db, storage, auth, provider };
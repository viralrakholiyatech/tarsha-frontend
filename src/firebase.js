// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA23A7GU7kzJ9Kc9gUURdwZremmoEv7G_8",
  authDomain: "zaid-3a861.firebaseapp.com",
  projectId: "zaid-3a861",
  storageBucket: "zaid-3a861.appspot.com",
  messagingSenderId: "136131536872",
  appId: "1:136131536872:android:deec806cbe10b060bca65d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);




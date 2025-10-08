// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLSW2MSs9u7amgxiOUzLehjgUJMv_Ci4E",
  authDomain: "tn-bus-tracker-1b4d8.firebaseapp.com",
  databaseURL: "https://tn-bus-tracker-1b4d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tn-bus-tracker-1b4d8",
  storageBucket: "tn-bus-tracker-1b4d8.appspot.com",
  messagingSenderId: "660182962689",
  appId: "1:660182962689:web:f2f7ce8341984829f56600"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Convert email to Firebase-safe key
function keyFromEmail(email){
  return email.replace(/\./g,'_');
}

// Logout helper
async function logout() {
  const user = auth.currentUser;
  if(user) await set(ref(db, `sessions/${user.uid}`), null);
  await signOut(auth);
  window.location.href='index.html';
}

export { db, ref, set, get, push, onValue, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, keyFromEmail, logout };

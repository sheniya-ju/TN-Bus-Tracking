// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
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

// Helper to make Firebase keys safe
function keyFromEmail(email){
  return email.replace(/\./g,'_');
}

// Create session
async function createSession(user){
  const sessionRef = ref(db, `sessions/${user.uid}`);
  await set(sessionRef, {
    uid: user.uid,
    email: user.email,
    timestamp: new Date().toISOString()
  });
}

// Verify session
async function verifySession(){
  const user = auth.currentUser;
  if(!user) return null;
  const snap = await get(ref(db, `sessions/${user.uid}`));
  return snap.exists() ? snap.val() : null;
}

// Logout
async function logout(){
  const user = auth.currentUser;
  if(user) await set(ref(db, `sessions/${user.uid}`), null);
  await signOut(auth);
  window.location.href='login.html';
}

export { db, ref, set, get, keyFromEmail, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, createSession, verifySession, logout };

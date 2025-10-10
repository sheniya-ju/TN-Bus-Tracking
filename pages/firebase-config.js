// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase Config
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

// Helper
function keyFromEmail(email) {
  return email.replace(/\./g, "_");
}

// --- SESSION HANDLER ---
async function createSession(user) {
  localStorage.setItem("userSession", JSON.stringify({ uid: user.uid, email: user.email }));
}

// --- ASSIGN DRIVER TO BUS & ROUTE ---
async function assignDriver(email, busId, route, duration) {
  const driverKey = keyFromEmail(email);
  await set(ref(db, `drivers/${driverKey}`), {
    busId,
    route,
    assignedAt: new Date().toISOString(),
    duration
  });
  await update(ref(db, `users/${driverKey}`), { assignedBus: busId, route });

  // Automatically add bus under route
  await set(ref(db, `routes/${route}/${busId}`), {
    busNumber: busId,
    driverEmail: email,
    latitude: 0,
    longitude: 0
  });

  alert(`✅ Route '${route}' assigned to ${email} for ${duration}`);
}

// --- UPDATE DRIVER LOCATION ---
async function updateDriverLocation(email, lat, lng) {
  const driverKey = keyFromEmail(email);
  const snap = await get(ref(db, `drivers/${driverKey}`));
  if (snap.exists()) {
    const busId = snap.val().busId;
    const route = snap.val().route || "unknown";
    await update(ref(db, `buses/${busId}`), { lat, lng, updatedAt: new Date().toISOString(), route });
  }
}

// --- ADD COMPLAINT ---
async function addComplaint(userName, userEmail, busId, message) {
  const complaintRef = push(ref(db, "complaints"));
  await set(complaintRef, {
    userName,
    userEmail,
    busId,
    message,
    timestamp: new Date().toISOString()
  });
}

// --- ADD ROUTE & BUS ---
async function addBusToRoute(route, busId, busNumber, driverEmail) {
  await set(ref(db, `routes/${route}/${busId}`), {
    busNumber,
    driverEmail,
    latitude: 0,
    longitude: 0
  });
}

// --- LOGOUT FUNCTION ---
async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("userSession");
  window.location.href = "../pages/login.html";
}

// Export all needed functions
export {
  db,
  ref,
  set,
  get,
  onValue,
  update,
  push,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  keyFromEmail,
  createSession,
  assignDriver,
  updateDriverLocation,
  addComplaint,
  addBusToRoute,
  logoutUser
};

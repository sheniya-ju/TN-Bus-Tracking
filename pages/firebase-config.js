// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase, ref, set, get, onValue, update, push, remove
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
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

// Helper: safe key from email
function keyFromEmail(email) {
  return email.replace(/\./g, "_");
}

// ASSIGN DRIVER -> writes into assignedDrivers, drivers, users, and routes with duration
async function assignDriver(email, busId, route, durationDays = 1) {
  const driverKey = keyFromEmail(email);
  const assignedAt = new Date().toISOString();

  await set(ref(db, `assignedDrivers/${driverKey}`), {
    busNo: busId,
    route: route,
    assignedAt,
    durationDays: durationDays
  });

  await set(ref(db, `drivers/${driverKey}`), {
    busId,
    route,
    assignedAt,
    durationDays
  });

  await update(ref(db, `users/${driverKey}`), { assignedBus: busId, route });

  // Add bus under route (static info)
  await set(ref(db, `routes/${route}/${busId}`), {
    busNumber: busId,
    driverEmail: email,
    latitude: 0,
    longitude: 0
  });

  return { ok: true, message: `Assigned ${busId} → ${email} for ${durationDays} day(s)` };
}

// UPDATE DRIVER LOCATION
async function updateDriverLocation(email, lat, lng) {
  const driverKey = keyFromEmail(email);
  const snap = await get(ref(db, `drivers/${driverKey}`));
  if (snap.exists()) {
    const busId = snap.val().busId;
    const route = snap.val().route || "unknown";
    await set(ref(db, `driversLocation/${driverKey}`), {
      lat, lng, busId, route, time: new Date().toLocaleTimeString()
    });
  } else {
    throw new Error("Driver not assigned in DB");
  }
}

// ADD COMPLAINT
async function addComplaint(userName, userEmail, busId, message) {
  const complaintRef = push(ref(db, "complaints"));
  await set(complaintRef, {
    userName, userEmail, busId, message, timestamp: new Date().toISOString()
  });
}

// LOGOUT helper
async function logoutUser() {
  await signOut(auth);
  window.location.href = "../index.html";
}

// CHECK if assignment active based on duration
function isAssignmentActive(assignedAt, durationDays) {
  if (!durationDays) return true; // permanent
  const assignedTime = new Date(assignedAt).getTime();
  const now = new Date().getTime();
  const expiryTime = assignedTime + durationDays * 24 * 60 * 60 * 1000;
  return now <= expiryTime;
}

export {
  db, ref, set, get, onValue, update, push, remove,
  auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, keyFromEmail, assignDriver,
  updateDriverLocation, addComplaint, logoutUser, isAssignmentActive
};

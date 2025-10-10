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
  signOut,
  onAuthStateChanged
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

// SESSION helper
async function createSession(user) {
  localStorage.setItem("userSession", JSON.stringify({ uid: user.uid, email: user.email }));
}

// ASSIGN DRIVER -> writes into assignedDrivers, drivers, users, and routes
async function assignDriver(email, busId, route, duration) {
  const driverKey = keyFromEmail(email);

  // 1️⃣ Assigned driver info
  await set(ref(db, `assignedDrivers/${driverKey}`), {
    busNo: busId,
    route: route,
    duration: duration,
    assignedAt: new Date().toISOString()
  });

  // 2️⃣ Driver main node
  await set(ref(db, `drivers/${driverKey}`), {
    busId,
    route,
    assignedAt: new Date().toISOString(),
    duration
  });

  // 3️⃣ Update user node (optional)
  await update(ref(db, `users/${driverKey}`), { assignedBus: busId, route });

  // 4️⃣ Add bus under route (users can query route)
  await set(ref(db, `routes/${route}/${busId}`), {
    busNumber: busId,
    driverEmail: email,
    latitude: 0,
    longitude: 0
  });

  return { ok: true, message: `Assigned ${busId} → ${email}` };
}

// UPDATE DRIVER LOCATION
async function updateDriverLocation(email, lat, lng) {
  const driverKey = keyFromEmail(email);
  const snap = await get(ref(db, `drivers/${driverKey}`));
  if (snap.exists()) {
    const busId = snap.val().busId;
    const route = snap.val().route || "unknown";
    await update(ref(db, `buses/${busId}`), { lat, lng, updatedAt: new Date().toISOString(), route });
    // driversLocation for admin realtime view
    await set(ref(db, `driversLocation/${driverKey}`), {
      lat, lng, busId, time: new Date().toLocaleTimeString()
    });
  } else {
    throw new Error("Driver not assigned in DB");
  }
}

// ADD COMPLAINT
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

// LOGOUT helper
async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem("userSession");
  window.location.href = "../index.html";
}

// Export
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
  onAuthStateChanged,
  keyFromEmail,
  createSession,
  assignDriver,
  updateDriverLocation,
  addComplaint,
  logoutUser
};

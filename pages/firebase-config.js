// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getDatabase, ref, set, push, get, onValue, remove, update 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
   apiKey: "AIzaSyBLSW2MSs9u7amgxiOUzLehjgUJMv_Ci4E",
  authDomain: "tn-bus-tracker-1b4d8.firebaseapp.com",
  databaseURL: "https://tn-bus-tracker-1b4d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tn-bus-tracker-1b4d8",
  storageBucket: "tn-bus-tracker-1b4d8.firebasestorage.app",
  messagingSenderId: "660182962689",
  appId: "1:660182962689:web:f2f7ce8341984829f5660
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Helper: convert email to safe key
function keyFromEmail(email){
  return email.replace(/\./g,"_");
}

// ===== Admin Function: Assign Driver =====
async function assignDriver(driverEmail, busNo, route, durationDays=null){
  const key = keyFromEmail(driverEmail);
  let expiry = null;

  if(durationDays && durationDays !== 'permanent'){
    expiry = Date.now() + durationDays*24*60*60*1000; // duration in ms
  }

  const data = {
    busNo,
    route,
    assignedAt: Date.now(),
    durationDays: durationDays || 'permanent',
    expiry
  };

  await set(ref(db, `assignedDrivers/${key}`), data);
  await set(ref(db, `drivers/${key}`), { busNo, route, assignedAt: Date.now(), durationDays: durationDays || 'permanent', expiry });

  // Update user info if exists
  await update(ref(db, `users/${key}`), { assignedBus: busNo, route });

  // Add bus under routes for reference
  await set(ref(db, `routes/${route}/${busNo}`), {
    busNumber: busNo,
    driverEmail,
    latitude: 0,
    longitude: 0
  });

  return { ok:true, message:`Assigned ${busNo} to ${driverEmail}` };
}

// ===== Driver Function: Update Location =====
async function updateDriverLocation(driverEmail, busId, route, lat, lng){
  const key = keyFromEmail(driverEmail);
  await set(ref(db, `driversLocation/${key}`), {
    busId,
    route,
    lat,
    lng,
    time: new Date().toISOString()
  });
}

// ===== User Function: Submit Complaint =====
async function submitComplaint(userName, userEmail, busId, message){
  const newRef = push(ref(db, "complaints"));
  await set(newRef, {
    userName,
    userEmail,
    busId,
    message,
    timestamp: new Date().toISOString()
  });
}

// ===== Remove expired assignments =====
function removeExpiredAssignments(){
  onValue(ref(db, "assignedDrivers"), snapshot=>{
    const data = snapshot.val();
    if(!data) return;

    Object.entries(data).forEach(([key, val])=>{
      if(val.expiry && val.expiry < Date.now()){
        remove(ref(db, `assignedDrivers/${key}`));
        remove(ref(db, `driversLocation/${key}`));
      }
    });
  });
}

// Auto cleanup every 5 minutes
setInterval(removeExpiredAssignments, 5*60*1000);

// ===== Logout Helper =====
async function logoutUser(){
  await signOut(auth);
  window.location.href = "../index.html";
}

// ===== Export all functions =====
export { 
  db, auth, ref, set, get, onValue, push, remove, update, 
  signOut, onAuthStateChanged, assignDriver, updateDriverLocation, 
  submitComplaint, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  keyFromEmail, logoutUser
};

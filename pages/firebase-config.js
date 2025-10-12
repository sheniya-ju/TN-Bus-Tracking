// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getDatabase, ref, set, push, get, onValue, remove, update 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===== Firebase Config =====
const firebaseConfig = {
   apiKey: "AIzaSyBLSW2MSs9u7amgxiOUzLehjgUJMv_Ci4E",
   authDomain: "tn-bus-tracker-1b4d8.firebaseapp.com",
   databaseURL: "https://tn-bus-tracker-1b4d8-default-rtdb.asia-southeast1.firebasedatabase.app",
   projectId: "tn-bus-tracker-1b4d8",
   storageBucket: "tn-bus-tracker-1b4d8.firebasestorage.app",
   messagingSenderId: "660182962689",
   appId:  "1:660182962689:web:f2f7ce8341984829f56600"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// ===== Helper: Convert email to Firebase-safe key =====
function keyFromEmail(email){
  return email.trim().toLowerCase().replace(/\./g,"_");
}

// ===== Login & Signup =====
async function loginUser(email, password){
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

async function signupUser(name, email, password, role){
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userKey = keyFromEmail(email);
  await set(ref(db, `users/${userKey}`), {
    name, email, role, createdAt: new Date().toISOString()
  });
  return userCredential.user;
}

// ===== Logout =====
async function logoutUser(){
  await signOut(auth);
  window.location.href = "../index.html";
}

// ===== Admin: Assign Driver to Bus =====
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

  // Save assignment
  await set(ref(db, `assignedDrivers/${key}`), data);
  await set(ref(db, `drivers/${key}`), data);

  // Update user profile
  await update(ref(db, `users/${key}`), { assignedBus: busNo, route });

  // Add bus under route reference
  await set(ref(db, `routes/${route}/${busNo}`), {
    busNumber: busNo,
    driverEmail,
    latitude: 0,
    longitude: 0
  });

  return { ok:true, message:`Assigned ${busNo} to ${driverEmail}` };
}

// ===== Driver: Update Live Location =====
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

// ===== User: Submit Complaint =====
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

// ===== Remove Expired Assignments =====
function removeExpiredAssignments(){
  onValue(ref(db, "assignedDrivers"), snapshot => {
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

// ===== Export Functions =====
export { 
  db, auth, ref, set, get, onValue, push, remove, update,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut,
  loginUser, signupUser, logoutUser, assignDriver, updateDriverLocation, submitComplaint,
  keyFromEmail
};

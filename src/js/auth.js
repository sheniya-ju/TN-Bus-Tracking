// src/js/auth.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Elements
const btnLogin = document.getElementById('btnLogin');
const loginError = document.getElementById('loginError');
const loginRole = document.getElementById('loginRole');

const btnSignup = document.getElementById('btnSignup');
const signupRole = document.getElementById('signupRole');
const driverExtras = document.getElementById('driverExtras');

// Show bus/phone fields for driver
if (signupRole) {
  signupRole.addEventListener('change', () => {
    driverExtras.style.display = signupRole.value === 'driver' ? 'block' : 'none';
  });
}

// Signup
if (btnSignup) {
  btnSignup.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = signupRole.value;
    const busId = document.getElementById('signupBusId')?.value.trim() || '';
    const phone = document.getElementById('signupPhone')?.value.trim() || '';
    const signupError = document.getElementById('signupError');

    signupError.textContent = '';

    if (!email || !password) { signupError.textContent = 'Enter email & password'; return; }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      await setDoc(doc(db, 'users', uid), { name, email, role, phone, busId });

      if (role === 'driver' && busId) {
        await setDoc(doc(db, 'buses', busId), { busNumber: busId, driverId: uid, route:'', currentLocation:null, lastUpdated:null }, { merge:true });
      }

      // Redirect
      if (role === 'driver') location.href = './driver.html';
      else if (role === 'admin') location.href = './admin.html';
      else location.href = './user.html';

    } catch (err) {
      signupError.textContent = err.message;
    }
  });
}

// Login
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    loginError.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = loginRole.value;

    if (!email || !password) { loginError.textContent = 'Enter email & password'; return; }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const snap = await getDoc(doc(db, 'users', uid));

      if (!snap.exists()) { loginError.textContent='User not found'; await signOut(auth); return; }

      const savedRole = snap.data().role;
      if (savedRole !== role) { loginError.textContent='Role mismatch'; await signOut(auth); return; }

      // Redirect
      if (role === 'driver') location.href = './driver.html';
      else if (role === 'admin') location.href = './admin.html';
      else location.href = './user.html';

    } catch(err) {
      loginError.textContent = err.message;
    }
  });
}

// Optional: redirect if already logged in
onAuthStateChanged(auth, async user => {
  if (!user) return;
  const path = location.pathname.split('/').pop();
  if (path === 'login.html' || path === 'signup.html') {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;
    const role = snap.data().role;
    if (role === 'driver') location.href = './driver.html';
    else if (role === 'admin') location.href = './admin.html';
    else location.href = './user.html';
  }
});

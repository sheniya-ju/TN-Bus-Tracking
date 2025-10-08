// src/js/user.js
import { auth, db } from "../../pages/firebase-config.js";
import { collection, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// DOM elements
const btnLogout = document.getElementById('btnLogout');
const busListEl = document.getElementById('busList');
const complainSelect = document.getElementById('complainBus');
const complaintText = document.getElementById('complaintText');
const btnComplaint = document.getElementById('btnComplaint');
const complaintMsg = document.getElementById('complaintMsg');

// Logout
btnLogout?.addEventListener('click', async () => {
  await signOut(auth);
  location.href = '../pages/login.html';
});

// Initialize Leaflet map
const map = L.map('map').setView([11.1271, 78.6569], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
const markers = {};

// Real-time buses
onSnapshot(collection(db, 'buses'), (snapshot) => {
  const buses = {};
  snapshot.forEach(doc => buses[doc.id] = doc.data());

  // Update UI list and select
  busListEl.innerHTML = '';
  complainSelect.innerHTML = '<option value="">Select bus</option>';

  Object.keys(buses).forEach(busId => {
    const b = buses[busId];
    const busName = b.busNumber || busId;

    // List item
    const li = document.createElement('li');
    li.textContent = `${busName} — ${b.route || ''}`;
    li.onclick = () => {
      if (b.currentLocation?.latitude && b.currentLocation?.longitude) {
        map.setView([b.currentLocation.latitude, b.currentLocation.longitude], 14);
      }
    };
    busListEl.appendChild(li);

    // Select option
    const opt = document.createElement('option');
    opt.value = busId;
    opt.textContent = busName;
    complainSelect.appendChild(opt);

    // Map marker
    if (b.currentLocation?.latitude && b.currentLocation?.longitude) {
      const lat = b.currentLocation.latitude, lng = b.currentLocation.longitude;
      if (!markers[busId]) {
        markers[busId] = L.marker([lat, lng]).addTo(map).bindPopup(busName);
      } else {
        markers[busId].setLatLng([lat, lng]);
        markers[busId].getPopup().setContent(busName);
      }
    }
  });
});

// Complaint submit
btnComplaint?.addEventListener('click', async () => {
  complaintMsg.textContent = '';
  const busId = complainSelect.value;
  const text = complaintText.value.trim();
  const user = auth.currentUser;

  if (!user) {
    complaintMsg.textContent = 'Please login again.';
    return;
  }
  if (!busId || !text) {
    complaintMsg.textContent = 'Select bus and enter complaint.';
    return;
  }

  try {
    await addDoc(collection(db, 'complaints'), {
      userId: user.uid,
      busId,
      complaintText: text,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    complaintText.value = '';
    complaintMsg.textContent = 'Complaint submitted ✓';
  } catch (err) {
    complaintMsg.textContent = 'Error submitting complaint: ' + err.message;
  }
});

// Ensure user is logged in, otherwise redirect
auth.onAuthStateChanged(user => {
  if (!user) location.href = '../pages/login.html';
});

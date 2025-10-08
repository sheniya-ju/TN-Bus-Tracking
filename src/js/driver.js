// DOM elements
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const driverStatus = document.getElementById('driverStatus');
const inputBusId = document.getElementById('driverBusId');
const inputFreq = document.getElementById('freq');
const logoutBtn = document.getElementById('btnLogout');
const assignedBusDisplay = document.getElementById('assignedBus');

let intervalId = null;

// Load driver email from login (must be stored during login)
const currentDriverEmail = localStorage.getItem("driverEmail");
const drivers = JSON.parse(localStorage.getItem("drivers") || "{}");

if (currentDriverEmail && drivers[currentDriverEmail]?.busId) {
  const busId = drivers[currentDriverEmail].busId;
  inputBusId.value = busId;
  assignedBusDisplay.textContent = `🚍 Assigned Bus: ${busId}`;
} else {
  assignedBusDisplay.textContent = "⚠️ No bus assigned yet. Contact Admin.";
}

// Logout
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('driverEmail');
  localStorage.removeItem('userRole');
  window.location.href = '../index.html';
});

// Start sharing location
btnStart.onclick = () => {
  const busId = inputBusId.value.trim();
  const freqSec = Math.max(5, parseInt(inputFreq.value) || 5);

  if (!busId) { driverStatus.textContent = 'Enter Bus ID'; return; }
  if (!navigator.geolocation) { driverStatus.textContent = 'Geolocation not supported'; return; }

  btnStart.style.display = 'none';
  btnStop.style.display = 'inline-block';
  driverStatus.textContent = '📡 Sharing location...';

  intervalId = setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Save/update location in localStorage
      const buses = JSON.parse(localStorage.getItem("buses") || "{}");
      buses[busId] = { busId, lat, lng, lastUpdated: new Date().toLocaleTimeString() };
      localStorage.setItem("buses", JSON.stringify(buses));

      driverStatus.textContent = `Updated ✓ ${new Date().toLocaleTimeString()}`;
    }, (err) => {
      driverStatus.textContent = 'GPS error: ' + err.message;
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 });
  }, freqSec * 1000);
};

// Stop sharing location
btnStop.onclick = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  btnStop.style.display = 'none';
  btnStart.style.display = 'inline-block';
  driverStatus.textContent = '⏹️ Stopped';
};

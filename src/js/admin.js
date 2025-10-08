// DOM elements
const btnLogout = document.getElementById('btnLogout');
const assignEmailInput = document.getElementById('assignDriverEmail'); // now we use email
const assignBusInput = document.getElementById('assignBusId');
const btnAssign = document.getElementById('btnAssign');
const assignMsg = document.getElementById('assignMsg');
const complaintsList = document.getElementById('complaintsList'); // for complaints display

// Logout
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  window.location.href = '../index.html';
});

// Assign driver to bus
btnAssign?.addEventListener('click', () => {
  const email = assignEmailInput.value.trim();
  const busId = assignBusInput.value.trim();
  if (!email || !busId) {
    assignMsg.textContent = 'Enter Driver Email and Bus ID';
    assignMsg.style.color = 'red';
    return;
  }

  const drivers = JSON.parse(localStorage.getItem('drivers') || '{}');
  drivers[email] = { busId };
  localStorage.setItem('drivers', JSON.stringify(drivers));

  assignMsg.textContent = `Assigned ${busId} → ${email}`;
  assignMsg.style.color = 'green';
});

// --------- Complaints Feature --------- //
// Function to display complaints
function updateComplaints() {
  if (!complaintsList) return;

  complaintsList.innerHTML = '';
  const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

  complaints.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${c.userName} (${c.userEmail})</strong><br>
      Bus: ${c.busId}<br>
      Message: ${c.message}<br>
      <small>${c.timestamp}</small>
    `;
    complaintsList.appendChild(li);
  });
}

// Update complaints every 3 seconds
setInterval(updateComplaints, 3000);
updateComplaints(); // initial call

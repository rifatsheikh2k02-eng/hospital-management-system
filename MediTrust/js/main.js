document.addEventListener('DOMContentLoaded', () => {
/* Client-only MediTrust
   - Validations on signup/reset
   - Patient cannot view audit/export
   - Improved chat replies & quick actions
   - Patient dashboard: book appointment + request ambulance + view prescriptions/subs
*/

const signupBox=document.getElementById('signupBox'), signinBox=document.getElementById('signinBox'), forgotBox=document.getElementById('forgotBox'), resetBox=document.getElementById('resetBox'), loggedBox=document.getElementById('loggedBox');
const dashboard=document.getElementById('dashboard'), dashContent=document.getElementById('dashContent'), dashTitle=document.getElementById('dashTitle'), dashWelcome=document.getElementById('dashWelcome'), dashBadge=document.getElementById('dashBadge');
const auditArea=document.getElementById('auditArea'), auditTable=document.querySelector('#auditTable tbody'), exportAuditBtn=document.getElementById('exportAudit');

// Simple toast helper (graceful fallback to console)
function toast(msg, t = 3500){
  try{
    const el = document.getElementById('toast');
    if(!el){ console.log('TOAST:', msg); return; }
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(()=>{ el.classList.add('hidden'); }, t);
  }catch(e){ console.log('TOAST:', msg); }
}

function showAudit(){
  if(!auditArea){ toast('Audit view is not available'); return; }
  if(auditArea && auditArea.classList) auditArea.classList.remove('hidden');
  const mainAreaEl = document.getElementById('mainArea'); if(mainAreaEl && mainAreaEl.classList) mainAreaEl.classList.add('hidden');

  // Ensure there's a title for the audit area
  if(!auditArea.querySelector('.auditTitle')){
    const h = document.createElement('div');
    h.className = 'auditTitle';
    h.innerHTML = '<h4>Audit Logs</h4>';
    auditArea.insertBefore(h, auditArea.firstChild);
  }

  // Ensure table has a header row (Time | User | Action)
  const auditTableEl = auditTable ? auditTable.closest('table') : null;
  if(auditTableEl){
    if(!auditTableEl.tHead || auditTableEl.tHead.rows.length === 0){
      const thead = auditTableEl.createTHead();
      const row = thead.insertRow();
      row.insertCell().outerHTML = '<th>Time</th>';
      row.insertCell().outerHTML = '<th>User</th>';
      row.insertCell().outerHTML = '<th>Action</th>';
    }
  }

  // Ensure the table is wrapped in a scrollable container so users can scroll the full audit
  if(auditTableEl){
    let scrollWrap = auditArea.querySelector('.auditScroll');
    if(!scrollWrap){
      scrollWrap = document.createElement('div');
      scrollWrap.className = 'auditScroll';
      // inline styles to guarantee scroll behavior regardless of external CSS
      scrollWrap.style.maxHeight = '65vh';
      scrollWrap.style.overflow = 'auto';
      scrollWrap.style.marginTop = '8px';
      // move the table into the scroll container
      auditArea.appendChild(scrollWrap);
      scrollWrap.appendChild(auditTableEl);
    } else {
      // ensure styles remain applied
      scrollWrap.style.maxHeight = '65vh';
      scrollWrap.style.overflow = 'auto';
    }
  }

  try{
    // If an inline audit table exists, populate it; otherwise inform the user
    const tbody = auditTable || (document.querySelector('#auditTable tbody') || null);
    if(!tbody){
      // no inline table available
      fetch('/MediTrust/?action=audit')
        .then(r => r.json())
        .then(data => {
          const logs = data.auditLogs || data || [];
          toast((logs && logs.length) ? (logs.length + ' audit entries loaded') : 'No audit entries');
        })
        .catch(err => { console.error('Error loading audit:', err); toast('Error loading audit'); });
      return;
    }
    // populate inline tbody
    fetch('/MediTrust/?action=audit')
      .then(r => r.json())
      .then(data => {
        tbody.innerHTML = '';
        const logs = data.auditLogs || data || [];
        if(!logs || logs.length === 0){
          tbody.innerHTML = '<tr><td colspan="3" class="small-muted">No entries</td></tr>';
          return;
        }
        logs.forEach(log => {
          const tr = document.createElement('tr');
          const t = log.timestamp || log.time || '';
          const u = log.user || log.username || '';
          const a = log.action || log.msg || '';
          tr.innerHTML = '<td>'+t+'</td><td>'+u+'</td><td>'+a+'</td>';
          tbody.appendChild(tr);
        });
      })
      .catch(err => { console.error('Error loading audit:', err); toast('Error loading audit'); });
  }catch(err){ console.error('Error preparing audit view:', err); toast('Could not load audit'); }
}

// Navigation & UI toggles
// Navigation & UI toggles (guarded — some elements may be absent in certain views)
function onClickIfExists(id, handler){ const el = document.getElementById(id); if(el) el.onclick = handler; }

onClickIfExists('toSignin', ()=>{ signupBox.classList.add('hidden'); signinBox.classList.remove('hidden'); });
onClickIfExists('toSignup', ()=>{ signinBox.classList.add('hidden'); signupBox.classList.remove('hidden'); });
onClickIfExists('toForgot', ()=>{ signinBox.classList.add('hidden'); forgotBox.classList.remove('hidden'); });
onClickIfExists('fg_back', ()=>{ forgotBox.classList.add('hidden'); signinBox.classList.remove('hidden'); });
onClickIfExists('reset_cancel', ()=>{ resetBox.classList.add('hidden'); signinBox.classList.remove('hidden'); });
onClickIfExists('closeAudit', ()=>{ if(auditArea) auditArea.classList.add('hidden'); const ma = document.getElementById('mainArea'); if(ma) ma.classList.remove('hidden'); });
onClickIfExists('openAudit', showAudit);
onClickIfExists('goChat', ()=>{ const ca = document.getElementById('chatArea'); if(ca) ca.classList.remove('hidden'); if(dashboard) dashboard.classList.add('hidden'); });
onClickIfExists('goDashboard', renderDashboard);

// Session helpers
function getSession(){
  return fetch('/MediTrust/?action=session')
    .then(response => response.json());
}

// Validation helpers
function validEmail(email){
  if(!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validPassword(p){ return typeof p === 'string' && p.length >= 8; }
function validFullName(n){ if(!n || typeof n !== 'string') return false; return /^[A-Za-z]+\s+[A-Za-z]+/.test(n.trim()); }

// Helper to produce an ISO timestamp for server-side 'when' fields
function now(){ return new Date().toISOString(); }

// Update auth UI and role-based visibility
function updateAuthUI(){
  getSession().then(s => {
    const openAuditEl = document.getElementById('openAudit');
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userAvatarEl = document.getElementById('userAvatar');
    const goChatEl = document.getElementById('goChat');

    if(!s){ 
      if(loggedBox && loggedBox.classList) loggedBox.classList.add('hidden');
      if(signupBox && signupBox.classList) signupBox.classList.add('hidden');
      const signinBoxEl = document.getElementById('signinBox'); if(signinBoxEl && signinBoxEl.classList) signinBoxEl.classList.remove('hidden');
      if(openAuditEl && openAuditEl.classList) openAuditEl.classList.add('hidden');
      if(exportAuditBtn && exportAuditBtn.classList) exportAuditBtn.classList.add('hidden');
      return; 
    }
    if(userNameEl) userNameEl.textContent = s.name;
    if(userRoleEl) userRoleEl.textContent = s.role;
    if(userAvatarEl) userAvatarEl.textContent = s.name.split(' ').map(x=>x[0]).slice(0,2).join('');
    if(signupBox && signupBox.classList) signupBox.classList.add('hidden');
    const signinBoxEl2 = document.getElementById('signinBox'); if(signinBoxEl2 && signinBoxEl2.classList) signinBoxEl2.classList.add('hidden');
    if(forgotBox && forgotBox.classList) forgotBox.classList.add('hidden');
    if(resetBox && resetBox.classList) resetBox.classList.add('hidden');
    if(loggedBox && loggedBox.classList) loggedBox.classList.remove('hidden');
    // audit: only for admin
    if(s.role !== 'admin'){
      if(openAuditEl && openAuditEl.classList) openAuditEl.classList.add('hidden');
      if(exportAuditBtn && exportAuditBtn.classList) exportAuditBtn.classList.add('hidden');
    } else {
      if(openAuditEl && openAuditEl.classList) openAuditEl.classList.remove('hidden');
      if(exportAuditBtn && exportAuditBtn.classList) exportAuditBtn.classList.remove('hidden');
    }
    // chat: only for patient
    if(s.role !== 'patient'){
      if(goChatEl && goChatEl.classList) goChatEl.classList.add('hidden');
    } else {
      if(goChatEl && goChatEl.classList) goChatEl.classList.remove('hidden');
    }
  });
}
updateAuthUI();

// Export audit JSON
if(exportAuditBtn){
  exportAuditBtn.onclick = ()=>{
    fetch('/MediTrust/?action=audit')
      .then(r=>r.json())
      .then(data=>{
        const logs = data.auditLogs || data;
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('Exported audit.json');
      })
      .catch(err=>{ console.error('Error exporting audit:', err); toast('Error exporting audit'); });
  };
}

// Signup logic with validation
document.getElementById('signupBtn').onclick = ()=>{
  const name = document.getElementById('su_name').value.trim();
  const email = document.getElementById('su_email').value.trim().toLowerCase();
  const pass = document.getElementById('su_pass').value;
  const pass2 = document.getElementById('su_pass2').value;
  const role = document.getElementById('su_role').value;
  const errEl = document.getElementById('signupError');
  errEl.classList.add('hidden'); errEl.textContent = '';
  if(!validFullName(name)){ errEl.textContent = 'Enter full name (first and last name, letters only)'; errEl.classList.remove('hidden'); return; }
  if(!validEmail(email)){ errEl.textContent = 'Enter a valid email address'; errEl.classList.remove('hidden'); return; }
  if(!validPassword(pass)){ errEl.textContent = 'Password must be at least 8 characters'; errEl.classList.remove('hidden'); return; }
  if(pass !== pass2){ errEl.textContent = 'Passwords do not match'; errEl.classList.remove('hidden'); return; }
  if(!role){ errEl.textContent = 'Select a role'; errEl.classList.remove('hidden'); return; }
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', pass);
  formData.append('role', role);

  fetch('/MediTrust/?action=signup', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    const ct = response.headers.get('content-type') || '';
    return response.text().then(t => {
      if (ct.indexOf('application/json') !== -1) {
        try {
          return JSON.parse(t);
        } catch (err) {
          console.error('Signup endpoint returned invalid JSON:', t);
          throw new Error('Invalid JSON response');
        }
      }
      console.error('Signup endpoint did not return JSON:', t);
      throw new Error('Invalid JSON response');
    });
  })
  .then(data => {
    if (data.message === "User was created.") {
      toast('Signup successful — please sign in');
      signupBox.classList.add('hidden');
      signinBox.classList.remove('hidden');
    } else {
      errEl.textContent = data.message;
      errEl.classList.remove('hidden');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    errEl.textContent = 'An error occurred. Please try again.';
    errEl.classList.remove('hidden');
  });
}

// Signin logic with validation
document.getElementById('signinBtn').onclick = ()=>{
  const email = document.getElementById('si_email').value.trim().toLowerCase();
  const pass = document.getElementById('si_pass').value;
  const err = document.getElementById('signinError'); err.classList.add('hidden'); err.textContent='';
  if(!validEmail(email)){ err.textContent='Enter valid email'; err.classList.remove('hidden'); return; }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', pass);

  fetch('/MediTrust/?action=login', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === "Login successful.") {
      updateAuthUI();
      toast('Signed in');
      renderDashboard();
    } else {
      err.textContent = data.message || 'Invalid credentials';
      err.classList.remove('hidden');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    err.textContent = 'An error occurred. Please try again.';
    err.classList.remove('hidden');
  });
}

// Logout
document.getElementById('logoutBtn').onclick = (e)=>{ 
  if(e && e.preventDefault) e.preventDefault();
  fetch('/MediTrust/?action=logout')
    .then(response => response.json())
    .then(data => {
      if (data.message === "Logout successful.") {
        updateAuthUI(); 
        dashboard.classList.add('hidden'); 
        document.getElementById('mainArea').classList.remove('hidden'); 
        toast('Logged out');
      }
    })
    .catch(err=>{ console.error('Logout error', err); toast('Logout failed'); });
  return false;
}

// Forgot / reset flows (client-only code)

const verificationStore = {};

document.getElementById('sendCodeBtn').onclick = ()=>{

  const email = document.getElementById('fg_email').value.trim().toLowerCase();

  const err = document.getElementById('fgError'); err.classList.add('hidden'); err.textContent='';

  if(!validEmail(email)){ err.textContent='Enter a valid email'; err.classList.remove('hidden'); return; }

  // TODO: Check if user exists in the database

  const code = Math.floor(100000 + Math.random()*900000).toString();

  verificationStore[email] = {code, expires: Date.now()+1000*60*15};

  // show code (demo) and open reset box

  toast('Verification code: '+code,8000);

  forgotBox.classList.add('hidden'); resetBox.classList.remove('hidden');

  document.getElementById('rc_code').value=''; document.getElementById('rc_pass').value=''; document.getElementById('rc_pass2').value='';

}

document.getElementById('resetBtn').onclick = ()=>{

  const email = document.getElementById('fg_email').value.trim().toLowerCase();

  const code = document.getElementById('rc_code').value.trim();

  const np = document.getElementById('rc_pass').value;

  const np2 = document.getElementById('rc_pass2').value;

  const err = document.getElementById('rcError'); err.classList.add('hidden'); err.textContent='';

  if(!email || !code || !np || !np2){ err.textContent='Fill all fields'; err.classList.remove('hidden'); return; }

  const stored = verificationStore[email]; if(!stored || stored.code !== code || stored.expires < Date.now()){ err.textContent='Invalid or expired code'; err.classList.remove('hidden'); return; }

  if(!validPassword(np)){ err.textContent='Password must be at least 8 characters'; err.classList.remove('hidden'); return; }

  if(np !== np2){ err.textContent='Passwords do not match'; err.classList.remove('hidden'); return; }

  // TODO: Update password in the database
  document.getElementById('rc_code').value = '';
  document.getElementById('rc_pass').value = '';
  document.getElementById('rc_pass2').value = '';

  delete verificationStore[email];
  resetBox.classList.add('hidden'); signinBox.classList.remove('hidden'); toast('Password reset — please sign in');

}

// Render dashboards per role
function renderDashboard(){
  getSession().then(s => {
    if(!s){ toast('Please sign in'); return; }
    dashboard.classList.remove('hidden'); document.getElementById('mainArea').classList.remove('hidden');
    document.getElementById('chatArea').classList.add('hidden');
    dashTitle.textContent = s.role.charAt(0).toUpperCase()+s.role.slice(1)+' Dashboard';
    dashWelcome.textContent = 'Welcome, '+s.name.split(' ')[0];
    dashBadge.textContent = s.role.toUpperCase();
    dashContent.innerHTML = ''; // Clear previous content
    // addAudit(s.email,'viewed dashboard'); // Audit call, will be replaced with fetch

    if(s.role === 'admin') renderAdmin(s);
    if(s.role === 'doctor') renderDoctor(s);
    if(s.role === 'patient') renderPatient(s);
  });
}



// Escape and small helpers done above

// Server-side audit logging
function sendAudit(user, action) {
  const formData = new FormData();
  formData.append('user', user);
  formData.append('action', action);
  fetch('/MediTrust/?action=addAuditLog', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if(!response.ok){
      if(response.status === 403){
        // Not permitted to add audit (server restricts to admin) — ignore silently
        console.warn('Audit not permitted (403) for', user);
        return null;
      }
      return response.text().then(t => { console.error('Audit endpoint error:', response.status, t); return null; });
    }
    return response.json().catch(e=>{ console.warn('Audit responded with non-JSON'); return null; });
  })
  .then(data => {
    if(data && data.message) console.debug('Audit:', data.message);
  })
  .catch(error => {
    console.error('Error sending audit log:', error);
  });
}

function renderAdmin(s){ // s is the session object
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <h4>Admin controls</h4>
    <div class="grid">
      <div>
        <div class="small-muted">Users</div>
        <table class="table" id="adminUsers"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody></tbody></table>
      </div>
      <!-- Audit snapshot removed from admin dashboard UI per request; audit logic remains available elsewhere -->
      <div>
        <div class="small-muted">User Actions</div>
        <div class="row" style="gap:8px; margin-top:6px; justify-content:flex-end">
          <button class="btn" id="addUser">Add user</button>
          <button class="btn" id="updateUser">Update user</button>
          <button class="btn" id="changeName">Change name</button>
          <button class="btn" id="deleteUser">Delete user</button>
        </div>
        <div style="margin-top:12px" class="small-muted"></div>
        <div class="code" id="queryResult"></div>
      </div>
    </div>
  `;
  dashContent.appendChild(wrapper);
  // audit view button removed — no wiring required
  const tbody = document.querySelector('#adminUsers tbody');
  // helper to refresh users table
  function refreshUsers(){
    fetch('/MediTrust/?action=users')
      .then(response => response.json())
      .then(users => {
        tbody.innerHTML = users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join('') || '<tr><td colspan="3" class="small-muted">No users</td></tr>';
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="3">Error loading users.</td></tr>';
      });
  }
  // initial load
  refreshUsers();


  const seedBtnEl = document.getElementById('seedBtn');
  if(seedBtnEl){
    seedBtnEl.onclick = ()=>{ 
      toast('Seeding demo data (server-side not implemented yet)');
      fetch('/MediTrust/?action=seedDemo', { method: 'POST' })
        .then(()=>{ refreshUsers(); })
        .catch(()=>{});
      sendAudit(s.email,'seeded demo data');
    }
  }
  const clearAllEl = document.getElementById('clearAll');
  if(clearAllEl){
    clearAllEl.onclick = ()=>{ 
      if(!confirm('Clear all demo data?')) return; 
      toast('Clearing demo data (server-side not implemented yet)');
      fetch('/MediTrust/?action=clearDemo', { method: 'POST' })
        .then(()=>{ refreshUsers(); })
        .catch(()=>{});
      sendAudit(s.email,'cleared demo data');
    }
  }

  // helper to execute SQL on the server and render the response (returns a promise)
  function executeQueryString(query){
    if(!query){ toast('Empty query'); return Promise.resolve({ error: 'empty' }); }
    const formData = new FormData();
    formData.append('query', query);
    return fetch('/MediTrust/?action=executeQuery', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('queryResult').textContent = 'Error: ' + data.error;
      } else if (data.message) {
        // Prefer explicit server message when available
        document.getElementById('queryResult').textContent = data.message;
      } else if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
        // Show structured data as JSON
        document.getElementById('queryResult').textContent = JSON.stringify(data, null, 2);
      } else {
        // Generic success fallback
        document.getElementById('queryResult').textContent = 'Successful';
      }
      return data;
    })
    .catch(error => {
      console.error('Error executing query:', error);
      document.getElementById('queryResult').textContent = 'Error executing query';
      return { error: error.message };
    });
  }

  // Quick-action buttons for users table
  document.getElementById('addUser').onclick = ()=>{
    const name = prompt('Full name:'); if(!name) return;
    const email = prompt('Email:'); if(!email) return;
    const role = prompt('Role (admin/doctor/patient):','patient') || 'patient';
    const password = prompt('Password (will be stored as provided in demo):','password123') || '';
    // simple escaping for single quotes
    const esc = v => v.replaceAll("'","''");
    const q = `INSERT INTO users (name, email, role, password) VALUES ('${esc(name)}','${esc(email)}','${esc(role)}','${esc(password)}');`;
    executeQueryString(q).then((data)=>{ refreshUsers(); sendAudit(s.email,'added user '+email); if(data && data.message){ toast(data.message); } else { toast('Successful'); } });
  };
  document.getElementById('updateUser').onclick = ()=>{
    const email = prompt('Email of user to update:'); if(!email) return;
    const newRole = prompt('New role (admin/doctor/patient):'); if(!newRole) return;
    if(!confirm(`Change role of ${email} to ${newRole}?`)) return;
    const q = `UPDATE users SET role = '${newRole.replaceAll("'","''")}' WHERE email = '${email.replaceAll("'","''")}'`;
    executeQueryString(q).then((data)=>{ refreshUsers(); sendAudit(s.email,'updated user '+email+' role->'+newRole); if(data && data.message){ toast(data.message); } else { toast('Successful'); } });
  };
  document.getElementById('changeName').onclick = ()=>{
    const email = prompt('Email of user to rename:'); if(!email) return;
    const newName = prompt('New full name:'); if(!newName) return;
    if(!confirm(`Change name of ${email} to ${newName}?`)) return;
    const q = `UPDATE users SET name = '${newName.replaceAll("'","''")}' WHERE email = '${email.replaceAll("'","''")}'`;
    executeQueryString(q).then((data)=>{ refreshUsers(); sendAudit(s.email,'renamed user '+email+' -> '+newName); if(data && data.message){ toast(data.message); } else { toast('Successful'); } });
  };
  document.getElementById('deleteUser').onclick = ()=>{
    const email = prompt('Email of user to delete:'); if(!email) return;
    if(!confirm(`Delete user with email ${email}? This is destructive.`)) return;
    const q = `DELETE FROM users WHERE email = '${email.replaceAll("'","''")}'`;
    executeQueryString(q).then((data)=>{ refreshUsers(); sendAudit(s.email,'deleted user '+email); if(data && data.message){ toast(data.message); } else { toast('Successful'); } });
  };
  
  sendAudit(s.email,'viewed admin dashboard');
}

function renderDoctor(s){ // s is the session object
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <h4>Doctor tools</h4>
    <div class="grid">
      <div>
        <div class="small-muted">Your appointments</div>
        <table class="table" id="apptTable"><thead><tr><th>When</th><th>Patient</th><th>Email</th><th>Reason</th></tr></thead><tbody></tbody></table>
      </div>
      <div>
        <div class="small-muted">Prescriptions</div>
        <label class="label">Patient email</label><input id="pres_patient" class="input" />
        <label class="label">Prescription</label><textarea id="pres_text" class="input" rows="4"></textarea>
        <div style="margin-top:8px" class="row"><button class="btn" id="writePres">Save prescription</button></div>
        <div style="margin-top:12px" class="small-muted">Recent prescriptions</div>
        <div id="presList"></div>
      </div>
    </div>
  `;
  dashContent.appendChild(wrapper);
  const tbody = document.querySelector('#apptTable tbody');

  // TODO: fetch doctor's appointments from PHP endpoint /MediTrust/doctorAppointments
  fetch(`/MediTrust/?action=doctorAppointments&doctorEmail=${s.email}`)
    .then(response => response.json())
    .then(appts => {
      tbody.innerHTML = appts.map(a=>`<tr><td>${a.when}</td><td>${a.patient}</td><td>${a.patientEmail}</td><td>${a.reason}</td></tr>`).join('') || '<tr><td colspan="4" class="small-muted">No appointments</td></tr>';
    })
    .catch(error => {
      console.error('Error fetching doctor appointments:', error);
      tbody.innerHTML = '<tr><td colspan="4">Error loading appointments.</td></tr>';
    });

  function refreshPres(){
    // TODO: fetch doctor's prescriptions from PHP endpoint /MediTrust/doctorPrescriptions
    fetch(`/MediTrust/?action=doctorPrescriptions&doctorEmail=${s.email}`)
      .then(response => response.json())
      .then(pres => {
        document.getElementById('presList').innerHTML = pres.map(p=>`<div class="code"><strong>${p.patient} (${p.patientEmail})</strong> — ${p.when}<div>${p.text}</div></div>`).join('<br/>') || '<div class="small-muted">No prescriptions</div>';
      })
      .catch(error => {
        console.error('Error fetching doctor prescriptions:', error);
        document.getElementById('presList').innerHTML = '<div class="small-muted">Error loading prescriptions</div>';
      });
  }
  refreshPres();
  document.getElementById('writePres').onclick = ()=>{
    const patient = document.getElementById('pres_patient').value.trim().toLowerCase();
    const text = document.getElementById('pres_text').value.trim();
    if(!patient || !text){ toast('Provide patient email and prescription text'); return; }
    
    // TODO: Validate patient existence via PHP endpoint
    // TODO: Send prescription to PHP endpoint /MediTrust/savePrescription
    const formData = new FormData();
    formData.append('doctorEmail', s.email);
    formData.append('patientEmail', patient);
    formData.append('text', text);
    formData.append('when', now());

    fetch('/MediTrust/?action=savePrescription', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === "Prescription saved.") {
        sendAudit(s.email,'wrote prescription for '+patient); 
        toast('Saved'); refreshPres();
        document.getElementById('pres_patient').value=''; document.getElementById('pres_text').value='';
      } else {
        toast(data.message || 'Error saving prescription');
      }
    })
    .catch(error => {
      console.error('Error saving prescription:', error);
      toast('An error occurred while saving prescription.');
    });
  }

  sendAudit(s.email,'viewed doctor dashboard');
}

function renderPatient(s){ // s is the session object
  if(!s || !s.email){
    toast('Session error, please sign in again');
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <h4>Patient portal</h4>
    <div class="grid">
      <div>
        <div class="small-muted">Book appointment</div>
        <label class="label">Select doctor</label>
        <select id="selDoc" class="input"></select>
        <label class="label">When (e.g. 2025-12-01)</label><input id="apptWhen" class="input" placeholder="YYYY-MM-DD" />
        <label class="label">Reason</label><input id="apptReason" class="input" />
        <div style="margin-top:8px" class="row"><button class="btn" id="bookAppt">Book</button></div>
        <div style="margin-top:12px" class="small-muted">Your upcoming</div>
        <div id="yourAppts"></div>
      </div>
      <div>
        <div class="small-muted">Ambulance request</div>
        <label class="label">Pickup location</label><input id="amb_loc" class="input" />
        <label class="label">Emergency type</label><input id="amb_reason" class="input" />
        <div style="margin-top:8px" class="row"><button class="btn" id="reqAmb">Request ambulance</button></div>
        <div style="margin-top:12px" class="small-muted">Subscription</div>
        <div class="row" style="margin-top:6px">
          <button class="btn" id="subscribeBtn">Subscribe (demo)</button>
          <div class="small-muted" id="subStatus" style="margin-left:8px"></div>
        </div>
      </div>
    </div>
    <div style="margin-top:12px" class="small-muted">Prescriptions</div>
    <div id="prescriptions"></div>
  `;
  dashContent.appendChild(wrapper);
  // fill doctor list
  // TODO: fetch doctors from PHP endpoint /MediTrust/doctors
  fetch('/MediTrust/?action=doctors')
    .then(response => response.json())
    .then(docs => {
      const sel = document.getElementById('selDoc');
      sel.innerHTML = docs.map(d=>`<option value="${d.email}">${d.name} — ${d.email}</option>`).join('');
    })
    .catch(error => {
      console.error('Error fetching doctors:', error);
      document.getElementById('selDoc').innerHTML = '<option value="">Error loading doctors</option>';
    });

  // appointments data
  function refreshAppts(){ 
    // TODO: fetch patient's appointments from PHP endpoint /MediTrust/patientAppointments
    fetch(`/MediTrust/?action=patientAppointments&patientEmail=${s.email}`)
      .then(response => response.json())
      .then(myAppts => {
        document.getElementById('yourAppts').innerHTML = myAppts.map(a=>`<div class="code">${a.when} — ${a.doctor}<div>${a.reason}</div></div>`).join('<br/>') || '<div class="small-muted">No appointments</div>'; 
      })
      .catch(error => {
        console.error('Error fetching patient appointments:', error);
        document.getElementById('yourAppts').innerHTML = '<div class="small-muted">Error loading appointments</div>';
      });
  }
  refreshAppts();
  document.getElementById('bookAppt').onclick = ()=>{
    const when = document.getElementById('apptWhen').value.trim();
    const reason = document.getElementById('apptReason').value.trim();
    const doctor = document.getElementById('selDoc').value;
    if(!when || !reason || !doctor){ toast('Complete appointment info'); return; }
    // simple ISO-ish check
    if(!/^\d{4}-\d{2}-\d{2}$/.test(when)){ toast('Date/time must be like YYYY-MM-DD'); return; }
    
    // TODO: Send appointment to PHP endpoint /MediTrust/bookAppointment
    const formData = new FormData();
    formData.append('patientEmail', s.email);
    formData.append('doctorEmail', doctor);
    formData.append('reason', reason);
    formData.append('when', when);

    fetch('/MediTrust/?action=bookAppointment', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === "Appointment booked.") {
        sendAudit(s.email,'booked appt with '+doctor+' at '+when); 
        toast('Appointment booked'); refreshAppts();
        document.getElementById('apptWhen').value=''; document.getElementById('apptReason').value='';
      } else {
        toast(data.message || 'Error booking appointment');
      }
    })
    .catch(error => {
      console.error('Error booking appointment:', error);
      toast('An error occurred while booking appointment.');
    });
  }
  // ambulance
  document.getElementById('reqAmb').onclick = ()=>{
    const loc = document.getElementById('amb_loc').value.trim();
    const reason = document.getElementById('amb_reason').value.trim();
    if(!loc || !reason){ toast('Provide pickup location and emergency type'); return; }
    
    // TODO: Send ambulance request to PHP endpoint /MediTrust/requestAmbulance
    const formData = new FormData();
    formData.append('patientEmail', s.email);
    formData.append('location', loc);
    formData.append('reason', reason);
    formData.append('when', now());

    fetch('/MediTrust/?action=requestAmbulance', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === "Ambulance requested.") {
        sendAudit(s.email,'requested ambulance'); 
        toast('Ambulance requested — status: requested');
        document.getElementById('amb_loc').value=''; document.getElementById('amb_reason').value='';
      } else {
        toast(data.message || 'Error requesting ambulance');
      }
    })
    .catch(error => {
      console.error('Error requesting ambulance:', error);
      toast('An error occurred while requesting ambulance.');
    });
  }
  // subscription demo
  function refreshSub(){ 
    // TODO: fetch subscription status from PHP endpoint /MediTrust/subscriptionStatus
    fetch(`/MediTrust/?action=subscriptionStatus&patientEmail=${s.email}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('subStatus').textContent = data.status ? 'Active' : 'None';
      })
      .catch(error => {
        console.error('Error fetching subscription status:', error);
        document.getElementById('subStatus').textContent = 'Error loading status.';
      });
  }
  refreshSub();
  document.getElementById('subscribeBtn').onclick = ()=>{ 
    // TODO: Send subscription request to PHP endpoint /MediTrust/subscribe
    const formData = new FormData();
    formData.append('patientEmail', s.email);
    formData.append('plan', 'demo');
    formData.append('since', now());

    fetch('/MediTrust/?action=subscribe', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if(data.message === "Subscription activated.") {
        sendAudit(s.email,'subscribed demo plan'); 
        refreshSub(); 
        toast('Subscription activated (demo)');
      } else {
        toast(data.message || 'Error activating subscription');
      }
    })
    .catch(error => {
      console.error('Error activating subscription:', error);
      toast('An error occurred while activating subscription.');
    });
  }
  // prescriptions view
  // TODO: fetch patient's prescriptions from PHP endpoint /MediTrust/patientPrescriptions
  fetch(`/MediTrust/?action=patientPrescriptions&patientEmail=${s.email}`)
    .then(response => response.json())
    .then(prescriptions => {
      document.getElementById('prescriptions').innerHTML = prescriptions.map(p=>`<div class="code"><strong>${p.doctor}</strong> — ${p.when}<div>${p.text}</div></div>`).join('<br/>') || '<div class="small-muted">No prescriptions</div>';
    })
    .catch(error => {
      console.error('Error fetching patient prescriptions:', error);
      document.getElementById('prescriptions').innerHTML = '<div class="small-muted">Error loading prescriptions</div>';
    });
  sendAudit(s.email,'viewed patient dashboard');
}

// Chatbox - improved canned replies and quick actions
// Chat open / send handlers (guarded)
function openChat(){ 
  const chatAreaEl = document.getElementById('chatArea'); if(chatAreaEl && chatAreaEl.classList) chatAreaEl.classList.remove('hidden');
  if(dashboard && dashboard.classList) dashboard.classList.add('hidden');
}
onClickIfExists('goChat', openChat);

onClickIfExists('chatSend', ()=>{
  const qel = document.getElementById('chatInput'); if(!qel) return; const q = qel.value.trim(); if(!q) return;
  appendChat('user', q);
  setTimeout(()=>{
    const reply = chatReply(q);
    appendChat('bot', reply);
    if(q.toLowerCase().includes('book appointment')){ toast('Tip: Go to Dashboard → Book appointment to book with a doctor'); }
    if(q.toLowerCase().includes('request ambulance')){ toast('Tip: Dashboard → Ambulance request (fill pickup & emergency type)'); }
    if(q.toLowerCase().includes('doctor info')){ toast('Tip: View doctors list in your dashboard'); }
    getSession().then(s => { sendAudit(s?.email || 'anon', 'used chat: ' + q.slice(0, 80)); });
  }, 400 + Math.random()*700);
  qel.value='';
});
function appendChat(who, text){
  const box = document.getElementById('chatBox');
  const el = document.createElement('div'); if(who==='user'){ el.style.textAlign='right'; el.innerHTML = `<div class="code">${escapeHtml(text)}</div>`; } else { el.innerHTML = `<div class="code"><strong>Assistant:</strong><div>${escapeHtml(text)}</div></div>`; }
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function chatReply(q){
  q = q.toLowerCase();
  // TODO: fetch dynamic data from PHP endpoints for 'doctor info' if needed
  if(q.includes('fever')||q.includes('temperature')) return "I'm not a doctor. For fever: rest, hydrate, take paracetamol/ibuprofen per instructions. Seek medical help if fever > 3 days or very high.";
  if(q.includes('covid')) return "If you suspect COVID-19: isolate, get tested if available, and follow local public health guidance. Contact your doctor for severe symptoms.";
  if(q.includes('appointment')) return "You can book an appointment from your dashboard — choose a doctor, date/time, and provide a reason.";
  if(q.includes('ambulance')||q.includes('emergency')) return "If this is a real emergency, call your local emergency number immediately. In the app, Dashboard → Ambulance request to submit pickup & type.";
  if(q.includes('doctor info')){
    // This part would ideally fetch from server, but for now, static or very basic
    // For a real app, this would be a fetch to /MediTrust/doctorsList
    return "Please refer to the 'Book Appointment' section in your dashboard for doctor information.";
  }
  if(q.includes('faq')) return "FAQs: 1) How to book? Use Dashboard → Book appointment. 2) How to request ambulance? Dashboard → Ambulance request. 3) How to get prescriptions? Your doctor can upload them.";
  // default helpful reply with suggestions
  return "Sorry I cannot fully help — this is a demo assistant. Try: 'book appointment', 'doctor info', 'request ambulance', 'faq', 'fever' or 'covid'.";
}

// Init UI: if session exists, show logged in state
(function initUI(){
  getSession().then(s => { // Use async getSession
    if(s){ 
      updateAuthUI(); 
      // dashWelcome.textContent = 'Welcome, '+s.name.split(' ')[0]; // Handled by updateAuthUI and renderDashboard
      // renderDashboard(); // updateAuthUI already calls renderDashboard
    }
    document.getElementById('mainArea').classList.remove('hidden');
  });
})();
});


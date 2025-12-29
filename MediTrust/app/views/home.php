<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MediTrust</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">
  <div class="card" id="leftPanel">
    <div class="brand">
      <div class="logo">MT</div>
      <div><h2>MediTrust</h2><small></small></div>
    </div>

    <div id="authArea">
      <!-- Signup -->
      <div id="signupBox">
        <h3>Create Account</h3>
        <label class="label">Full name</label><input id="su_name" class="input" placeholder="First Last" />
        <label class="label">Email</label><input id="su_email" class="input" type="email" placeholder="you@example.com" />
        <label class="label">Password</label><input id="su_pass" class="input" type="password" placeholder="min 8 characters" />
        <label class="label">Confirm Password</label><input id="su_pass2" class="input" type="password" />
        <label class="label">Role</label>
        <select id="su_role" class="input">
          <option value="">-- select role --</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <div id="signupError" class="error hidden"></div>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="signupBtn">Sign Up</button>
          <button class="link" id="toSignin">Already have an account?</button>
        </div>
        <div class="hr"></div>
      </div>

      <!-- Signin -->
      <div id="signinBox" class="hidden">
        <h3>Sign In</h3>
        <label class="label">Email</label><input id="si_email" class="input" type="email" />
        <label class="label">Password</label><input id="si_pass" class="input" type="password" />
        <div id="signinError" class="error hidden"></div>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="signinBtn">Sign In</button>
          <button class="link" id="toSignup">Create Account</button>
        </div>
        <button class="link" id="toForgot">Forgot Password?</button>
        <div class="hr"></div>
      </div>

      <!-- Forgot -->
      <div id="forgotBox" class="hidden">
        <h3>Reset Password</h3>
        <label class="label">Enter your email</label><input id="fg_email" class="input" type="email" />
        <div id="fgError" class="error hidden"></div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="sendCodeBtn">Send Code</button>
          <button class="link" id="fg_back">Back</button>
        </div>
        <div class="hr"></div>
      </div>

      <!-- Reset -->
      <div id="resetBox" class="hidden">
        <h3>Enter New Password</h3>
        <label class="label">Verification Code</label><input id="rc_code" class="input" />
        <label class="label">New Password</label><input id="rc_pass" class="input" type="password" />
        <label class="label">Confirm New Password</label><input id="rc_pass2" class="input" type="password" />
        <div id="rcError" class="error hidden"></div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="resetBtn">Reset Password</button>
          <button class="link" id="reset_cancel">Cancel</button>
        </div>
        <div class="hr"></div>
      </div>

      <!-- Logged-in -->
      <div id="loggedBox" class="hidden">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div class="row" style="align-items:center">
            <div class="avatar" id="userAvatar">U</div>
            <div style="margin-left:8px">
              <div id="userName"></div>
              <small id="userRole" class="small-muted"></small>
            </div>
          </div>
          <div class="row">
            <button class="link" id="openAudit">Audit</button>
            <button class="btn" id="logoutBtn">Logout</button>
          </div>
        </div>
        <div class="hr"></div>
        <h4>Quick Actions</h4>
        <div class="row">
          <button class="btn" id="goDashboard">Dashboard</button>
          <button class="link" id="goChat">AI Chat</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Panel -->
  <div class="card">
    <div id="mainArea">
      <h2>Welcome to MediTrust</h2>
      <p class="small-muted">A New Hospital Environment</p>

      <!-- Dashboard -->
      <div id="dashboard" class="hidden">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3 id="dashTitle"></h3>
            <div class="small-muted" id="dashWelcome"></div>
          </div>
          <div class="row">
            <div class="badge" id="dashBadge"></div>
          </div>
        </div>
        <div id="dashContent" style="margin-top:14px"></div>
      </div>

      <!-- Audit -->
      <div id="auditArea" class="hidden">
        <h3>Audit Logs</h3>
        <table class="table" id="auditTable">
          <thead><tr><th>Time</th><th>User</th><th>Action</th></tr></thead><tbody></tbody>
        </table>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="closeAudit">Close</button>
          <button class="link hidden" id="exportAudit">Export JSON</button>
        </div>
      </div>

      <!-- Chat -->
      <div id="chatArea" class="hidden">
        <h3>AI Chat (Demo)</h3>
        <div class="chat-box" id="chatBox"></div>
        <div class="row" style="margin-top:8px">
          <input id="chatInput" class="input" placeholder="Ask a medical-related question or use quick actions" />
          <button class="btn" id="chatSend">Send</button>
        </div>
        <div class="form-note">Quick actions: type <code>book appointment</code>, <code>doctor info</code>, <code>request ambulance</code>, or <code>faq</code>.</div>
      </div>

    </div>
  </div>
</div>

<div id="toast" class="toast hidden"></div>

<script src="js/main.js"></script>
</body>
</html>
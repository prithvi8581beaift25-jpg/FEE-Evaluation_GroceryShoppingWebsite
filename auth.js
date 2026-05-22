// ===== AUTH MODAL =====

// ── Validation helpers ──────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldState(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("input-error");
    if (errorEl) errorEl.textContent = message;
  } else {
    inputEl.classList.remove("input-error");
    if (errorEl) errorEl.textContent = "";
  }
}

// Attach live-validation listeners once the modal content is ready
function attachLoginValidation() {
  var emailEl    = document.getElementById("loginEmail");
  var passwordEl = document.getElementById("loginPassword");
  var errEl      = document.getElementById("loginError");
  if (!emailEl) return;

  emailEl.addEventListener("blur", function() {
    var v = emailEl.value.trim();
    if (!v) {
      setFieldState(emailEl, null, true);
    } else if (!isValidEmail(v)) {
      setFieldState(emailEl, errEl, "Enter a valid email address");
    } else {
      setFieldState(emailEl, errEl, "");
    }
  });
  emailEl.addEventListener("input", function() {
    if (emailEl.classList.contains("input-error") && isValidEmail(emailEl.value.trim())) {
      setFieldState(emailEl, errEl, "");
    }
  });

  passwordEl.addEventListener("blur", function() {
    if (!passwordEl.value) setFieldState(passwordEl, errEl, "Password is required");
    else setFieldState(passwordEl, errEl, "");
  });
  passwordEl.addEventListener("input", function() {
    if (passwordEl.classList.contains("input-error") && passwordEl.value) {
      setFieldState(passwordEl, errEl, "");
    }
  });
}

function attachSignupValidation() {
  var nameEl     = document.getElementById("signupName");
  var emailEl    = document.getElementById("signupEmail");
  var passwordEl = document.getElementById("signupPassword");
  var confirmEl  = document.getElementById("signupConfirm");
  var errEl      = document.getElementById("signupError");
  if (!nameEl) return;

  nameEl.addEventListener("blur", function() {
    if (!nameEl.value.trim()) setFieldState(nameEl, errEl, "Full name is required");
    else setFieldState(nameEl, errEl, "");
  });
  nameEl.addEventListener("input", function() {
    if (nameEl.classList.contains("input-error") && nameEl.value.trim()) setFieldState(nameEl, errEl, "");
  });

  emailEl.addEventListener("blur", function() {
    var v = emailEl.value.trim();
    if (!v) setFieldState(emailEl, errEl, "Email is required");
    else if (!isValidEmail(v)) setFieldState(emailEl, errEl, "Enter a valid email address");
    else setFieldState(emailEl, errEl, "");
  });
  emailEl.addEventListener("input", function() {
    if (emailEl.classList.contains("input-error") && isValidEmail(emailEl.value.trim())) setFieldState(emailEl, errEl, "");
  });

  passwordEl.addEventListener("blur", function() {
    var v = passwordEl.value;
    if (!v) setFieldState(passwordEl, errEl, "Password is required");
    else if (v.length < 6) setFieldState(passwordEl, errEl, "Password must be at least 6 characters");
    else setFieldState(passwordEl, errEl, "");
  });
  passwordEl.addEventListener("input", function() {
    if (passwordEl.classList.contains("input-error") && passwordEl.value.length >= 6) setFieldState(passwordEl, errEl, "");
    // Re-check confirm match live
    if (confirmEl.value && confirmEl.classList.contains("input-error") && confirmEl.value === passwordEl.value) {
      setFieldState(confirmEl, errEl, "");
    }
  });

  confirmEl.addEventListener("blur", function() {
    if (!confirmEl.value) setFieldState(confirmEl, errEl, "Please confirm your password");
    else if (confirmEl.value !== passwordEl.value) setFieldState(confirmEl, errEl, "Passwords do not match");
    else setFieldState(confirmEl, errEl, "");
  });
  confirmEl.addEventListener("input", function() {
    if (confirmEl.classList.contains("input-error") && confirmEl.value === passwordEl.value) setFieldState(confirmEl, errEl, "");
  });
}


function openAuthModal(tab) {
  var modal = document.getElementById("authModal");
  if (!modal) return;
  modal.style.display = "flex";
  switchAuthTab(tab || "login");
  // Attach validators once (guards are inside each fn)
  attachLoginValidation();
  attachSignupValidation();
}

function closeAuthModal() {
  var modal = document.getElementById("authModal");
  if (modal) modal.style.display = "none";
  clearAuthErrors();
}

function switchAuthTab(tab) {
  var loginTab   = document.getElementById("loginTab");
  var signupTab  = document.getElementById("signupTab");
  var loginForm  = document.getElementById("loginForm");
  var signupForm = document.getElementById("signupForm");
  if (!loginTab) return;

  if (tab === "login") {
    loginTab.classList.add("active-tab");
    signupTab.classList.remove("active-tab");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    signupTab.classList.add("active-tab");
    loginTab.classList.remove("active-tab");
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }
  clearAuthErrors();
}

function clearAuthErrors() {
  ["loginError","signupError"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  // Also strip red borders
  ["loginEmail","loginPassword","signupName","signupEmail","signupPassword","signupConfirm"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
  });
}

function handleLogin() {
  var emailEl   = document.getElementById("loginEmail");
  var passwordEl= document.getElementById("loginPassword");
  var errEl     = document.getElementById("loginError");
  var btn       = document.getElementById("loginBtn");
  var email     = emailEl.value.trim();
  var password  = passwordEl.value;
  var valid     = true;

  if (!email) {
    setFieldState(emailEl, errEl, "Email is required"); valid = false;
  } else if (!isValidEmail(email)) {
    setFieldState(emailEl, errEl, "Enter a valid email address"); valid = false;
  } else {
    setFieldState(emailEl, null, "");
  }

  if (!password) {
    setFieldState(passwordEl, errEl, "Password is required"); valid = false;
  } else {
    setFieldState(passwordEl, null, "");
  }

  if (!valid) return;

  btn.textContent = "Signing in…";
  btn.disabled = true;

  fetch(API_BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
  .then(function(res) {
    btn.textContent = "Sign In";
    btn.disabled = false;
    if (!res.ok) { errEl.textContent = res.data.error || "Login failed"; return; }
    saveAuth(res.data.token, res.data.user);
    closeAuthModal();
    updateNavAuth();
    syncCartFromBackend(function() { updateCartCount(); });
    showToast("👋 " + res.data.message);
  })
  .catch(function() {
    btn.textContent = "Sign In";
    btn.disabled = false;
    errEl.textContent = "Could not reach server. Is it running?";
  });
}

function handleSignup() {
  var nameEl     = document.getElementById("signupName");
  var emailEl    = document.getElementById("signupEmail");
  var passwordEl = document.getElementById("signupPassword");
  var confirmEl  = document.getElementById("signupConfirm");
  var errEl      = document.getElementById("signupError");
  var btn        = document.getElementById("signupBtn");
  var name       = nameEl.value.trim();
  var email      = emailEl.value.trim();
  var password   = passwordEl.value;
  var confirm    = confirmEl.value;
  var valid      = true;

  if (!name) {
    setFieldState(nameEl, errEl, "Full name is required"); valid = false;
  } else { setFieldState(nameEl, null, ""); }

  if (!email) {
    setFieldState(emailEl, errEl, "Email is required"); valid = false;
  } else if (!isValidEmail(email)) {
    setFieldState(emailEl, errEl, "Enter a valid email address"); valid = false;
  } else { setFieldState(emailEl, null, ""); }

  if (!password) {
    setFieldState(passwordEl, errEl, "Password is required"); valid = false;
  } else if (password.length < 6) {
    setFieldState(passwordEl, errEl, "Password must be at least 6 characters"); valid = false;
  } else { setFieldState(passwordEl, null, ""); }

  if (!confirm) {
    setFieldState(confirmEl, errEl, "Please confirm your password"); valid = false;
  } else if (confirm !== password) {
    setFieldState(confirmEl, errEl, "Passwords do not match"); valid = false;
  } else { setFieldState(confirmEl, null, ""); }

  if (!valid) return;

  btn.textContent = "Creating account…";
  btn.disabled = true;

  fetch(API_BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, email: email, password: password })
  })
  .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
  .then(function(res) {
    btn.textContent = "Create Account";
    btn.disabled = false;
    if (!res.ok) { errEl.textContent = res.data.error || "Signup failed"; return; }
    saveAuth(res.data.token, res.data.user);
    closeAuthModal();
    updateNavAuth();
    showToast("🎉 " + res.data.message);
  })
  .catch(function() {
    btn.textContent = "Create Account";
    btn.disabled = false;
    errEl.textContent = "Could not reach server. Is it running?";
  });
}

// Close on backdrop click
window.addEventListener("click", function(e) {
  var modal = document.getElementById("authModal");
  if (modal && e.target === modal) closeAuthModal();
});
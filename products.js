// ===== FRESHMART API CONFIG =====
var API_BASE = "http://localhost:3001/api";

// Global products array (populated from API)
var allProducts = [];

// ── Auth helpers ──────────────────────────────────────────────
function getToken() { return localStorage.getItem("fm_token"); }
function getUser()  { var u = localStorage.getItem("fm_user"); return u ? JSON.parse(u) : null; }
function isLoggedIn() { return !!getToken(); }

function saveAuth(token, user) {
  localStorage.setItem("fm_token", token);
  localStorage.setItem("fm_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("fm_token");
  localStorage.removeItem("fm_user");
}

function authHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() };
}

// ── Load products from backend ────────────────────────────────
function loadAllProducts(onReady) {
  fetch(API_BASE + "/products")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allProducts = data.products || [];
      if (typeof onReady === "function") onReady();
    })
    .catch(function(err) {
      console.error("Backend unreachable:", err);
      showBackendError();
      if (typeof onReady === "function") onReady();
    });
}

function showBackendError() {
  var grid = document.getElementById("productGrid");
  if (grid) {
    grid.innerHTML =
      '<div class="loader-wrap" style="grid-column:1/-1">' +
        '<p style="font-size:2rem">⚠️</p>' +
        '<p><strong>Backend not running.</strong></p>' +
        '<p style="font-size:0.85rem;color:#64748b">Start the server: <code>cd freshmart-backend && npm start</code></p>' +
      '</div>';
  }
}

// ── Update nav with user info ─────────────────────────────────
function updateNavAuth() {
  var user = getUser();
  var authBtns = document.getElementById("authButtons");
  var userMenu = document.getElementById("userMenu");
  var userName = document.getElementById("userName");
  var mobileAuth = document.getElementById("mobileAuthButtons");
  var mobileUser = document.getElementById("mobileUserRow");
  var mobileUserName = document.getElementById("mobileUserName");

  if (!authBtns) return;

  if (user) {
    authBtns.style.display = "none";
    if (userMenu) userMenu.style.display = "flex";
    if (userName) userName.textContent = "Hi, " + user.name.split(" ")[0] + " 👋";
    if (mobileAuth) mobileAuth.style.display = "none";
    if (mobileUser) mobileUser.style.display = "flex";
    if (mobileUserName) mobileUserName.textContent = "👋 " + user.name.split(" ")[0];
  } else {
    authBtns.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";
    if (mobileAuth) mobileAuth.style.display = "flex";
    if (mobileUser) mobileUser.style.display = "none";
  }
}

function logout() {
  clearAuth();
  updateNavAuth();
  showToast("👋 Logged out");
  setTimeout(function() { window.location.href = "index.html"; }, 800);
}

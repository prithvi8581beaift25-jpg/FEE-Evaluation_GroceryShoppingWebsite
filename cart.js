// ===== FRESHMART FRONTEND CART LOGIC =====

var appliedCoupon = null;
var appliedDiscount = 0;
var originalCart = [];

// ── On page load ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  if (isLoggedIn()) {
    syncCartFromBackend(function () {
      renderCart();
    });
  } else {
    renderCart();
  }
});

// ── Render cart items and summary ─────────────────────────────
function renderCart() {
  var cart = getCart();
  originalCart = cart.slice();

  var emptyEl      = document.getElementById("emptyCart");
  var contentEl    = document.getElementById("cartContent");
  var countEl      = document.getElementById("cartItemCount");
  var listEl       = document.getElementById("cartItemsList");

  if (!cart.length) {
    emptyEl.style.display  = "flex";
    contentEl.style.display = "none";
    updateCartCount();
    return;
  }

  emptyEl.style.display  = "none";
  contentEl.style.display = "grid";

  var totalItems = cart.reduce(function (s, i) { return s + i.qty; }, 0);
  countEl.textContent = totalItems + " item" + (totalItems !== 1 ? "s" : "") + " in your cart";

  listEl.innerHTML = "";
  cart.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<img src="' + item.img + '" alt="' + item.name + '" class="cart-item-img"/>' +
      '<div class="cart-item-info">' +
        '<h3 class="cart-item-name">' + item.name + '</h3>' +
        '<p class="cart-item-unit">₹' + item.price + ' / ' + item.unit + '</p>' +
      '</div>' +
      '<div class="cart-item-controls">' +
        '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)">−</button>' +
        '<span class="qty-display">' + item.qty + '</span>' +
        '<button class="qty-btn" onclick="changeQty(' + item.id + ', 1)">+</button>' +
      '</div>' +
      '<div class="cart-item-price">₹' + (item.price * item.qty) + '</div>' +
      '<button class="remove-btn" onclick="removeItem(' + item.id + ')">✕</button>';
    listEl.appendChild(row);
  });

  updateSummary();
  updateCartCount();
}

// ── Update order summary panel ────────────────────────────────
function updateSummary() {
  var cart     = getCart();
  var subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  var delivery = subtotal >= 500 ? 0 : 40;
  var discount = appliedDiscount;
  var total    = Math.max(0, subtotal + delivery - discount);

  document.getElementById("subtotal").textContent    = "₹" + subtotal;
  document.getElementById("deliveryFee").textContent = delivery === 0 ? "FREE" : "₹" + delivery;
  document.getElementById("grandTotal").textContent  = "₹" + total;

  var discRow = document.getElementById("discountRow");
  if (discount > 0) {
    discRow.style.display = "flex";
    document.getElementById("discountAmt").textContent = "-₹" + discount;
  } else {
    discRow.style.display = "none";
  }
}

// ── Change item quantity ──────────────────────────────────────
function changeQty(productId, delta) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].qty += delta;
      if (cart[i].qty < 1) {
        cart.splice(i, 1);
      }
      break;
    }
  }
  saveCart(cart);

  // Sync to backend
  if (isLoggedIn()) {
    var item = cart.find(function (c) { return c.id === productId; });
    if (item) {
      fetch(API_BASE + "/cart/" + productId, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ qty: item.qty })
      }).catch(function () {});
    } else {
      fetch(API_BASE + "/cart/" + productId, {
        method: "DELETE",
        headers: authHeaders()
      }).catch(function () {});
    }
  }

  renderCart();
}

// ── Remove item entirely ──────────────────────────────────────
function removeItem(productId) {
  var cart = getCart().filter(function (i) { return i.id !== productId; });
  saveCart(cart);

  if (isLoggedIn()) {
    fetch(API_BASE + "/cart/" + productId, {
      method: "DELETE",
      headers: authHeaders()
    }).catch(function () {});
  }

  showToast("Item removed from cart");
  renderCart();
}

// ── Clear entire cart ─────────────────────────────────────────
function clearCart() {
  saveCart([]);
  appliedCoupon   = null;
  appliedDiscount = 0;

  if (isLoggedIn()) {
    fetch(API_BASE + "/cart", {
      method: "DELETE",
      headers: authHeaders()
    }).catch(function () {});
  }

  showToast("Cart cleared");
  renderCart();
}

// ── Sort cart display ─────────────────────────────────────────
function sortCart() {
  var val  = document.getElementById("cartSort").value;
  var cart = getCart();

  if (val === "price-asc")  cart.sort(function (a, b) { return a.price - b.price; });
  if (val === "price-desc") cart.sort(function (a, b) { return b.price - a.price; });
  if (val === "name-asc")   cart.sort(function (a, b) { return a.name.localeCompare(b.name); });
  if (val === "qty-desc")   cart.sort(function (a, b) { return b.qty - a.qty; });
  if (val === "default")    cart = originalCart.slice();

  saveCart(cart);
  renderCart();
}

// ── Coupon logic ──────────────────────────────────────────────
var VALID_COUPONS = { FRESH10: 10, SAVE20: 20, MART50: 50 };

function applyCoupon() {
  var code  = document.getElementById("couponInput").value.trim().toUpperCase();
  var msgEl = document.getElementById("couponMsg");

  if (!code) { msgEl.textContent = "Enter a promo code."; msgEl.className = "coupon-msg error"; return; }

  if (VALID_COUPONS[code]) {
    var pct     = VALID_COUPONS[code];
    var cart    = getCart();
    var subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    appliedCoupon   = code;
    appliedDiscount = Math.round(subtotal * pct / 100);
    msgEl.textContent = "✅ " + code + " applied — " + pct + "% off!";
    msgEl.className   = "coupon-msg success";
    updateSummary();
  } else {
    appliedCoupon   = null;
    appliedDiscount = 0;
    msgEl.textContent = "❌ Invalid promo code.";
    msgEl.className   = "coupon-msg error";
    updateSummary();
  }
}

// ── Checkout: open address modal ──────────────────────────────
function checkout() {
  if (!isLoggedIn()) {
    openAuthModal("login");
    return;
  }
  var cart = getCart();
  if (!cart.length) { showToast("Your cart is empty!"); return; }
  document.getElementById("addressModal").style.display = "flex";
}

function closeAddressModal() {
  document.getElementById("addressModal").style.display = "none";
  document.getElementById("addrError").textContent = "";
}

function selectPay(radio) {
  document.querySelectorAll(".pay-opt").forEach(function (el) { el.classList.remove("active-pay"); });
  radio.parentElement.classList.add("active-pay");
}

function clearFieldError(fieldId) {
  var el = document.getElementById(fieldId + "Err");
  if (el) el.textContent = "";
}

// ── Place order ───────────────────────────────────────────────
function submitAddress() {
  var name   = document.getElementById("addrName").value.trim();
  var phone  = document.getElementById("addrPhone").value.trim();
  var street = document.getElementById("addrStreet").value.trim();
  var city   = document.getElementById("addrCity").value.trim();
  var state  = document.getElementById("addrState").value.trim();
  var pin    = document.getElementById("addrPin").value.trim();
  var note   = document.getElementById("addrNote").value.trim();
  var payment = document.querySelector("input[name='payment']:checked");
  var errEl  = document.getElementById("addrError");

  // Validate
  var valid = true;
  function fieldErr(id, msg) { document.getElementById(id + "Err").textContent = msg; valid = false; }

  if (!name)                      fieldErr("addrName",  "Name is required");
  if (!phone || phone.length < 10) fieldErr("addrPhone", "Enter a valid phone number");
  if (!street)                    fieldErr("addrStreet", "Street address is required");
  if (!city)                      fieldErr("addrCity",  "City is required");
  if (!state)                     fieldErr("addrState", "State is required");
  if (!pin || pin.length !== 6)   fieldErr("addrPin",   "Enter a valid 6-digit pincode");

  if (!valid) return;

  var address = { name: name, phone: phone, street: street, city: city, state: state, pin: pin, note: note, payment: payment ? payment.value : "cod" };

  var btn = document.querySelector("#addressModal .checkout-btn");
  btn.textContent = "Placing order…";
  btn.disabled    = true;
  errEl.textContent = "";

  fetch(API_BASE + "/orders", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ address: address, coupon: appliedCoupon })
  })
  .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
  .then(function (res) {
    btn.textContent = "Place Order →";
    btn.disabled    = false;

    if (!res.ok) {
      errEl.textContent = res.data.error || "Failed to place order. Please try again.";
      return;
    }

    // Clear local cart
    saveCart([]);
    appliedCoupon   = null;
    appliedDiscount = 0;

    // Close address modal, show confirmation
    closeAddressModal();
    document.getElementById("modalOrderId").textContent   = "Order ID: " + res.data.order.id;
    document.getElementById("modalAddress").textContent   = address.street + ", " + address.city + " – " + address.pin;
    document.getElementById("checkoutModal").style.display = "flex";

    updateCartCount();
  })
  .catch(function () {
    btn.textContent = "Place Order →";
    btn.disabled    = false;
    errEl.textContent = "Could not reach server. Is it running?";
  });
}

// ── Close confirmation modal ──────────────────────────────────
function closeModal() {
  document.getElementById("checkoutModal").style.display = "none";
  window.location.href = "index.html";
}

// ── Mobile menu toggle (used in navbar) ───────────────────────
function toggleMenu() {
  var menu = document.getElementById("mobileMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

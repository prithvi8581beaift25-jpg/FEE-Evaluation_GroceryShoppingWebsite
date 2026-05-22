// ===== CART UTILITIES (Backend-aware) =====

function getCart() {
  var stored = localStorage.getItem("freshmart_cart");
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem("freshmart_cart", JSON.stringify(cart));
}

function addToCart(productId) {
  var product = null;
  for (var i = 0; i < allProducts.length; i++) {
    if (allProducts[i].id === productId) { product = allProducts[i]; break; }
  }
  if (!product) return;

  // Update local cart
  var cart = getCart();
  var found = false;
  for (var j = 0; j < cart.length; j++) {
    if (cart[j].id === productId) { cart[j].qty += 1; found = true; break; }
  }
  if (!found) {
    cart.push({ id: product.id, name: product.name, price: product.price, unit: product.unit, img: product.img, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  if (typeof updateCardQtyDisplay === 'function') updateCardQtyDisplay(productId);
  showToast("✅ " + product.name + " added to cart!");

  // Sync to backend if logged in
  if (isLoggedIn()) {
    fetch(API_BASE + "/cart", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId, qty: 1 })
    }).catch(function() {});
  }
}

function updateCartCount() {
  var cart = getCart();
  var total = cart.reduce(function(s, i) { return s + i.qty; }, 0);
  var el = document.getElementById("cartCount");
  var cartBtn = document.querySelector(".cart-btn");
  if (el) {
    el.textContent = total;
    if (total > 0) {
      el.classList.add("bump");
      setTimeout(function() { el.classList.remove("bump"); }, 300);
    }
  }
  if (cartBtn) {
    if (total > 0) cartBtn.classList.add("has-items");
    else cartBtn.classList.remove("has-items");
  }
}

function showToast(msg) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2500);
}

// Sync backend cart into localStorage on login
function syncCartFromBackend(callback) {
  if (!isLoggedIn()) { if (callback) callback(); return; }
  fetch(API_BASE + "/cart", { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var cart = (data.cart || []).map(function(item) {
        return { id: item.product_id, name: item.name, price: item.price, unit: item.unit, img: item.img, qty: item.qty };
      });
      saveCart(cart);
      updateCartCount();
      if (callback) callback();
    })
    .catch(function() { if (callback) callback(); });
}

// Run on page load
updateCartCount();
updateNavAuth();

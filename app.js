// ===== SHOP PAGE LOGIC =====

var currentCategory = "all";
var currentSearch = "";
var currentMaxPrice = 500;
var currentSort = "default";
var displayedProducts = [];

function renderProducts(products) {
  var grid = document.getElementById("productGrid");
  var empty = document.getElementById("emptyState");
  var count = document.getElementById("resultsCount");
  if (!grid) return;

  displayedProducts = products;
  count.textContent = "Showing " + products.length + " item" + (products.length !== 1 ? "s" : "");

  if (products.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = "";

  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var stars = getStars(p.rating);
    var card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", p.id);
    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="product-img-wrap"><img src="' + p.img + '" alt="' + p.name + '" class="product-img" loading="lazy"/></div>' +
        '<div class="product-info">' +
          '<h3 class="product-name">' + p.name + '</h3>' +
          '<p class="product-desc">' + p.desc + '</p>' +
          '<div class="product-meta">' +
            '<span class="stars">' + stars + '</span>' +
            '<span class="rating-num">(' + p.rating + ')</span>' +
            (p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '') +
          '</div>' +
          '<div class="product-footer">' +
            '<div class="price-block">' +
              '<span class="price">₹' + p.price + '</span>' +
              '<span class="unit">/ ' + p.unit + '</span>' +
            '</div>' +
            '<div class="card-footer-wrap">' +
            '<button class="add-btn" id="add-btn-' + p.id + '" onclick="addToCart(' + p.id + ')">+ Add</button>' +
            '<div class="card-qty-bar" id="qty-bar-' + p.id + '" style="display:none">' +
              '<button class="card-qty-btn" onclick="changeCardQty(' + p.id + ', -1)">−</button>' +
              '<span class="card-qty-num" id="qty-num-' + p.id + '">0</span>' +
              '<button class="card-qty-btn" onclick="changeCardQty(' + p.id + ', 1)">+</button>' +
            '</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
    updateCardQtyDisplay(p.id);
  }
}

function getStars(rating) {
  var full = Math.floor(rating);
  var half = (rating - full) >= 0.5 ? 1 : 0;
  var empty = 5 - full - half;
  var s = "";
  for (var i = 0; i < full; i++) s += "★";
  if (half) s += "½";
  for (var j = 0; j < empty; j++) s += "☆";
  return s;
}

function applyFilters() {
  var filtered = [];
  for (var i = 0; i < allProducts.length; i++) {
    var p = allProducts[i];
    var matchCat = (currentCategory === "all" || p.category === currentCategory);
    var matchSearch = (p.name.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1 ||
                       p.desc.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1);
    var matchPrice = (p.price <= currentMaxPrice);
    if (matchCat && matchSearch && matchPrice) {
      filtered.push(p);
    }
  }

  // Sort
  if (currentSort === "price-asc") {
    filtered.sort(function(a, b) { return a.price - b.price; });
  } else if (currentSort === "price-desc") {
    filtered.sort(function(a, b) { return b.price - a.price; });
  } else if (currentSort === "name-asc") {
    filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
  } else if (currentSort === "name-desc") {
    filtered.sort(function(a, b) { return b.name.localeCompare(a.name); });
  } else if (currentSort === "rating") {
    filtered.sort(function(a, b) { return b.rating - a.rating; });
  }

  renderProducts(filtered);
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  var buttons = document.querySelectorAll(".cat-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
  btn.classList.add("active");
  applyFilters();
}

function filterSearch() {
  currentSearch = document.getElementById("searchBar").value;
  applyFilters();
}

function sortProducts() {
  currentSort = document.getElementById("sortSelect").value;
  applyFilters();
}

function filterPrice(val) {
  currentMaxPrice = parseInt(val);
  document.getElementById("priceLabel").textContent = "₹" + val;
  applyFilters();
}

function toggleMenu() {
  var menu = document.getElementById("mobileMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// ===== CARD QTY CONTROLS =====
function changeCardQty(productId, delta) {
  var cart = getCart();
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      found = true;
      break;
    }
  }
  if (!found && delta > 0) {
    var product = null;
    for (var j = 0; j < allProducts.length; j++) {
      if (allProducts[j].id === productId) { product = allProducts[j]; break; }
    }
    if (product) {
      cart.push({ id: product.id, name: product.name, price: product.price, unit: product.unit, img: product.img, qty: 1 });
    }
  }
  saveCart(cart);
  updateCartCount();
  updateCardQtyDisplay(productId);
  if (isLoggedIn()) {
    var qty = 0;
    for (var k = 0; k < cart.length; k++) { if (cart[k].id === productId) { qty = cart[k].qty; break; } }
    if (qty > 0) {
      fetch(API_BASE + "/cart", { method: "POST", headers: authHeaders(), body: JSON.stringify({ product_id: productId, qty: delta }) }).catch(function(){});
    } else {
      fetch(API_BASE + "/cart/" + productId, { method: "DELETE", headers: authHeaders() }).catch(function(){});
    }
  }
}

function updateCardQtyDisplay(productId) {
  var cart = getCart();
  var qty = 0;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) { qty = cart[i].qty; break; }
  }
  var btn = document.getElementById("add-btn-" + productId);
  var bar = document.getElementById("qty-bar-" + productId);
  var num = document.getElementById("qty-num-" + productId);
  if (!btn) return;
  if (qty > 0) {
    btn.style.display = "none";
    if (bar) bar.style.display = "flex";
    if (num) num.textContent = qty;
  } else {
    btn.style.display = "";
    if (bar) bar.style.display = "none";
  }
}

function updateAllCardQtyDisplays() {
  var cart = getCart();
  var cartMap = {};
  for (var i = 0; i < cart.length; i++) cartMap[cart[i].id] = cart[i].qty;
  for (var j = 0; j < allProducts.length; j++) {
    updateCardQtyDisplay(allProducts[j].id);
  }
}

// ===== NUTRITION MODAL =====
function showNutrition(productId) {
  var product = null;
  for (var i = 0; i < allProducts.length; i++) {
    if (allProducts[i].id === productId) { product = allProducts[i]; break; }
  }
  if (!product) return;
  var modal = document.getElementById("nutritionModal");
  if (!modal) return;
  document.getElementById("nutritionTitle").textContent = product.name;
  document.getElementById("nutritionImg").src = product.img;
  var grid = document.getElementById("nutritionGrid");
  grid.innerHTML = "";
  if (product.badge) {
    var b = document.createElement("div");
    b.className = "nutrition-item";
    b.innerHTML = '<span class="nutrition-name">Badge</span><span class="nutrition-val">' + product.badge + '</span>';
    grid.appendChild(b);
  }
  var fields = [["Category", product.category], ["Price", "₹" + product.price + " / " + product.unit], ["Rating", product.rating + " ★"], ["Stock", (product.stock || "—") + " units"]];
  fields.forEach(function(f) {
    var item = document.createElement("div");
    item.className = "nutrition-item";
    item.innerHTML = '<span class="nutrition-name">' + f[0] + '</span><span class="nutrition-val">' + f[1] + '</span>';
    grid.appendChild(item);
  });
  modal.style.display = "flex";
}
function closeNutritionModal() {
  var m = document.getElementById("nutritionModal");
  if (m) m.style.display = "none";
}

// ===== LOADER =====
function showLoader() {
  var grid = document.getElementById("productGrid");
  if (grid) grid.innerHTML = '<div class="loader-wrap"><div class="spinner"></div><p>Loading fresh products…</p></div>';
}

// Init
showLoader();
loadAllProducts(function() { applyFilters(); });

// ===== SLIDESHOW =====
(function () {
  var slides = document.querySelectorAll(".slide");
  var dotsContainer = document.getElementById("slideDots");
  var current = 0;
  var dots = [];

  if (!slides.length || !dotsContainer) return;

  // Build dot buttons
  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement("button");
    dot.className = "slide-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("data-index", i);
    dot.onclick = (function(idx) {
      return function() { goTo(idx); };
    })(i);
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function goTo(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  // Auto-advance every 3.5 seconds
  setInterval(function () {
    goTo(current + 1);
  }, 3500);
})();
